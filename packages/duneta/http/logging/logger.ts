import type { DunetaServerConfig } from '../../config/server/types.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export type LogFields = Record<string, unknown>;

export type RequestLogFields = {
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
};

export type Logger = {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  request(fields: RequestLogFields): void;
};

function minLevel(config: DunetaServerConfig): LogLevel {
  if (config.debug?.enabled) return config.debug.logLevel;
  return config.app.env === 'production' ? 'info' : 'debug';
}

function shouldLog(config: DunetaServerConfig, level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel(config)];
}

function logFormat(config: DunetaServerConfig): 'json' | 'text' {
  if (config.logging?.format) return config.logging.format;
  return config.app.env === 'production' ? 'json' : 'text';
}

function emit(config: DunetaServerConfig, level: LogLevel, message: string, fields?: LogFields): void {
  if (!shouldLog(config, level)) return;

  const payload = { level, msg: message, ts: new Date().toISOString(), ...fields };
  const line = logFormat(config) === 'json' ? JSON.stringify(payload) : `${level} ${message}${fields ? ` ${JSON.stringify(fields)}` : ''}`;
  const write = level === 'error' || level === 'warn' ? console.error : console.log;
  write(line);
}

/** Structured stdout logger — Cloudflare Workers have no filesystem; use Logpush for retention. */
export function createLogger(config: DunetaServerConfig): Logger {
  return {
    debug: (message, fields) => emit(config, 'debug', message, fields),
    info: (message, fields) => emit(config, 'info', message, fields),
    warn: (message, fields) => emit(config, 'warn', message, fields),
    error: (message, fields) => emit(config, 'error', message, fields),
    request: (fields) => emit(config, 'info', 'request', fields),
  };
}
