# Deployment Guide

## Prerequisites

1. GitHub account with repository access
2. Vercel account
3. Neon database account

## Initial Setup

### 1. Database Setup

1. Create a Neon database
2. Copy the connection string
3. Run the SQL scripts in order:
   - `scripts/001-create-health-metrics-table.sql`
   - `scripts/002-seed-sample-data.sql`

### 2. Vercel Setup

1. Import project to Vercel
2. Configure environment variables:
   - `DATABASE_URL`
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - (All Neon-provided variables)

### 3. GitHub Actions Setup

1. Go to repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `DATABASE_URL`
   - `TEST_DATABASE_URL`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `PRODUCTION_API_URL`

## Deployment Process

### Automatic Deployment

1. Push to `main` branch
2. GitHub Actions runs CI pipeline
3. On success, deploys to Vercel
4. Runs smoke tests
5. Sends deployment notification

### Manual Deployment

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
\`\`\`

## Post-Deployment

### 1. Verify Deployment

- Check deployment URL
- Test API endpoints
- Verify database connectivity
- Check monitoring dashboard

### 2. Run Smoke Tests

\`\`\`bash
curl https://your-app.vercel.app/api/ingest
curl https://your-app.vercel.app/api/stats
\`\`\`

### 3. Monitor Performance

- Check Vercel Analytics
- Monitor API response times
- Review error logs
- Check database performance

## Rollback Procedure

If deployment fails:

1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"
4. Verify rollback success

## Monitoring

### Vercel Dashboard

- Function logs
- Performance metrics
- Error tracking
- Analytics

### Database Monitoring

- Query performance
- Connection pool status
- Storage usage
- Active connections

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check Neon database status
   - Verify IP allowlist settings

2. **Build Failures**
   - Check TypeScript errors
   - Verify all dependencies installed
   - Review build logs

3. **API Errors**
   - Check function logs in Vercel
   - Verify environment variables
   - Test endpoints locally

## Maintenance

### Regular Tasks

- Monitor error rates
- Review performance metrics
- Update dependencies
- Backup database
- Review security alerts

### Scaling Considerations

- Monitor function execution time
- Check database connection limits
- Review API rate limits
- Consider caching strategies
