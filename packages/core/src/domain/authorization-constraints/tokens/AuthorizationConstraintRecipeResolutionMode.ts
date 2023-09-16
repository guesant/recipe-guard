export enum AuthorizationConstraintRecipeResolutionMode {
  CASL_ONLY = 'casl_only',
  RESOLVE_AND_MERGE = 'merge', // OR
  RESOLVE_AND_EXCLUDE = 'exclude', // NOT
  RESOLVE_AND_INTERSECT = 'intersection', // AND
}
