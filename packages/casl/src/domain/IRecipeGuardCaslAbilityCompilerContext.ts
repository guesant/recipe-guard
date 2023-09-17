import {
  IAuthorizationConstraintRecipe,
  IRecipeGuardBaseAppResource,
} from "#recipe-guard-core";

export interface IRecipeGuardCaslAbilityCompilerContext {
  getResolvedIdsByAppResourceAuthorizationConstraintRecipe<Id = unknown>(
    appResource: IRecipeGuardBaseAppResource<any>,
    authorizationConstraintRecipeRaw: IAuthorizationConstraintRecipe,
    targetEntityId: unknown | null
  ): Promise<Id[]>;
}
