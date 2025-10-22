# Log Gateway Client

[![npm version](https://badge.fury.io/js/log-gateway-client.svg)](https://badge.fury.io/js/log-gateway-client)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript-first client library for centralized logging with Loki and Grafana. Zero dependencies, full type safety, and perfect for NestJS applications.

## Features

- 🚀 **Zero Dependencies** - Uses only Node.js built-in modules
- 📝 **Full TypeScript Support** - Native TypeScript with complete type definitions
- 🎯 **Simple API** - Easy-to-use methods for all log levels
- 🔧 **NestJS Ready** - Perfect integration with NestJS applications
- 📦 **Lightweight** - Minimal footprint, maximum performance
- 🌐 **Flexible** - Works with any log gateway that accepts JSON
- ⚡ **Async/Await** - Modern Promise-based API

## Installation

```bash
npm install log-gateway-client
```

```bash
yarn add log-gateway-client
```

```bash
pnpm add log-gateway-client
```

## Quick Start

### Basic Usage

```typescript
import { configure, log } from 'log-gateway-client';

// Configure once at application startup
configure('http://localhost:8080', 'my-app-id', 'your-bearer-token');

// Use anywhere in your application
await log.info({
  msg: "User logged in successfully",
  userId: 123,
  service: "auth-service"
});

await log.warning({
  msg: "High memory usage detected",
  memoryUsage: 85.5,
  threshold: 80
});

await log.error({
  msg: "Payment processing failed",
  errorCode: "PAYMENT_DECLINED",
  orderId: "ORD-123"
});
```

### Client Instance Usage

```typescript
import { createClient } from 'log-gateway-client';

const logger = createClient('http://localhost:8080', 'my-app-id', 'your-bearer-token');

await logger.info({
  msg: "Service started",
  port: 3000,
  environment: "production"
});
```

### NestJS Integration

```typescript
// app.module.ts
import { configure } from 'log-gateway-client';

@Module({
  // ... your module config
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    configure(
      process.env.LOG_GATEWAY_URL,
      process.env.APP_ID,
      process.env.BEARER_TOKEN
    );
  }
}

// user.service.ts
import { log } from 'log-gateway-client';

@Injectable()
export class UserService {
  async createUser(userData: CreateUserDto) {
    try {
      const user = await this.userRepository.save(userData);

      await log.info({
        msg: "User created successfully",
        userId: user.id,
        service: "user-service"
      });

      return user;
    } catch (error) {
      await log.error({
        msg: "Failed to create user",
        error: error.message,
        service: "user-service"
      });
      throw error;
    }
  }
}
```

### Dependency Injection Pattern

```typescript
import { createClient, LogGatewayClient } from 'log-gateway-client';

@Injectable()
export class LoggerService {
  private readonly logger: LogGatewayClient;

  constructor() {
    this.logger = createClient(
      process.env.LOG_GATEWAY_URL,
      process.env.APP_ID,
      process.env.BEARER_TOKEN
    );
  }

  async logUserAction(userId: number, action: string, metadata?: any) {
    return this.logger.info({
      msg: \`User performed \${action}\`,
      userId,
      action,
      service: "user-tracking",
      ...metadata
    });
  }
}
```

## API Reference

### Configuration

#### `configure(endpoint: string, appId: string, bearerToken: string): LogGatewayClient`

Configure the global logger instance.

- `endpoint`: URL of your log gateway (e.g., 'http://localhost:8080')
- `appId`: Your application identifier
- `bearerToken`: Bearer token for SSO authentication

### Logging Methods

#### `log.info(payload: LogPayload): Promise<LogResponse>`
#### `log.warning(payload: LogPayload): Promise<LogResponse>`
#### `log.error(payload: LogPayload): Promise<LogResponse>`
#### `log.debug(payload: LogPayload): Promise<LogResponse>`

Send logs with the specified level.

### Client Factory

#### `createClient(endpoint: string, appId: string, bearerToken: string): LogGatewayClient`

Create a new client instance for dependency injection or multiple configurations.

### Types

```typescript
interface LogPayload {
  msg: string;                    // Required: Log message
  service?: string;               // Optional: Service name
  timestamp?: string;             // Optional: Custom timestamp
  [key: string]: any;            // Any additional fields
}

interface LogResponse {
  success: boolean;
  ingested: number;
}

interface BatchLogPayload extends LogPayload {
  level: 'info' | 'warn' | 'error' | 'debug';
}
```

## Examples

### Structured Logging

```typescript
// Application metrics
await log.info({
  msg: "API request processed",
  method: "POST",
  endpoint: "/api/users",
  statusCode: 201,
  duration: 145,
  userId: 12345
});

// Error tracking
await log.error({
  msg: "Database connection failed",
  database: "postgresql",
  host: "db.example.com",
  errorCode: "CONNECTION_TIMEOUT",
  retryAttempt: 3
});

// Performance monitoring
await log.warning({
  msg: "Slow query detected",
  query: "SELECT * FROM users WHERE...",
  duration: 2500,
  threshold: 1000,
  table: "users"
});
```

### Custom Service Logging

```typescript
class PaymentService {
  private logger = createClient(
    process.env.LOG_GATEWAY_URL,
    'payment-service',
    process.env.BEARER_TOKEN
  );

  async processPayment(paymentData: PaymentDto) {
    await this.logger.info({
      msg: "Payment processing started",
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      service: "payment-service"
    });

    try {
      const result = await this.paymentProvider.charge(paymentData);

      await this.logger.info({
        msg: "Payment processed successfully",
        orderId: paymentData.orderId,
        transactionId: result.id,
        service: "payment-service"
      });

      return result;
    } catch (error) {
      await this.logger.error({
        msg: "Payment processing failed",
        orderId: paymentData.orderId,
        error: error.message,
        service: "payment-service"
      });
      throw error;
    }
  }
}
```

## Requirements

- Node.js >= 16.0.0
- TypeScript >= 4.5.0 (for TypeScript projects)

## License

MIT © [t-Oil](https://github.com/t-Oil)

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## Support

- 📖 [Documentation](https://github.com/t-Oil/log-gateway-lib#readme)
- 🐛 [Issues](https://github.com/t-Oil/log-gateway-lib/issues)
- 💬 [Discussions](https://github.com/t-Oil/log-gateway-lib/discussions)

---

Made with ❤️ for the logging community