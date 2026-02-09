# Seqfana - Seq Data Source Plugin for Grafana

A Grafana data source plugin for [Seq](https://datalust.co/seq) structured logging server that allows you to query and visualize log events with time range filtering and custom filters.

## Features

- **Time Range Integration**: Automatically passes Grafana's selected time range to Seq queries
- **Custom Filtering**: Seq filter expressions with template variable support
- **Signal Support**: Query specific Seq signals
- **Structured Data**: View log events with their structured properties
- **API Key Authentication**: Secure connection to Seq using API keys

## Quick Start with Docker

The fastest way to try Seqfana is with the included Docker Compose setup:

```bash
npm install
npm run build
docker-compose up
```

This starts:
- **Seq** at http://localhost:18080 (API on port 15341)
- **Grafana** at http://localhost:3000 (admin / admin)
- A **seed** container that populates Seq with 20 sample log events

The Seq datasource is auto-provisioned in Grafana. Go to Explore, select Seq, and you should see log events immediately.

## Installation

1. Clone this repository into your Grafana plugins directory:
   ```bash
   git clone https://github.com/GotWoods/Seqfana.git
   cd Seqfana
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Copy the `dist/` folder to your Grafana plugins directory and restart Grafana.

5. Allow the unsigned plugin by adding to your Grafana config:
   ```ini
   [plugins]
   allow_loading_unsigned_plugins = gotwoods-seqfana-datasource
   ```

## Configuration

1. In Grafana, go to **Configuration** > **Data Sources**
2. Click **Add data source**
3. Select **Seq** from the list
4. Configure the connection:
   - **URL**: Your Seq server URL (e.g., `http://localhost:5341`)
   - **API Key**: Optional API key for authentication

## Usage

### Query Editor

The query editor provides the following fields:

- **Filter**: Seq filter expression (e.g., `@Level = 'Error'` or `@Message like '%exception%'`)
- **Signal**: Optional Seq signal name to query
- **Count**: Maximum number of events to return

### Example Queries

- Show all error messages:
  ```
  @Level = 'Error'
  ```

- Find messages containing "exception":
  ```
  @Message like '%exception%'
  ```

- Filter by application:
  ```
  Application = 'MyApp'
  ```

### Time Range

The plugin automatically uses Grafana's time picker to filter Seq events. When you select a time range in Grafana (e.g., "Last 15 minutes"), it will be passed to Seq as `fromDateUtc` and `toDateUtc` parameters.

## Development

### Prerequisites

- Node.js 18+
- npm
- Grafana 9.0+
- Docker (for local dev environment)

### Build Commands

```bash
# Development build with watch
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

### Project Structure

```
src/
├── components/
│   ├── ConfigEditor.tsx    # Data source configuration UI
│   └── QueryEditor.tsx     # Query builder UI
├── datasource.ts           # Main data source implementation
├── module.ts               # Plugin entry point
├── types.ts                # TypeScript type definitions
└── plugin.json             # Plugin metadata
docker/
├── provisioning/
│   └── datasources/
│       └── seq.yml         # Grafana datasource provisioning
└── seed-events.sh          # Sample event seeder
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.
