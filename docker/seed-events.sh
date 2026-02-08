#!/bin/sh
set -e

SEQ_INGEST="http://seq:5341"
SEQ_API="http://seq"

echo "Waiting for Seq to be ready..."
until wget -q -O /dev/null "$SEQ_API/health" 2>/dev/null; do
  sleep 1
done
echo "Seq is ready."

# Generate a timestamp in ISO 8601 format.
# Alpine date supports -Iseconds for ISO output.
ts() {
  # Offset each event by -$1 seconds so they spread across the time window
  date -u -Iseconds -d "@$(( $(date +%s) - $1 ))"
}

post_event() {
  wget -q -O /dev/null --post-data="$1" \
    --header="Content-Type: application/vnd.serilog.clef" \
    "$SEQ_INGEST/ingest/clef"
}

# --- Information events (7) ---

post_event "{\"@t\":\"$(ts 840)\",\"@mt\":\"Application started successfully\",\"@l\":\"Information\",\"Environment\":\"Development\",\"Version\":\"1.4.2\"}"

post_event "{\"@t\":\"$(ts 720)\",\"@mt\":\"User {Username} logged in from {IpAddress}\",\"@l\":\"Information\",\"Username\":\"alice\",\"IpAddress\":\"10.0.1.42\",\"SessionId\":\"sess-001\"}"

post_event "{\"@t\":\"$(ts 600)\",\"@mt\":\"Processing batch of {Count} records\",\"@l\":\"Information\",\"Count\":250,\"BatchId\":\"batch-0042\",\"Source\":\"ImportService\"}"

post_event "{\"@t\":\"$(ts 480)\",\"@mt\":\"Health check passed\",\"@l\":\"Information\",\"Endpoint\":\"/health\",\"ResponseTimeMs\":12}"

post_event "{\"@t\":\"$(ts 360)\",\"@mt\":\"Email sent to {Recipient}\",\"@l\":\"Information\",\"Recipient\":\"bob@example.com\",\"TemplateId\":\"welcome-v2\",\"DurationMs\":345}"

post_event "{\"@t\":\"$(ts 240)\",\"@mt\":\"Cache refreshed for {CacheKey}\",\"@l\":\"Information\",\"CacheKey\":\"product-catalog\",\"ItemCount\":1823,\"ExpiresInSeconds\":300}"

post_event "{\"@t\":\"$(ts 120)\",\"@mt\":\"Scheduled job {JobName} completed\",\"@l\":\"Information\",\"JobName\":\"CleanupExpiredSessions\",\"RemovedCount\":47,\"DurationMs\":892}"

# --- Warning events (4) ---

post_event "{\"@t\":\"$(ts 780)\",\"@mt\":\"Response time exceeded threshold: {ElapsedMs}ms for {Endpoint}\",\"@l\":\"Warning\",\"ElapsedMs\":2340,\"Endpoint\":\"/api/reports/generate\",\"Threshold\":2000}"

post_event "{\"@t\":\"$(ts 540)\",\"@mt\":\"Disk usage at {Percent}% on volume {Volume}\",\"@l\":\"Warning\",\"Percent\":87,\"Volume\":\"/data\",\"FreeBytes\":13958643712}"

post_event "{\"@t\":\"$(ts 300)\",\"@mt\":\"Rate limit approaching for client {ClientId}: {Current}/{Max} requests\",\"@l\":\"Warning\",\"ClientId\":\"api-client-99\",\"Current\":950,\"Max\":1000,\"WindowSeconds\":60}"

post_event "{\"@t\":\"$(ts 150)\",\"@mt\":\"Deprecated API version {ApiVersion} called by {UserAgent}\",\"@l\":\"Warning\",\"ApiVersion\":\"v1\",\"UserAgent\":\"LegacyApp/2.1\",\"Endpoint\":\"/api/v1/users\"}"

# --- Error events (4) ---

post_event "{\"@t\":\"$(ts 660)\",\"@mt\":\"Unhandled exception in request pipeline\",\"@l\":\"Error\",\"RequestPath\":\"/api/orders/create\",\"StatusCode\":500,\"@x\":\"System.NullReferenceException: Object reference not set to an instance of an object.\\n   at OrderService.CreateOrder(OrderRequest request) in /src/Services/OrderService.cs:line 47\\n   at OrdersController.Post(OrderRequest request) in /src/Controllers/OrdersController.cs:line 23\\n   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.Execute(ActionContext context)\\n   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.InvokeActionMethodAsync()\"}"

post_event "{\"@t\":\"$(ts 420)\",\"@mt\":\"Database connection failed after {Retries} retries\",\"@l\":\"Error\",\"Retries\":3,\"Database\":\"OrdersDb\",\"Server\":\"db-primary.internal\",\"@x\":\"Npgsql.NpgsqlException: Failed to connect to 10.0.2.15:5432\\n   at Npgsql.Internal.NpgsqlConnector.ConnectAsync(NpgsqlTimeout timeout, CancellationToken cancellationToken)\\n   at Npgsql.ConnectorPool.OpenNewConnector(NpgsqlConnection conn, NpgsqlTimeout timeout, Boolean async, CancellationToken cancellationToken)\\n   at Npgsql.ConnectorPool.Rent(NpgsqlConnection conn, NpgsqlTimeout timeout, Boolean async, CancellationToken cancellationToken)\\n   at Npgsql.NpgsqlConnection.OpenAsync(CancellationToken cancellationToken)\"}"

post_event "{\"@t\":\"$(ts 180)\",\"@mt\":\"Payment processing failed for order {OrderId}\",\"@l\":\"Error\",\"OrderId\":\"ORD-20250712-003\",\"Amount\":149.99,\"Currency\":\"USD\",\"Gateway\":\"stripe\",\"@x\":\"System.Net.Http.HttpRequestException: Response status code does not indicate success: 502 (Bad Gateway).\\n   at System.Net.Http.HttpResponseMessage.EnsureSuccessStatusCode()\\n   at PaymentService.ChargeAsync(PaymentRequest request) in /src/Services/PaymentService.cs:line 83\\n   at OrderProcessor.ProcessPayment(Order order) in /src/Processing/OrderProcessor.cs:line 112\"}"

post_event "{\"@t\":\"$(ts 60)\",\"@mt\":\"Failed to deserialize message from queue {QueueName}\",\"@l\":\"Error\",\"QueueName\":\"order-events\",\"MessageId\":\"msg-88291\",\"ContentType\":\"application/json\"}"

# --- Debug events (3) ---

# BusyBox date on Alpine does not support sub-second precision, but that is fine.
post_event "{\"@t\":\"$(ts 810)\",\"@mt\":\"Resolving dependencies for {ServiceType}\",\"@l\":\"Debug\",\"ServiceType\":\"IOrderRepository\",\"Lifetime\":\"Scoped\"}"

post_event "{\"@t\":\"$(ts 510)\",\"@mt\":\"SQL query executed in {ElapsedMs}ms\",\"@l\":\"Debug\",\"ElapsedMs\":23,\"CommandText\":\"SELECT * FROM users WHERE id = @id\",\"Parameters\":{\"id\":42}}"

# Note: nested JSON in properties tests the labels field handling
post_event "{\"@t\":\"$(ts 90)\",\"@mt\":\"HTTP request completed: {Method} {Path} responded {StatusCode}\",\"@l\":\"Debug\",\"Method\":\"GET\",\"Path\":\"/api/products\",\"StatusCode\":200,\"DurationMs\":58,\"RequestId\":\"req-7a3b\"}"

echo ""
echo "====================================="
echo "  Seeded 20 events to Seq"
echo "====================================="
echo "  Seq UI:  http://localhost:18080"
echo "  Grafana: http://localhost:3000  (admin / admin)"
echo "====================================="
