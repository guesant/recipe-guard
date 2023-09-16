import { AuthorizationConstraintJoinMode } from "../tokens";

export type IAuthorizationConstraintInterpretedSQLJoin = {
  /**
   * The mode of the join.
   */
  mode: AuthorizationConstraintJoinMode;

  /**
   * The resource or entity identifier. Note that this may be different than the actual table name in the database.
   */
  resource: string;

  /**
   * The resource alias. This is used to generate the SQL query in `condition`.
   */
  alias: string;

  /**
   * The SQL condition.
   */
  on: string;
};
