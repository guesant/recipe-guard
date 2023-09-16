import { IAuthorizationConstraintRecipeBoolean } from '../authorization-constraint-recipe-boolean';
import { IAuthorizationConstraintRecipeFilter } from '../authorization-constraint-recipe-filter';

export type IAuthorizationConstraintRecipe = IAuthorizationConstraintRecipeBoolean | IAuthorizationConstraintRecipeFilter;
