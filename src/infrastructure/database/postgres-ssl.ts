import { ConfigService } from '@nestjs/config';

export type PostgresSslEnv = {
  dbSsl?: string;
  postgresSsl?: string;
  dbSslRejectUnauthorized?: string;
  databaseUrl?: string;
};

function sslModeFromDatabaseUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get('sslmode')?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function resolvePostgresSslFromEnv(
  env: PostgresSslEnv,
): boolean | { rejectUnauthorized: boolean } {
  const explicit = (env.dbSsl ?? env.postgresSsl)?.trim().toLowerCase();
  if (
    explicit === 'disable' ||
    explicit === 'false' ||
    explicit === '0' ||
    explicit === 'off'
  ) {
    return false;
  }

  const fromUrl = env.databaseUrl
    ? sslModeFromDatabaseUrl(env.databaseUrl)
    : null;
  if (fromUrl === 'disable' || fromUrl === 'allow') {
    return false;
  }

  const rejectUnauthorized =
    env.dbSslRejectUnauthorized?.trim().toLowerCase() === 'true';

  return { rejectUnauthorized };
}

export function resolvePostgresSsl(
  configService: ConfigService,
  databaseUrl?: string,
): boolean | { rejectUnauthorized: boolean } {
  return resolvePostgresSslFromEnv({
    dbSsl: configService.get<string>('DB_SSL'),
    postgresSsl: configService.get<string>('POSTGRES_SSL'),
    dbSslRejectUnauthorized: configService.get<string>(
      'DB_SSL_REJECT_UNAUTHORIZED',
    ),
    databaseUrl: databaseUrl ?? configService.get<string>('DATABASE_URL'),
  });
}
