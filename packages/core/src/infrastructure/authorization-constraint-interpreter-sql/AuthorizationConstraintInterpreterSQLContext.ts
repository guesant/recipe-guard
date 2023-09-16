import { DialectOptions, pg } from "@ucast/sql";
import {
  AuthorizationConstraintRecipeType,
  IAuthorizationConstraintRecipe,
} from "../../domain/authorization-constraints";
import { IAuthorizationConstraintInterpreterSQLContextOptions } from "./IAuthorizationConstraintInterpreterSQLContextOptions";

export class AuthorizationConstraintInterpreterSQLContext {
  dbDialect: DialectOptions;

  #allParams: unknown[] = [];

  #paramsCount = 0;

  constructor(
    readonly authorizationConstraintRecipe: IAuthorizationConstraintRecipe,
    readonly options: IAuthorizationConstraintInterpreterSQLContextOptions = {}
  ) {
    const { dbDialect = pg } = options;
    this.dbDialect = dbDialect;
  }

  get dialect() {
    return {
      ...this.dbDialect,
      escapeField: this.escapeField,
      joinRelation: this.joinRelation,
      paramPlaceholder: this.paramPlaceholder,
    };
  }

  getParams = () => Array.from(this.#allParams);

  paramPlaceholder = () => {
    const targetIndex = this.#paramsCount++;
    return this.dbDialect.paramPlaceholder(targetIndex);
  };

  addParams = (params: unknown[]) => {
    this.#allParams.push(...params);
  };

  private get baseEntities() {
    const baseEntities = this.options.getBaseEntities?.() ?? [];
    return [...baseEntities];
  }

  escapeField = (field: string) => {
    const handledField = this.options.escapeField?.(field) ?? null;

    if (typeof handledField === "string") {
      return handledField;
    }

    if (this.baseEntities.includes(field)) {
      return field;
    }

    return this.dbDialect.escapeField(field);
  };

  joinRelation = (entity: string) => {
    const { authorizationConstraintRecipe } = this;

    const baseEntities = this.baseEntities;

    switch (authorizationConstraintRecipe.type) {
      case AuthorizationConstraintRecipeType.BOOLEAN: {
        return false;
      }

      case AuthorizationConstraintRecipeType.FILTER: {
        const rootAlias = authorizationConstraintRecipe.alias;
        const rootJoins = authorizationConstraintRecipe.joins ?? [];

        const allEntitiesAliases = [
          // ...
          ...baseEntities,
          rootAlias,
          ...rootJoins.map((i) => i.alias),
        ];

        return allEntitiesAliases.includes(entity);
      }
    }
  };
}
