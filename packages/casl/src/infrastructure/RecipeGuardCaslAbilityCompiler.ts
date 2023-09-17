import {
  AuthorizationConstraintRecipeResolutionMode,
  AuthorizationConstraintRecipeType,
  IAuthorizationConstraintRecipe,
  IRecipeGuardContext,
} from "#recipe-guard-core";
import { AbilityBuilder, AnyAbility, createMongoAbility } from "@casl/ability";
import { IRecipeGuardCaslAbilityCompilerContext } from "../domain";

export class RecipeGuardCaslAbilityCompiler {
  constructor(
    readonly authorizationContext: IRecipeGuardContext<any>,
    readonly recipeGuardCaslAbilityCompilerContext: IRecipeGuardCaslAbilityCompilerContext
  ) {}

  async attachAuthorizationConstraintRecipeToCaslAbilityBuilder(
    abilityBuilder: AbilityBuilder<AnyAbility>,
    verbo: string,
    recurso: string,
    authorizationConstraintRecipe: IAuthorizationConstraintRecipe,
    targetEntityId: unknown | null = null
  ) {
    const { can: allow, cannot: forbid } = abilityBuilder;

    switch (authorizationConstraintRecipe.resolutionMode) {
      case AuthorizationConstraintRecipeResolutionMode.CASL_ONLY: {
        switch (authorizationConstraintRecipe.type) {
          case AuthorizationConstraintRecipeType.BOOLEAN: {
            if (authorizationConstraintRecipe.value) {
              allow(verbo, recurso);
            } else {
              forbid(verbo, recurso);
            }

            break;
          }

          case AuthorizationConstraintRecipeType.FILTER: {
            const forbidMode =
              authorizationConstraintRecipe.resolutionModeCaslForbid;

            if (forbidMode) {
              forbid(verbo, recurso, authorizationConstraintRecipe.condition);
            } else {
              allow(verbo, recurso, authorizationConstraintRecipe.condition);
            }

            break;
          }
        }

        break;
      }

      case AuthorizationConstraintRecipeResolutionMode.RESOLVE_AND_MERGE:
      case AuthorizationConstraintRecipeResolutionMode.RESOLVE_AND_EXCLUDE: {
        const appResource = await this.authorizationContext.getAppResource(
          recurso
        );

        if (!appResource) {
          break;
        }

        const resolvedIds =
          await this.recipeGuardCaslAbilityCompilerContext.getResolvedIdsByAppResourceAuthorizationConstraintRecipe(
            appResource,
            authorizationConstraintRecipe,
            targetEntityId
          );

        const condition = {
          id: {
            $in: [...resolvedIds],
          },
        };

        switch (authorizationConstraintRecipe.resolutionMode) {
          case AuthorizationConstraintRecipeResolutionMode.RESOLVE_AND_MERGE: {
            allow(verbo, recurso, condition);
            break;
          }

          case AuthorizationConstraintRecipeResolutionMode.RESOLVE_AND_EXCLUDE: {
            forbid(verbo, recurso, condition);
            break;
          }
        }
      }
    }

    return this;
  }

  async attachAuthorizationConstraintRecipesToCaslAbilityBuilder(
    abilityBuilder: AbilityBuilder<AnyAbility>,
    caslAction: string,
    caslSubject: string,
    authorizationConstraintRecipes: AsyncIterable<IAuthorizationConstraintRecipe>,
    targetEntityId: unknown | null = null
  ) {
    for await (const authorizationConstraintRecipe of authorizationConstraintRecipes) {
      await this.attachAuthorizationConstraintRecipeToCaslAbilityBuilder(
        abilityBuilder,
        caslAction,
        caslSubject,
        authorizationConstraintRecipe,
        targetEntityId
      );
    }

    return this;
  }

  async getCaslAbilityByAuthorizationConstraintRecipes(
    caslAction: string,
    caslSubject: string,
    authorizationConstraintRecipes: AsyncIterable<IAuthorizationConstraintRecipe>,
    targetEntityId: unknown | null = null
  ) {
    const abilityBuilder = new AbilityBuilder(createMongoAbility as any);

    await this.attachAuthorizationConstraintRecipesToCaslAbilityBuilder(
      abilityBuilder,
      caslAction,
      caslSubject,
      authorizationConstraintRecipes,
      targetEntityId
    );

    const ability = abilityBuilder.build({});

    return ability;
  }
}
