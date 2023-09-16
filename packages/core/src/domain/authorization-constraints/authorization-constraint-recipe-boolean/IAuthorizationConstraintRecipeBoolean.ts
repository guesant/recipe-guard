import { IAuthorizationConstraintBaseRecipe } from "../authorization-constraint-base-recipe";
import { AuthorizationConstraintRecipeType } from "../tokens";

export interface IAuthorizationConstraintRecipeBoolean
  extends IAuthorizationConstraintBaseRecipe<AuthorizationConstraintRecipeType.BOOLEAN> {
  type: AuthorizationConstraintRecipeType.BOOLEAN;

  /**
   * The boolean value
   */
  value: boolean;
}
