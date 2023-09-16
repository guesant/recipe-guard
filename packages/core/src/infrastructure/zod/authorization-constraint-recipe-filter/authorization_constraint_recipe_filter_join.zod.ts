import { z } from "zod";
import { AuthorizationConstraintAliasZod } from "../tokens/authorization_constraint_alias.zod";
import { AuthorizationConstraintResourceZod } from "../tokens/authorization_constraint_resource.zod";
import { AuthorizationConstraintRecipeFilterConditionZod } from "./authorization_constraint_recipe_filter_condition.zod";
import { AuthorizationConstraintRecipeFilterJoinModeZod } from "./authorization_constraint_recipe_filter_join_mode.zod";

export const AuthorizationConstraintRecipeFilterJoinZod = z.object({
  mode: AuthorizationConstraintRecipeFilterJoinModeZod,

  resource: AuthorizationConstraintResourceZod,
  alias: AuthorizationConstraintAliasZod,

  condition: AuthorizationConstraintRecipeFilterConditionZod,
});
