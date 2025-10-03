import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/devices/:deviceId/metrics - Get all metrics for a specific device
export async function GET(request: NextRequest, { params }: { params: { deviceId: string } }) {
  try {
    const { deviceId } = params
    const searchParams = request.nextUrl.searchParams
    const metricType = searchParams.get("metric_type")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const startDateTime = startDate ? new Date(startDate) : null
    const endDateTime = endDate ? new Date(endDate) : null

    // Build query based on filters
    let result
    if (metricType && startDateTime && endDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (metricType && startDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (metricType) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND metric_type = ${metricType}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (startDateTime && endDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (startDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND timestamp >= ${startDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return NextResponse.json({
      success: true,
      device_id: deviceId,
      data: result,
      count: result.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching device metrics:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
