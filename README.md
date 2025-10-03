# Health Monitoring System

A cloud-based health monitoring system with real-time metrics ingestion, anomaly detection, and comprehensive monitoring dashboard.

## Features

- **Real-time Data Ingestion**: Serverless API endpoints for ingesting health metrics from IoT devices
- **Anomaly Detection**: Automatic detection of abnormal health metrics with configurable thresholds
- **Monitoring Dashboard**: Real-time visualization of health metrics, devices, and anomalies
- **Device Simulator**: Built-in tools for testing and simulating device data
- **RESTful API**: Comprehensive API for querying metrics, devices, and anomalies
- **CI/CD Pipeline**: Automated testing, building, and deployment workflows

## Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Neon (PostgreSQL)
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Neon database account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd health-monitoring-system
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
# Create .env.local file with:
DATABASE_URL=your_neon_database_url
\`\`\`

4. Run database migrations:
\`\`\`bash
# Execute SQL scripts in the scripts/ folder
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Data Ingestion

- `POST /api/ingest` - Ingest a single health metric
- `POST /api/ingest/batch` - Ingest multiple health metrics

### Metrics

- `GET /api/metrics` - Query health metrics with filters
- `GET /api/metrics/:id` - Get a specific metric
- `DELETE /api/metrics/:id` - Delete a metric

### Devices

- `GET /api/devices` - Get all devices
- `POST /api/devices` - Register a new device
- `GET /api/devices/:deviceId` - Get device details
- `PATCH /api/devices/:deviceId` - Update device
- `DELETE /api/devices/:deviceId` - Delete device
- `GET /api/devices/:deviceId/metrics` - Get device metrics

### Anomalies

- `GET /api/anomalies` - Get all anomalies
- `GET /api/anomalies/:id` - Get specific anomaly
- `PATCH /api/anomalies/:id` - Update anomaly (resolve)

### Statistics

- `GET /api/stats` - Get system statistics

## Device Simulator

Access the device simulator at `/simulator` to:
- Send single test metrics
- Send batch metrics for load testing
- Run continuous simulation with configurable intervals
- Monitor real-time activity logs

## Database Schema

### Tables

- **health_metrics**: Stores all health metric data
- **devices**: Stores device registration and status
- **anomalies**: Stores detected anomalies

### Indexes

Optimized indexes for:
- Device ID lookups
- Timestamp-based queries
- Metric type filtering
- Anomaly severity filtering

## CI/CD Pipeline

### Workflows

1. **CI Pipeline** (`ci.yml`)
   - Linting and code quality checks
   - TypeScript compilation
   - Unit tests
   - Build verification
   - Security scanning

2. **Deployment** (`deploy.yml`)
   - Automated deployment to Vercel
   - Database migrations
   - Smoke tests
   - Deployment notifications

3. **API Integration Tests** (`test-api.yml`)
   - Scheduled integration tests
   - API endpoint validation
   - Test reporting

4. **Performance Monitoring** (`performance-monitoring.yml`)
   - Daily performance benchmarks
   - Metric analysis
   - Performance reporting

### Required Secrets

Configure these secrets in your GitHub repository:

- `DATABASE_URL` - Production database connection string
- `TEST_DATABASE_URL` - Test database connection string
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `PRODUCTION_API_URL` - Production API URL for testing

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push to main branch

### Manual Deployment

\`\`\`bash
npm run build
vercel --prod
\`\`\`

## Performance Considerations

- Database indexes for optimized queries
- Connection pooling with Neon
- Serverless function optimization
- Automatic anomaly detection
- Real-time data updates with SWR

## Security

- Input validation on all API endpoints
- SQL injection prevention with parameterized queries
- Rate limiting (recommended for production)
- API authentication (recommended for production)
- Environment variable protection

## Monitoring

- Real-time dashboard with auto-refresh
- Anomaly alerts and notifications
- Device status tracking
- System statistics and metrics
- Performance monitoring

## Testing

Run tests:
\`\`\`bash
npm test
\`\`\`

Run linting:
\`\`\`bash
npm run lint
\`\`\`

Type checking:
\`\`\`bash
npx tsc --noEmit
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact the development team.
