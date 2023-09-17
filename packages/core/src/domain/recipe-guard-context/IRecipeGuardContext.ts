import { IRecipeGuardBaseAppResource } from "../app-resource";

export interface IRecipeGuardContext<
  RecipeGuardAppResource extends IRecipeGuardBaseAppResource<any>
> {
  getAppResource: (key: string) => Promise<RecipeGuardAppResource | null>;
}
