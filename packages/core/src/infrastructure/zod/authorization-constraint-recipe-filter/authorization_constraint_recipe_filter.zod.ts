import { z } from "zod";
import { AuthorizationConstraintRecipeType } from "../../../domain/authorization-constraints";
import { AuthorizationConstraintAliasZod } from "../tokens/authorization_constraint_alias.zod";
import { AuthorizationConstraintRecipeFilterConditionZod } from "./authorization_constraint_recipe_filter_condition.zod";
import { AuthorizationConstraintRecipeFilterJoinZod } from "./authorization_constraint_recipe_filter_join.zod";

export const AuthorizationConstraintRecipeFilterZod = z
  .object({
    type: z.literal(AuthorizationConstraintRecipeType.FILTER),

    alias: AuthorizationConstraintAliasZod,
    joins: z.array(AuthorizationConstraintRecipeFilterJoinZod),

    condition: AuthorizationConstraintRecipeFilterConditionZod,

    resolutionModeCaslForbid: z.boolean().optional(),
  })
  .strict();
