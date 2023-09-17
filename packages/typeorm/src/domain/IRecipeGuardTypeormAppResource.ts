import { IRecipeGuardTypeormAppResourceDatabase } from "./IRecipeGuardTypeormAppResourceDatabase";

export type IRecipeGuardTypeormAppResource<
  IResourceDatabase extends IRecipeGuardTypeormAppResourceDatabase<
    any,
    any,
    any
  > = IRecipeGuardTypeormAppResourceDatabase<any, any, any>
> = {
  key: string;
  database: IResourceDatabase;
};
