export type IRecipeGuardTypeormAppResourceDatabase<
  IEntity,
  IRepository,
  IManager
> = {
  getTypeormEntity: () => IEntity;
  getTypeormRepositoryFactory: () => (manager: IManager) => IRepository;
};
