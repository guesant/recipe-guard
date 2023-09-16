import { z } from "zod";
import { AuthorizationConstraintRecipeType } from "../../../domain/authorization-constraints";
import { AuthorizationConstraintBaseRecipeZod } from "../authorization-constraint-base-recipe/authorization_constraint_base_recipe.zod";

export const AuthorizationConstraintRecipeBooleanZod =
  AuthorizationConstraintBaseRecipeZod.extend({
    type: z.literal(AuthorizationConstraintRecipeType.BOOLEAN),
    value: z.boolean(),
  }).strict();
