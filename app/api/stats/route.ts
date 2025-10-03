import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/stats - Get system statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deviceId = searchParams.get("device_id")

    // Get total metrics count
    const metricsCount = deviceId
      ? await sql`SELECT COUNT(*) as count FROM health_metrics WHERE device_id = ${deviceId}`
      : await sql`SELECT COUNT(*) as count FROM health_metrics`

    // Get total devices count
    const devicesCount = await sql`SELECT COUNT(*) as count FROM devices`

    // Get active devices count
    const activeDevicesCount = await sql`
      SELECT COUNT(*) as count FROM devices WHERE status = 'active'
    `

    // Get unresolved anomalies count
    const unresolvedAnomaliesCount = deviceId
      ? await sql`SELECT COUNT(*) as count FROM anomalies WHERE resolved = false AND device_id = ${deviceId}`
      : await sql`SELECT COUNT(*) as count FROM anomalies WHERE resolved = false`

    // Get anomalies by severity
    const anomaliesBySeverity = deviceId
      ? await sql`
          SELECT severity, COUNT(*) as count 
          FROM anomalies 
          WHERE device_id = ${deviceId}
          GROUP BY severity
        `
      : await sql`
          SELECT severity, COUNT(*) as count 
          FROM anomalies 
          GROUP BY severity
        `

    // Get metrics by type
    const metricsByType = deviceId
      ? await sql`
          SELECT metric_type, COUNT(*) as count 
          FROM health_metrics 
          WHERE device_id = ${deviceId}
          GROUP BY metric_type
        `
      : await sql`
          SELECT metric_type, COUNT(*) as count 
          FROM health_metrics 
          GROUP BY metric_type
        `

    // Get recent activity (last 24 hours)
    const recentActivity = deviceId
      ? await sql`
          SELECT COUNT(*) as count 
          FROM health_metrics 
          WHERE timestamp >= NOW() - INTERVAL '24 hours'
          AND device_id = ${deviceId}
        `
      : await sql`
          SELECT COUNT(*) as count 
          FROM health_metrics 
          WHERE timestamp >= NOW() - INTERVAL '24 hours'
        `

    return NextResponse.json({
      success: true,
      stats: {
        total_metrics: Number.parseInt(metricsCount[0].count),
        total_devices: Number.parseInt(devicesCount[0].count),
        active_devices: Number.parseInt(activeDevicesCount[0].count),
        unresolved_anomalies: Number.parseInt(unresolvedAnomaliesCount[0].count),
        recent_activity_24h: Number.parseInt(recentActivity[0].count),
        anomalies_by_severity: anomaliesBySeverity.reduce(
          (acc, row) => {
            acc[row.severity] = Number.parseInt(row.count)
            return acc
          },
          {} as Record<string, number>,
        ),
        metrics_by_type: metricsByType.reduce(
          (acc, row) => {
            acc[row.metric_type] = Number.parseInt(row.count)
            return acc
          },
          {} as Record<string, number>,
        ),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
