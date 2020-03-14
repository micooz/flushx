import { Context, IWriterPlugin, PluginConfig, ProcessorPluginExecuteResult } from 'flushx';
import { mapToJson } from 'flushx-utils';
import * as sqlite from 'better-sqlite3';

export default class SqliteWriterPlugin implements IWriterPlugin {

  db: sqlite.Database;

  insert: sqlite.Statement;

  async init(config: SqliteWriterPluginConfig): Promise<void> {
    const { file, table } = config;

    if (!table) {
      throw Error('table name must be set');
    }

    // open sqlite db
    this.db = sqlite(file);

    // create table if not exist
    this.db.prepare(
      `CREATE TABLE IF NOT EXISTS ${table}` +
      '(id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INT, data TEXT)'
    ).run();

    // prepare insert statement
    this.insert = this.db.prepare(`INSERT INTO ${table} (timestamp, data) VALUES (@timestamp, @data)`);
  }

  async dispose(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
  }

  execute(_ctx: Context, input: ProcessorPluginExecuteResult): void {
    const { period, data } = input;

    this.insert.run({
      timestamp: period.getTime(),
      data: JSON.stringify(mapToJson(data)),
    });
  }

}

export interface SqliteWriterPluginConfig extends PluginConfig {
  /**
   * sqlite file path
   */
  file: string;

  /**
   * table name
   */
  table: string;
}
