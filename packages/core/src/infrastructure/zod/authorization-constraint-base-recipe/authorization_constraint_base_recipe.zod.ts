import { z } from "zod";
import { AuthorizationConstraintRecipeResolutionMode } from "../../../domain/authorization-constraints";

export const AuthorizationConstraintBaseRecipeZod = z.object({
  resolutionMode: z.nativeEnum(AuthorizationConstraintRecipeResolutionMode),
});
