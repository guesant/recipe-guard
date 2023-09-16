import { z } from "zod";
import { AuthorizationConstraintRecipeBooleanZod } from "../authorization-constraint-recipe-boolean/authorization_constraint_recipe_boolean.zod";
import { AuthorizationConstraintRecipeFilterZod } from "../authorization-constraint-recipe-filter/authorization_constraint_recipe_filter.zod";

export const AuthorizationConstraintRecipeZod = z.discriminatedUnion("type", [
  AuthorizationConstraintRecipeBooleanZod,
  AuthorizationConstraintRecipeFilterZod,
]);
