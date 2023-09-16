import { z } from "zod";
import { AuthorizationConstraintJoinMode } from "../../../domain/authorization-constraints";

export const AuthorizationConstraintRecipeFilterJoinModeZod = z.nativeEnum(
  AuthorizationConstraintJoinMode
);
