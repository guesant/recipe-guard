import {
  AuthorizationConstraintInterpreterSQL,
  AuthorizationConstraintJoinMode,
  AuthorizationConstraintRecipeResolutionMode,
  AuthorizationConstraintRecipeType,
  AuthorizationConstraintRecipeZod,
  IAuthorizationConstraintInterpreterSQLContextOptions,
  IAuthorizationConstraintRecipe,
  IRecipeGuardAppResourceTypeorm,
  IRecipeGuardContext,
} from "#recipe-guard-core";
import union from "lodash/union";
import without from "lodash/without";
import {
  DataSource,
  EntityManager,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from "typeorm";

export class RecipeGuardTypeormAppResourceQueryBuilder<
  Entity extends ObjectLiteral = ObjectLiteral,
  //
  RecipeGuardAppResourceTypeorm extends IRecipeGuardAppResourceTypeorm<
    Entity,
    Repository<Entity>,
    DataSource | EntityManager
  > = IRecipeGuardAppResourceTypeorm<
    Entity,
    Repository<Entity>,
    DataSource | EntityManager
  >
> {
  constructor(
    // ...
    readonly recipeGuardContext: IRecipeGuardContext<
      IRecipeGuardAppResourceTypeorm<any, any, DataSource | EntityManager>
    >,

    private authorizationConstraintInterpreterSQLContextOptions: IAuthorizationConstraintInterpreterSQLContextOptions,

    private manager: DataSource | EntityManager
  ) {}

  async createQueryBuilderByConstraintRecipe(
    appResource: RecipeGuardAppResourceTypeorm,
    authorizationConstraintRecipe: IAuthorizationConstraintRecipe,
    targetEntityId: unknown | null = null,
    resourceAlias = "resource"
  ): Promise<SelectQueryBuilder<Entity>> {
    const getResourceRepository =
      appResource.database.getTypeormRepositoryFactory();

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
        const dbDialect =
          this.authorizationConstraintInterpreterSQLContextOptions?.dbDialect ??
          null;

        if (!dbDialect) {
          throw new TypeError(
            "You must provide the interpreterSQLContextOptions.dbDialect"
          );
        }

        const authorizationConstraintInterpreterSQL =
          new AuthorizationConstraintInterpreterSQL({
            ...this.authorizationConstraintInterpreterSQLContextOptions,

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
          const joinAppResource = await this.recipeGuardContext.getAppResource(
            join.resource
          );

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

  async getResolvedIdsByAuthorizationConstraintRecipe<Id = unknown>(
    appResource: RecipeGuardAppResourceTypeorm,
    authorizationConstraintRecipeRaw: IAuthorizationConstraintRecipe,
    targetEntityId: unknown | null = null
  ): Promise<Id[]> {
    const validationResult = AuthorizationConstraintRecipeZod.safeParse(
      authorizationConstraintRecipeRaw
    );

    if (!validationResult.success) {
      return [];
    }

    const authorizationConstraintRecipe = <IAuthorizationConstraintRecipe>(
      validationResult.data
    );

    const qb = await this.createQueryBuilderByConstraintRecipe(
      appResource,
      authorizationConstraintRecipe,
      targetEntityId
    );

    const results = await qb.getMany();

    const ids = results.map((result) => result.id);

    return ids;
  }

  async getResolvedIdsByAuthorizationConstraintRecipes<Id = unknown>(
    appResource: RecipeGuardAppResourceTypeorm,
    authorizationConstraintRecipeIterable: AsyncIterable<IAuthorizationConstraintRecipe>,
    targetEntityId: unknown | null = null
  ): Promise<Id[]> {
    let allowedResources: Id[] | null = null;

    for await (const authorizationConstraintRecipeRaw of authorizationConstraintRecipeIterable) {
      const validationResult = AuthorizationConstraintRecipeZod.safeParse(
        authorizationConstraintRecipeRaw
      );

      if (!validationResult.success) {
        continue;
      }

      const authorizationConstraintRecipe = <IAuthorizationConstraintRecipe>(
        validationResult.data
      );

      const constraintAllowedResources =
        await this.getResolvedIdsByAuthorizationConstraintRecipe<Id>(
          appResource,
          authorizationConstraintRecipe,
          targetEntityId
        );

      switch (authorizationConstraintRecipe.resolutionMode) {
        case AuthorizationConstraintRecipeResolutionMode.RESOLVE_AND_MERGE: {
          if (allowedResources === null) {
            allowedResources = constraintAllowedResources;
          } else {
            allowedResources = union(
              allowedResources,
              constraintAllowedResources
            );
          }

          break;
        }

        case AuthorizationConstraintRecipeResolutionMode.RESOLVE_AND_EXCLUDE: {
          if (allowedResources !== null) {
            allowedResources = without(
              allowedResources,
              ...constraintAllowedResources
            );
          }

          break;
        }
      }
    }

    return allowedResources ?? [];
  }
}
