import { DialectOptions } from '@ucast/sql';

export type IAuthorizationConstraintInterpreterSQLContextOptions = {
  dbDialect?: DialectOptions;

  escapeField?: (field: string) => string | null;

  getBaseEntities?: () => string[];
};
