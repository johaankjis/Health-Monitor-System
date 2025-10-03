import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { detectAnomaly } from "@/lib/db"

// POST /api/ingest - Ingest health metrics from devices
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { device_id, metric_type, value, unit, timestamp } = body

    if (!device_id || !metric_type || value === undefined) {
      return NextResponse.json({ error: "Missing required fields: device_id, metric_type, value" }, { status: 400 })
    }

    // Validate metric type
    const validMetricTypes = ["heart_rate", "blood_pressure", "temperature", "oxygen_saturation", "steps"]
    if (!validMetricTypes.includes(metric_type)) {
      return NextResponse.json(
        { error: `Invalid metric_type. Must be one of: ${validMetricTypes.join(", ")}` },
        { status: 400 },
      )
    }

    // Insert the health metric
    const metricTimestamp = timestamp ? new Date(timestamp) : new Date()

    const result = await sql`
      INSERT INTO health_metrics (device_id, metric_type, value, unit, timestamp)
      VALUES (${device_id}, ${metric_type}, ${value}, ${unit || null}, ${metricTimestamp})
      RETURNING *
    `

    // Update device last_seen
    await sql`
      INSERT INTO devices (device_id, last_seen, status)
      VALUES (${device_id}, NOW(), 'active')
      ON CONFLICT (device_id) 
      DO UPDATE SET last_seen = NOW(), status = 'active'
    `

    // Check for anomalies
    const anomalyCheck = detectAnomaly(metric_type, value)

    if (anomalyCheck.isAnomaly) {
      await sql`
        INSERT INTO anomalies (device_id, metric_type, value, threshold_min, threshold_max, severity)
        VALUES (
          ${device_id}, 
          ${metric_type}, 
          ${value}, 
          ${anomalyCheck.thresholdMin || null}, 
          ${anomalyCheck.thresholdMax || null}, 
          ${anomalyCheck.severity}
        )
      `
    }

    return NextResponse.json(
      {
        success: true,
        data: result[0],
        anomaly: anomalyCheck.isAnomaly
          ? {
              detected: true,
              severity: anomalyCheck.severity,
            }
          : { detected: false },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error ingesting health metric:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// GET /api/ingest - Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "health-metrics-ingestion",
    timestamp: new Date().toISOString(),
  })
}
