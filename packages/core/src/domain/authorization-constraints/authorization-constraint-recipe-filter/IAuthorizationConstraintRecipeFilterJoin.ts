import { AuthorizationConstraintJoinMode } from "../tokens";
import { IAuthorizationConstraintRecipeFilterCondition } from "./IAuthorizationConstraintRecipeFilterCondition";

export type IAuthorizationConstraintRecipeFilterJoin = {
  mode: AuthorizationConstraintJoinMode;

  alias: string;
  resource: string;

  condition: IAuthorizationConstraintRecipeFilterCondition;
};
