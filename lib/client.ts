import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

/**
 * TypeScript interfaces for the Log Gateway Client
 */
export interface LogPayload {
  /** Required log message */
  msg: string;
  /** Service name (optional) */
  service?: string;
  /** Custom timestamp (auto-generated if not provided) */
  timestamp?: string;
  /** Any additional custom fields */
  [key: string]: any;
}

export interface BatchLogPayload extends LogPayload {
  /** Log level for batch logs */
  level: 'info' | 'warn' | 'error' | 'debug';
}

export interface LogResponse {
  /** Success status */
  success: boolean;
  /** Number of logs ingested */
  ingested: number;
}

export interface HealthResponse {
  /** Gateway status */
  status: string;
  /** Response timestamp */
  timestamp: string;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Log Gateway Client - TypeScript Implementation
 * A simple client library for sending logs to the log gateway
 */
export class LogGatewayClient {
  private readonly endpoint: string;
  private readonly appId: string;
  private readonly headers: Record<string, string>;

  constructor(endpoint: string, appId: string) {
    if (!endpoint || !appId) {
      throw new Error('LogGatewayClient requires endpoint and appId');
    }

    this.endpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash
    this.appId = appId;
    this.headers = {
      'X-App-Id': appId,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Send HTTP request using Node.js built-in modules
   * @private
   */
  private _httpRequest<T = any>(
    url: string,
    method: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options: http.RequestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname,
        method: method,
        headers: headers || {}
      };

      const protocol = urlObj.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        });
      });

      req.on('error', (err: Error) => reject(new Error(`Request failed: ${err.message}`)));

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  /**
   * Send a log with specified level
   * @private
   */
  private async _sendLog(level: LogLevel, payload: LogPayload): Promise<LogResponse> {
    const logPayload = {
      level,
      timestamp: new Date().toISOString(),
      ...payload
    };

    // Ensure msg field exists
    if (!logPayload.msg) {
      throw new Error('Log payload must include "msg" field');
    }

    try {
      const response = await this._httpRequest<LogResponse>(
        `${this.endpoint}/logs`,
        'POST',
        logPayload,
        this.headers
      );
      return response;
    } catch (error: any) {
      throw new Error(`Failed to send log: ${error.message}`);
    }
  }

  /**
   * Send an info level log
   * @param payload Log data including msg and any custom fields
   */
  public async info(payload: LogPayload): Promise<LogResponse> {
    return this._sendLog('info', payload);
  }

  /**
   * Send a warning level log
   * @param payload Log data including msg and any custom fields
   */
  public async warning(payload: LogPayload): Promise<LogResponse> {
    return this._sendLog('warn', payload);
  }

  /**
   * Send an error level log
   * @param payload Log data including msg and any custom fields
   */
  public async error(payload: LogPayload): Promise<LogResponse> {
    return this._sendLog('error', payload);
  }

  /**
   * Send a debug level log
   * @param payload Log data including msg and any custom fields
   */
  public async debug(payload: LogPayload): Promise<LogResponse> {
    return this._sendLog('debug', payload);
  }

  /**
   * Send multiple logs at once
   * @param logs Array of log objects with level, msg, and custom fields
   */
  public async batch(logs: BatchLogPayload[]): Promise<LogResponse> {
    if (!Array.isArray(logs)) {
      throw new Error('Batch logs must be an array');
    }

    const processedLogs = logs.map(log => ({
      timestamp: new Date().toISOString(),
      ...log
    }));

    try {
      const response = await this._httpRequest<LogResponse>(
        `${this.endpoint}/logs`,
        'POST',
        processedLogs,
        this.headers
      );
      return response;
    } catch (error: any) {
      throw new Error(`Failed to send batch logs: ${error.message}`);
    }
  }

  /**
   * Test connection to the gateway
   */
  public async testConnection(): Promise<HealthResponse> {
    try {
      const response = await this._httpRequest<HealthResponse>(
        `${this.endpoint}/health`,
        'GET',
        null,
        { 'Content-Type': 'application/json' }
      );
      return response;
    } catch (error: any) {
      throw new Error(`Gateway connection failed: ${error.message}`);
    }
  }
}

/**
 * Factory function to create a new LogGatewayClient instance
 * @param endpoint Gateway URL (e.g., 'http://localhost:8080')
 * @param appId Application ID for authentication
 */
export function createClient(endpoint: string, appId: string): LogGatewayClient {
  return new LogGatewayClient(endpoint, appId);
}

// Global logger instance - can be configured once
let globalLogger: LogGatewayClient | null = null;

/**
 * Configure the global logger instance
 * @param endpoint Gateway URL
 * @param appId Application ID
 */
export function configure(endpoint: string, appId: string): LogGatewayClient {
  globalLogger = createClient(endpoint, appId);
  return globalLogger;
}

/**
 * Global log functions that use the configured logger
 */
export const log = {
  info: (payload: LogPayload): Promise<LogResponse> => {
    if (!globalLogger) throw new Error('Logger not configured. Call configure(endpoint, appId) first.');
    return globalLogger.info(payload);
  },
  warning: (payload: LogPayload): Promise<LogResponse> => {
    if (!globalLogger) throw new Error('Logger not configured. Call configure(endpoint, appId) first.');
    return globalLogger.warning(payload);
  },
  error: (payload: LogPayload): Promise<LogResponse> => {
    if (!globalLogger) throw new Error('Logger not configured. Call configure(endpoint, appId) first.');
    return globalLogger.error(payload);
  },
  debug: (payload: LogPayload): Promise<LogResponse> => {
    if (!globalLogger) throw new Error('Logger not configured. Call configure(endpoint, appId) first.');
    return globalLogger.debug(payload);
  },
  batch: (logs: BatchLogPayload[]): Promise<LogResponse> => {
    if (!globalLogger) throw new Error('Logger not configured. Call configure(endpoint, appId) first.');
    return globalLogger.batch(logs);
  }
};

// Export types for external use
export type { LogLevel };