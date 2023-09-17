export type IRecipeGuardBaseAppResourceDatabaseTypeorm<
  IEntity,
  IRepository,
  IManager
> = {
  getTypeormEntity: () => IEntity;
  getTypeormRepositoryFactory: () => (manager: IManager) => IRepository;
};
