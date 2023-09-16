import {
  AuthorizationConstraintRecipeResolutionMode,
  AuthorizationConstraintRecipeType,
} from "../tokens";

export interface IAuthorizationConstraintBaseRecipe<
  T extends AuthorizationConstraintRecipeType
> {
  /**
   * @description Type of the recipe
   */
  type: T;

  resolutionMode: AuthorizationConstraintRecipeResolutionMode;
}
