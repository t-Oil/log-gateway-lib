import {
  LogGatewayClient,
  createClient,
  configure,
  log,
} from "log-gateway-client";

async function testClient() {
  console.log("🧪 Testing Log Gateway Client...\n");

  // Example 1: Using class instance
  console.log("📝 Test 1: Using LogGatewayClient class");
  const client = new LogGatewayClient(
    "http://localhost:8080",
    "test-app",
    "test-token-123"
  );

  try {
    await client.info({
      msg: "Test info message from TypeScript",
      service: "test-service",
      environment: "development",
    });
    console.log("✅ Info log sent successfully\n");
  } catch (error: any) {
    console.log(`⚠️  Expected error (gateway not running): ${error.message}\n`);
  }

  // Example 2: Using factory function
  console.log("📝 Test 2: Using createClient factory");
  const client2 = createClient(
    "http://localhost:8080",
    "test-app",
    "test-token-123"
  );

  try {
    await client2.warning({
      msg: "Test warning message",
      userId: "user-123",
    });
    console.log("✅ Warning log sent successfully\n");
  } catch (error: any) {
    console.log(`⚠️  Expected error (gateway not running): ${error.message}\n`);
  }

  // Example 3: Using global logger
  console.log("📝 Test 3: Using global logger");
  configure("http://localhost:8080", "test-app", "test-token-123");

  try {
    await log.error({
      msg: "Test error message",
      errorCode: "E001",
    });
    console.log("✅ Error log sent successfully\n");
  } catch (error: any) {
    console.log(`⚠️  Expected error (gateway not running): ${error.message}\n`);
  }

  console.log("✨ All tests completed!");
}

testClient().catch(console.error);
