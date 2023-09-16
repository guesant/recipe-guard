import { IAuthorizationConstraintInterpretedSQLJoin } from "./IAuthorizationConstraintInterpretedSQLJoin";

export interface IAuthorizationConstraintInterpretedSQL {
  // /**
  //  * The resource or entity identifier. Note that this can be different than the actual table name in the database.
  //  * @example 'user'
  //  * @example 'photo'
  //  */
  // resource: string;

  /**
   * The resource alias. This is used to generate the SQL query in `condition`.
   */
  alias: string;

  /**
   * The SQL condition.
   */
  condition: string;

  /**
   * The relations to other resources.
   */
  joins: IAuthorizationConstraintInterpretedSQLJoin[];

  /**
   * The parameters to be used in the SQL query.
   */
  params: Record<string, unknown>;
}
