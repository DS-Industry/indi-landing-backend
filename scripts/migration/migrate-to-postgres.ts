import 'reflect-metadata';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { resolvePostgresSslFromEnv } from '../../src/infrastructure/database/postgres-ssl';

type SqlType = 'varchar' | 'text' | 'integer' | 'float' | 'boolean' | 'timestamp';

interface TableMigrationConfig {
  tableName: string;
  keyColumns: string[];
  columns: string[];
  columnTypes: Record<string, SqlType>;
}

interface ScriptConfig {
  batchSize: number;
  dryRun: boolean;
  regenerateIds: boolean;
  checkpointFile: string;
  reportFile: string;
}

interface Checkpoint {
  [tableName: string]: number;
}

interface MigrationStats {
  migrated: number;
  failed: number;
  lastOffset: number;
}

type IdMaps = Record<string, Map<number, number>>;

const CARD_TIER_DEFAULT = Number(process.env.MIGRATION_CARD_TIER_ID || 200);
const ORGANIZATION_DEFAULT = Number(process.env.MIGRATION_ORGANIZATION_ID || 1);

const TABLES: TableMigrationConfig[] = [
  {
    tableName: 'CRDCLIENT',
    keyColumns: ['CLIENT_ID'],
    columns: [
      'CLIENT_ID', 'NAME', 'INN', 'EMAIL', 'PHONE', 'BIRTHDAY', 'INS_DATE', 'UPD_DATE',
      'INS_USER_ID', 'UPD_USER_ID', 'CLIENT_TYPE_ID', 'NOTE', 'AVTO', 'IS_ACTIVATED',
      'DISCOUNT', 'GENDER_ID', 'CORRECT_PHONE', 'REFRESH_TOKEN', 'TOKEN_ID',
      'IS_TOKEN_VALID', 'ACTIVATED_DATE', 'IS_ACTIVATED_LIGHT', 'ACTIVATED_DATE_LIGHT',
      'IS_LK', 'TAG', 'USER_ONVI',
    ],
    columnTypes: {
      CLIENT_ID: 'integer',
      NAME: 'varchar',
      INN: 'varchar',
      EMAIL: 'varchar',
      PHONE: 'varchar',
      BIRTHDAY: 'timestamp',
      INS_DATE: 'timestamp',
      UPD_DATE: 'timestamp',
      INS_USER_ID: 'integer',
      UPD_USER_ID: 'integer',
      CLIENT_TYPE_ID: 'integer',
      NOTE: 'text',
      AVTO: 'varchar',
      IS_ACTIVATED: 'integer',
      DISCOUNT: 'integer',
      GENDER_ID: 'integer',
      CORRECT_PHONE: 'varchar',
      REFRESH_TOKEN: 'varchar',
      TOKEN_ID: 'varchar',
      IS_TOKEN_VALID: 'varchar',
      ACTIVATED_DATE: 'timestamp',
      IS_ACTIVATED_LIGHT: 'integer',
      ACTIVATED_DATE_LIGHT: 'timestamp',
      IS_LK: 'integer',
      TAG: 'varchar',
      USER_ONVI: 'integer',
    },
  },
  {
    tableName: 'CRDCARD',
    keyColumns: ['CARD_ID'],
    columns: [
      'CARD_ID', 'BALANCE', 'IS_LOCKED', 'DATE_BEGIN', 'DATE_END', 'CLIENT_ID', 'CARD_TYPE_ID',
      'DEV_NOMER', 'IS_DEL', 'AVTO', 'MONTH_LIMIT', 'DISCOUNT', 'GOS_NOMER', 'CMNCITY_ID',
      'REAL_BALANCE', 'AIR_BALANCE', 'KEY_BALANCE', 'NOMER', 'MODEL_ID', 'NOTE', 'TAG',
      'DAY_LIMIT', 'MAIN_CARD_ID',
    ],
    columnTypes: {
      CARD_ID: 'integer',
      BALANCE: 'integer',
      IS_LOCKED: 'integer',
      DATE_BEGIN: 'timestamp',
      DATE_END: 'timestamp',
      CLIENT_ID: 'integer',
      CARD_TYPE_ID: 'integer',
      DEV_NOMER: 'varchar',
      IS_DEL: 'integer',
      AVTO: 'varchar',
      MONTH_LIMIT: 'integer',
      DISCOUNT: 'integer',
      GOS_NOMER: 'varchar',
      CMNCITY_ID: 'integer',
      REAL_BALANCE: 'integer',
      AIR_BALANCE: 'integer',
      KEY_BALANCE: 'integer',
      NOMER: 'varchar',
      MODEL_ID: 'integer',
      NOTE: 'text',
      TAG: 'varchar',
      DAY_LIMIT: 'integer',
      MAIN_CARD_ID: 'integer',
    },
  },
  {
    tableName: 'CRDCARD_TYPE',
    keyColumns: ['CARD_TYPE_ID'],
    columns: [
      'CARD_TYPE_ID', 'NAME', 'CODE', 'BONUS', 'DISCOUNT', 'IS_BONUS', 'IS_DISCOUNT',
      'CREATE_DATE', 'UPDATE_DATE', 'CREATE_USER_ID', 'UPDATE_USER_ID', 'IS_UP', 'IS_DOWN',
      'TRANSFER_PERIOD', 'TRANSFER_DATE', 'UP_MONEY', 'DOWN_MONEY', 'UP_TYPE_ID', 'DOWN_TYPE_ID',
      'IS_CASH', 'GROUP_ID', 'IS_BIRTHDAY_BONUS', 'BIRTHDAY_BONUS', 'BONUS_ACQ',
      'IS_BONUS_ACQ', 'BONUS_ACTIVATE', 'IS_BONUS_ACTIVATE', 'PERIOD_FREEZE',
      'AMOUNT_FREEZE_YEAR', 'FREEZE_PRICE', 'COUNTRY_CODE',
    ],
    columnTypes: {
      CARD_TYPE_ID: 'integer',
      NAME: 'varchar',
      CODE: 'varchar',
      BONUS: 'integer',
      DISCOUNT: 'integer',
      IS_BONUS: 'integer',
      IS_DISCOUNT: 'integer',
      CREATE_DATE: 'timestamp',
      UPDATE_DATE: 'timestamp',
      CREATE_USER_ID: 'integer',
      UPDATE_USER_ID: 'integer',
      IS_UP: 'integer',
      IS_DOWN: 'integer',
      TRANSFER_PERIOD: 'integer',
      TRANSFER_DATE: 'timestamp',
      UP_MONEY: 'integer',
      DOWN_MONEY: 'integer',
      UP_TYPE_ID: 'integer',
      DOWN_TYPE_ID: 'integer',
      IS_CASH: 'integer',
      GROUP_ID: 'integer',
      IS_BIRTHDAY_BONUS: 'integer',
      BIRTHDAY_BONUS: 'integer',
      BONUS_ACQ: 'integer',
      IS_BONUS_ACQ: 'integer',
      BONUS_ACTIVATE: 'integer',
      IS_BONUS_ACTIVATE: 'integer',
      PERIOD_FREEZE: 'integer',
      AMOUNT_FREEZE_YEAR: 'integer',
      FREEZE_PRICE: 'integer',
      COUNTRY_CODE: 'integer',
    },
  },
  {
    tableName: 'INDIAN_CLIENT_PSW',
    keyColumns: ['ID'],
    columns: ['ID', 'CLIENT_ID', 'PASSWORD'],
    columnTypes: { ID: 'integer', CLIENT_ID: 'integer', PASSWORD: 'varchar' },
  },
  {
    tableName: 'INDIAN_EMAIL_CODE',
    keyColumns: ['ID'],
    columns: ['ID', 'EMAIL', 'PHONE', 'CONFIRM_CODE', 'CREATE_DATE', 'EXPIRE_DATE', 'REGISTRATION'],
    columnTypes: {
      ID: 'integer',
      EMAIL: 'varchar',
      PHONE: 'varchar',
      CONFIRM_CODE: 'varchar',
      CREATE_DATE: 'timestamp',
      EXPIRE_DATE: 'timestamp',
      REGISTRATION: 'integer',
    },
  },
  {
    tableName: 'INDIAN_SUBSCRIBE',
    keyColumns: ['ID'],
    columns: ['ID', 'CLIENT_ID', 'SUBSCRIBE_ID', 'CREATE_AT', 'STATUS', 'DATE_DEBITING'],
    columnTypes: {
      ID: 'integer',
      CLIENT_ID: 'integer',
      SUBSCRIBE_ID: 'varchar',
      CREATE_AT: 'timestamp',
      STATUS: 'varchar',
      DATE_DEBITING: 'timestamp',
    },
  },
  {
    tableName: 'INDIAN_PACK_MIN',
    keyColumns: ['ID'],
    columns: ['ID', 'NAME', 'DESCRIPTION', 'SUM_MONEY', 'SUM_POINT'],
    columnTypes: {
      ID: 'integer',
      NAME: 'varchar',
      DESCRIPTION: 'varchar',
      SUM_MONEY: 'integer',
      SUM_POINT: 'integer',
    },
  },
  {
    tableName: 'INDIAN_PACK_USAGE',
    keyColumns: ['ID'],
    columns: ['ID', 'CLIENT_ID', 'PACK_ID', 'DATE_USAGE'],
    columnTypes: { ID: 'integer', CLIENT_ID: 'integer', PACK_ID: 'integer', DATE_USAGE: 'timestamp' },
  },
  {
    tableName: 'INDIAN_REMAINS_PACK',
    keyColumns: ['ID'],
    columns: ['ID', 'CLIENT_ID', 'REMAINS_POINT'],
    columnTypes: { ID: 'integer', CLIENT_ID: 'integer', REMAINS_POINT: 'integer' },
  },
  {
    tableName: 'INDIAN_INVITED_CODE',
    keyColumns: ['ID'],
    columns: ['ID', 'CLIENT_ID', 'INVITED_CODE', 'MAX_INVITED', 'POINT_TO_OWNER', 'POINT_TO_USER', 'CREATE_AT'],
    columnTypes: {
      ID: 'integer',
      CLIENT_ID: 'integer',
      INVITED_CODE: 'varchar',
      MAX_INVITED: 'integer',
      POINT_TO_OWNER: 'integer',
      POINT_TO_USER: 'integer',
      CREATE_AT: 'timestamp',
    },
  },
  {
    tableName: 'INDIAN_INVITED_CODE_USAGE',
    keyColumns: ['ID'],
    columns: ['ID', 'INVITED_CODE_ID', 'USER_ID', 'CREATE_AT'],
    columnTypes: {
      ID: 'integer',
      INVITED_CODE_ID: 'integer',
      USER_ID: 'integer',
      CREATE_AT: 'timestamp',
    },
  },
];

function getScriptConfig(): ScriptConfig {
  const batchSize = Number(process.env.MIGRATION_BATCH_SIZE || 500);
  const dryRun = process.env.MIGRATION_DRY_RUN === 'true';
  const regenerateIds = process.env.MIGRATION_REGENERATE_IDS !== 'false';
  const checkpointFile = process.env.MIGRATION_CHECKPOINT_FILE || path.resolve(process.cwd(), 'scripts/migration/.checkpoint.json');
  const reportFile = process.env.MIGRATION_REPORT_FILE || path.resolve(process.cwd(), 'scripts/migration/.report.json');
  return { batchSize, dryRun, regenerateIds, checkpointFile, reportFile };
}

function getDataSources(): { source: DataSource; target: DataSource } {
  const source = new DataSource({
    type: 'oracle',
    host: process.env.LEGACY_DB_HOST,
    port: Number(process.env.LEGACY_DB_PORT),
    username: process.env.LEGACY_DB_USERNAME,
    password: process.env.LEGACY_DB_PASSWORD,
    sid: process.env.LEGACY_DB_SID,
    synchronize: false,
  });

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const ssl = resolvePostgresSslFromEnv({
    dbSsl: process.env.DB_SSL,
    postgresSsl: process.env.POSTGRES_SSL,
    dbSslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED,
    databaseUrl,
  });

  const target = databaseUrl
    ? new DataSource({
        type: 'postgres',
        url: databaseUrl,
        synchronize: false,
        ssl,
      })
    : new DataSource({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || process.env.DB_HOST,
        port: Number(process.env.POSTGRES_PORT || process.env.DB_PORT),
        username: process.env.POSTGRES_USER || process.env.DB_USERNAME,
        password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD,
        database: process.env.POSTGRES_DATABASE || process.env.DB_DATABASE,
        synchronize: false,
        ssl,
      });

  return { source, target };
}

async function readCheckpoint(filePath: string): Promise<Checkpoint> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as Checkpoint;
  } catch {
    return {};
  }
}

async function writeCheckpoint(filePath: string, checkpoint: Checkpoint): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(checkpoint, null, 2), 'utf8');
}

function makeOracleSelect(table: TableMigrationConfig, offset: number, limit: number): string {
  const cols = table.columns.map((c) => `"${c}"`).join(', ');
  if (table.tableName === 'CRDCLIENT') {
    return `
SELECT ${cols}
FROM "${table.tableName}" c
WHERE EXISTS (
  SELECT 1
  FROM "INDIAN_CLIENT_PSW" p
  WHERE p."CLIENT_ID" = c."CLIENT_ID"
)
ORDER BY c."${table.keyColumns[0]}"
OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
`;
  }

  if (table.tableName === 'CRDCARD') {
    return `
SELECT ${cols}
FROM "${table.tableName}" c
WHERE EXISTS (
  SELECT 1
  FROM "INDIAN_CLIENT_PSW" p
  WHERE p."CLIENT_ID" = c."CLIENT_ID"
)
ORDER BY c."${table.keyColumns[0]}"
OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
`;
  }

  return `SELECT ${cols} FROM "${table.tableName}" ORDER BY "${table.keyColumns[0]}" OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
}

function makePostgresInsert(table: TableMigrationConfig, regenerateIds: boolean): { sql: string; insertColumns: string[] } {
  const primaryKey = table.keyColumns[0];
  const insertColumns = regenerateIds ? table.columns.filter((c) => c !== primaryKey) : [...table.columns];
  const quotedCols = insertColumns.map((c) => `"${c}"`);
  const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`);
  const returningClause = regenerateIds ? ` RETURNING "${primaryKey}"` : '';
  const sql = `INSERT INTO "${table.tableName}" (${quotedCols.join(', ')}) VALUES (${placeholders.join(', ')})${returningClause}`;
  return { sql, insertColumns };
}

function remapForeignKeys(tableName: string, row: Record<string, any>, idMaps: IdMaps): Record<string, any> {
  const remapped = { ...row };
  const rules: Record<string, string> = {
    'CRDCARD.CLIENT_ID': 'CRDCLIENT',
    'INDIAN_CLIENT_PSW.CLIENT_ID': 'CRDCLIENT',
    'INDIAN_SUBSCRIBE.CLIENT_ID': 'CRDCLIENT',
    'INDIAN_PACK_USAGE.CLIENT_ID': 'CRDCLIENT',
    'INDIAN_PACK_USAGE.PACK_ID': 'INDIAN_PACK_MIN',
    'INDIAN_REMAINS_PACK.CLIENT_ID': 'CRDCLIENT',
    'INDIAN_INVITED_CODE.CLIENT_ID': 'CRDCLIENT',
    'INDIAN_INVITED_CODE_USAGE.USER_ID': 'CRDCLIENT',
    'INDIAN_INVITED_CODE_USAGE.INVITED_CODE_ID': 'INDIAN_INVITED_CODE',
  };

  for (const [key, refTable] of Object.entries(rules)) {
    const [currentTable, column] = key.split('.');
    if (currentTable !== tableName) continue;
    const value = remapped[column];
    if (value === null || value === undefined) continue;

    const map = idMaps[refTable];
    const mapped = map?.get(Number(value));
    if (!mapped) {
      throw new Error(`Missing mapped id for ${tableName}.${column}=${value} -> ${refTable}`);
    }
    remapped[column] = mapped;
  }

  return remapped;
}

async function migrateTable(
  source: DataSource,
  target: DataSource,
  table: TableMigrationConfig,
  config: ScriptConfig,
  checkpoint: Checkpoint,
  idMaps: IdMaps,
): Promise<MigrationStats> {
  let offset = config.regenerateIds ? 0 : checkpoint[table.tableName] || 0;
  let migrated = 0;
  let failed = 0;
  const { sql: insertSql, insertColumns } = makePostgresInsert(table, config.regenerateIds);
  const primaryKey = table.keyColumns[0];

  while (true) {
    const selectSql = makeOracleSelect(table, offset, config.batchSize);
    const batch = await source.query(selectSql);
    if (!batch.length) break;

    for (const rawRow of batch) {
      if (config.dryRun) {
        migrated += 1;
        continue;
      }

      const row = remapForeignKeys(table.tableName, rawRow, idMaps);
      if (table.tableName === 'CRDCARD') {
        row.CARD_TYPE_ID = CARD_TIER_DEFAULT;
        if ('CARD_TIER_ID' in row) {
          row.CARD_TIER_ID = CARD_TIER_DEFAULT;
        }
        if ('ORGANIZATION_ID' in row) {
          row.ORGANIZATION_ID = ORGANIZATION_DEFAULT;
        }
      }

      const values = insertColumns.map((column) => row[column]);

      try {
        const result = await target.query(insertSql, values);
        if (config.regenerateIds) {
          const newId = Number(result?.[0]?.[primaryKey]);
          const oldId = Number(rawRow[primaryKey]);
          if (!Number.isNaN(newId) && !Number.isNaN(oldId)) {
            if (!idMaps[table.tableName]) {
              idMaps[table.tableName] = new Map<number, number>();
            }
            idMaps[table.tableName].set(oldId, newId);
          }
        }
        migrated += 1;
      } catch (error) {
        failed += 1;
        // eslint-disable-next-line no-console
        console.error(`[${table.tableName}] upsert failed for key ${table.keyColumns.map((k) => row[k]).join(':')}`, error);
      }
    }

    offset += batch.length;
    checkpoint[table.tableName] = offset;
    await writeCheckpoint(config.checkpointFile, checkpoint);
    // eslint-disable-next-line no-console
    console.log(`[${table.tableName}] processed=${offset} migrated=${migrated} failed=${failed}`);
  }

  return { migrated, failed, lastOffset: offset };
}

async function applyLtyCardDefaults(target: DataSource): Promise<void> {
  const tableCheck = await target.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'LTYCard'
    ) AS "exists"`,
  );

  if (!tableCheck[0]?.exists) {
    return;
  }

  await target.query(
    `UPDATE "LTYCard"
     SET "cardTierId" = $1,
         "organizationId" = $2
     WHERE "cardTierId" IS DISTINCT FROM $1
        OR "organizationId" IS DISTINCT FROM $2`,
    [CARD_TIER_DEFAULT, ORGANIZATION_DEFAULT],
  );
}

async function run(): Promise<void> {
  const config = getScriptConfig();
  const checkpoint = await readCheckpoint(config.checkpointFile);
  const { source, target } = getDataSources();
  const idMaps: IdMaps = {};

  const report: Record<string, MigrationStats> = {};

  await source.initialize();
  await target.initialize();

  try {
    for (const table of TABLES) {
      // eslint-disable-next-line no-console
      console.log(`Migrating ${table.tableName}...`);
      report[table.tableName] = await migrateTable(source, target, table, config, checkpoint, idMaps);
    }

    if (!config.dryRun) {
      await applyLtyCardDefaults(target);
    }
  } finally {
    await source.destroy();
    await target.destroy();
  }

  await fs.mkdir(path.dirname(config.reportFile), { recursive: true });
  await fs.writeFile(config.reportFile, JSON.stringify(report, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Migration finished. Report: ${config.reportFile}`);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Migration failed', error);
  process.exit(1);
});
