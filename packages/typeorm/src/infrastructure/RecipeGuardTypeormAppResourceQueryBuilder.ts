import {
  AuthorizationConstraintInterpreterSQL,
  AuthorizationConstraintJoinMode,
  AuthorizationConstraintRecipeType,
  IAuthorizationConstraintInterpreterSQLContextOptions,
  IAuthorizationConstraintRecipe,
} from "#recipe-guard-core";
import {
  DataSource,
  EntityManager,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import {
  IRecipeGuardTypeormAppResource,
  IRecipeGuardTypeormAppResourceDatabase,
} from "../domain";

export class RecipeGuardTypeormAppResourceQueryBuilder<
  Entity extends ObjectLiteral = ObjectLiteral,
  //
  RecipeGuardTypeormAppResourceDatabase extends IRecipeGuardTypeormAppResourceDatabase<
    Entity,
    Repository<Entity>,
    DataSource | EntityManager
  > = IRecipeGuardTypeormAppResourceDatabase<
    Entity,
    Repository<Entity>,
    DataSource | EntityManager
  >,
  //
  RecipeGuardTypeormAppResource extends IRecipeGuardTypeormAppResource<RecipeGuardTypeormAppResourceDatabase> = IRecipeGuardTypeormAppResource<RecipeGuardTypeormAppResourceDatabase>
> {
  constructor(
    // ...
    private manager: DataSource | EntityManager,

    private appResource: RecipeGuardTypeormAppResource,

    private getAppResource: (
      key: string
    ) => IRecipeGuardTypeormAppResource | null
  ) {}

  async createActorQueryBuilderByConstraintRecipe(
    interpreterSQLContextOptions: IAuthorizationConstraintInterpreterSQLContextOptions,
    authorizationConstraintRecipe: IAuthorizationConstraintRecipe,
    targetEntityId: unknown | null = null,
    resourceAlias = "resource"
  ): Promise<SelectQueryBuilder<Entity>> {
    const getResourceRepository =
      this.appResource.database.getTypeormRepositoryFactory();

    const resourceRepository = getResourceRepository(
      this.manager
    ) as Repository<Entity>;

    switch (authorizationConstraintRecipe.type) {
      case AuthorizationConstraintRecipeType.BOOLEAN: {
        const qb = resourceRepository.createQueryBuilder(resourceAlias);

        qb.select([`${resourceAlias}.id`]);

        qb.where(authorizationConstraintRecipe.value ? "TRUE" : "FALSE");

        if (authorizationConstraintRecipe.value && targetEntityId !== null) {
          qb.andWhere(`${resourceAlias}.id = :id`, { id: targetEntityId });
        }

        return qb;
      }

      case AuthorizationConstraintRecipeType.FILTER: {
        const dbDialect = interpreterSQLContextOptions?.dbDialect ?? null;

        if (!dbDialect) {
          throw new TypeError(
            "You must provide the interpreterSQLContextOptions.dbDialect"
          );
        }

        const authorizationConstraintInterpreterSQL =
          new AuthorizationConstraintInterpreterSQL({
            ...interpreterSQLContextOptions,

            dbDialect: {
              ...dbDialect,
              paramPlaceholder: (index: number) => `:${index}`,
            },
          });

        const interpretedConstraint =
          authorizationConstraintInterpreterSQL.interpret(
            authorizationConstraintRecipe
          );

        const qb = resourceRepository.createQueryBuilder(
          interpretedConstraint.alias
        );

        qb.select([`${interpretedConstraint.alias}.id`]);

        for (const join of interpretedConstraint.joins) {
          const joinAppResource = this.getAppResource(join.resource);

          if (joinAppResource) {
            const joinEntity = joinAppResource?.database.getTypeormEntity();

            if (joinEntity) {
              switch (join.mode) {
                case AuthorizationConstraintJoinMode.INNER: {
                  qb.innerJoin(joinEntity, join.alias, join.on);
                }
              }
            }
          }
        }

        qb.where(interpretedConstraint.condition);

        if (targetEntityId !== null) {
          qb.andWhere("id = :id", { id: targetEntityId });
        }

        qb.setParameters(interpretedConstraint.params);

        return qb;
      }
    }
  }
}
