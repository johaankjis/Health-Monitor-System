import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { detectAnomaly } from "@/lib/db"

// POST /api/ingest/batch - Batch ingest multiple health metrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!Array.isArray(body.metrics)) {
      return NextResponse.json({ error: 'Request body must contain a "metrics" array' }, { status: 400 })
    }

    const metrics = body.metrics
    const validMetricTypes = ["heart_rate", "blood_pressure", "temperature", "oxygen_saturation", "steps"]

    // Validate all metrics
    for (const metric of metrics) {
      if (!metric.device_id || !metric.metric_type || metric.value === undefined) {
        return NextResponse.json({ error: "Each metric must have device_id, metric_type, and value" }, { status: 400 })
      }

      if (!validMetricTypes.includes(metric.metric_type)) {
        return NextResponse.json({ error: `Invalid metric_type: ${metric.metric_type}` }, { status: 400 })
      }
    }

    const insertedMetrics = []
    const detectedAnomalies = []

    // Process each metric
    for (const metric of metrics) {
      const { device_id, metric_type, value, unit, timestamp } = metric
      const metricTimestamp = timestamp ? new Date(timestamp) : new Date()

      // Insert metric
      const result = await sql`
        INSERT INTO health_metrics (device_id, metric_type, value, unit, timestamp)
        VALUES (${device_id}, ${metric_type}, ${value}, ${unit || null}, ${metricTimestamp})
        RETURNING *
      `

      insertedMetrics.push(result[0])

      // Update device
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

        detectedAnomalies.push({
          device_id,
          metric_type,
          value,
          severity: anomalyCheck.severity,
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        inserted: insertedMetrics.length,
        anomalies_detected: detectedAnomalies.length,
        anomalies: detectedAnomalies,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error in batch ingestion:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
