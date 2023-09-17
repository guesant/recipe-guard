import { IRecipeGuardBaseAppResource } from "./IRecipeGuardBaseAppResource";
import { IRecipeGuardBaseAppResourceDatabaseTypeorm } from "./IRecipeGuardBaseAppResourceDatabaseTypeorm";

export type IRecipeGuardAppResourceTypeorm<IEntity, IRepository, IManager> =
  IRecipeGuardBaseAppResource<
    IRecipeGuardBaseAppResourceDatabaseTypeorm<IEntity, IRepository, IManager>
  >;
