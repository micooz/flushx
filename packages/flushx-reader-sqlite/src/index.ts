import { Context, IReaderPlugin, ReaderExecuteResult, PluginConfig, ReaderExecuteInput } from 'flushx';
import { Logger } from 'flushx-utils';
import * as sqlite from 'better-sqlite3';

const logger = Logger.scope('flushx-reader-sqlite');

export default class SqliteReaderPlugin implements IReaderPlugin {

  config: SqliteReaderPluginConfig;

  db: sqlite.Database;

  select: sqlite.Statement;

  async init(config: SqliteReaderPluginConfig): Promise<void> {
    const { file, table } = config;

    if (!table) {
      throw Error('table name must be set');
    }

    // open sqlite db
    this.db = sqlite(file);

    // prepare select statement
    this.select = this.db.prepare(`SELECT * FROM ${table} WHERE timestamp >= @from AND timestamp <= @to`);

    this.config = config;
  }

  async dispose(): Promise<void> {
    const { file } = this.config;
    if (this.db) {
      logger.info(`close database connection from: ${file}`);
      this.db.close();
    }
  }

  async execute(_ctx: Context, input: ReaderExecuteInput): Promise<ReaderExecuteResult> {
    const { startTimestamp, endTimestamp } = input;

    const result = this.select.all({
      from: startTimestamp,
      to: endTimestamp,
    });

    return result.map(item => {
      try {
        item.data = JSON.parse(item.data);
        return item;
      } catch (err) {
        return null;
      }
    }).filter(Boolean);
  }

}

export interface SqliteReaderPluginConfig extends PluginConfig {
  /**
   * sqlite file path
   */
  file: string;

  /**
   * table name
   */
  table: string;
}
