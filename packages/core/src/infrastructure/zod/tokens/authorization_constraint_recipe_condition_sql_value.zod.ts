import { z } from 'zod';

export const AuthorizationConstraintRecipeConditionSQLValueZod = z.object({
  $field: z.string(),
});
