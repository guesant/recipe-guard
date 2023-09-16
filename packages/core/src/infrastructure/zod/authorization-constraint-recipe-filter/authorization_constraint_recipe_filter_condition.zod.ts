import { z } from 'zod';

export const AuthorizationConstraintRecipeFilterConditionZod = z.record(z.string(), z.any());
