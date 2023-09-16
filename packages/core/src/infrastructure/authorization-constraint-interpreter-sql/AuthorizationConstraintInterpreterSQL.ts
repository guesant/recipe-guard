import { FieldQueryOperators } from "@ucast/core";
import { allParsingInstructions, MongoQueryParser } from "@ucast/mongo";
import { allInterpreters, createSqlInterpreter } from "@ucast/sql";
import {
  AuthorizationConstraintRecipeType,
  IAuthorizationConstraintInterpretedSQL,
  IAuthorizationConstraintInterpretedSQLJoin,
  IAuthorizationConstraintRecipe,
  IAuthorizationConstraintRecipeFilterCondition,
} from "../../domain/authorization-constraints";
import { AuthorizationConstraintInterpreterSQLContext } from "./AuthorizationConstraintInterpreterSQLContext";
import { IAuthorizationConstraintInterpreterSQLContextOptions } from "./IAuthorizationConstraintInterpreterSQLContextOptions";

const interpret = createSqlInterpreter({ ...allInterpreters });

const parser = new MongoQueryParser(
  allParsingInstructions as Record<string, any>
);

export class AuthorizationConstraintInterpreterSQL {
  constructor(
    readonly contextOptions: IAuthorizationConstraintInterpreterSQLContextOptions = {}
  ) {}

  parseFilterCondition(
    filterCondition: IAuthorizationConstraintRecipeFilterCondition
  ) {
    return parser.parse(filterCondition as FieldQueryOperators<any>);
  }

  interpret(
    authorizationConstraintRecipe: IAuthorizationConstraintRecipe
  ): IAuthorizationConstraintInterpretedSQL {
    switch (authorizationConstraintRecipe.type) {
      case AuthorizationConstraintRecipeType.FILTER: {
        const root_alias = authorizationConstraintRecipe.alias;
        const root_joins = authorizationConstraintRecipe.joins ?? [];

        const rootCondition = this.parseFilterCondition(
          authorizationConstraintRecipe.condition
        );

        const authorizationConstraintInterpreterContext =
          new AuthorizationConstraintInterpreterSQLContext(
            authorizationConstraintRecipe,
            this.contextOptions
          );

        const [interpreted_root_sql, interpreted_root_params] = interpret(
          rootCondition,
          {
            ...authorizationConstraintInterpreterContext.dialect,
            rootAlias: root_alias,
          }
        );

        authorizationConstraintInterpreterContext.addParams(
          interpreted_root_params
        );

        const joins = root_joins.map(
          (join): IAuthorizationConstraintInterpretedSQLJoin => {
            const joinCondition = this.parseFilterCondition(join.condition);

            const [interpreted_join_sql, interpreted_join_params] = interpret(
              joinCondition,
              {
                ...authorizationConstraintInterpreterContext.dialect,
                rootAlias: join.alias,
              }
            );

            authorizationConstraintInterpreterContext.addParams(
              interpreted_join_params
            );

            const interpretedJoinSQL: IAuthorizationConstraintInterpretedSQLJoin =
              {
                mode: join.mode,
                resource: join.resource,
                alias: join.alias,
                on: interpreted_join_sql,
              };

            return interpretedJoinSQL;
          }
        );

        const params = Object.fromEntries(
          Object.entries(authorizationConstraintInterpreterContext.getParams())
        );

        const authorizationConstraintInterpretedSQL: IAuthorizationConstraintInterpretedSQL =
          {
            alias: root_alias,
            condition: interpreted_root_sql,
            joins: joins,
            params: params,
          };

        return authorizationConstraintInterpretedSQL;
      }

      case AuthorizationConstraintRecipeType.BOOLEAN:
      default: {
        const authorizationConstraintInterpretedSQL: IAuthorizationConstraintInterpretedSQL =
          {
            alias: "row",
            condition: authorizationConstraintRecipe.value ? "1=1" : "1=2",
            joins: [],
            params: {},
          };

        return authorizationConstraintInterpretedSQL;
      }
    }
  }
}
