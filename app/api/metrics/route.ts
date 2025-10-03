import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/metrics - Query health metrics with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deviceId = searchParams.get("device_id")
    const metricType = searchParams.get("metric_type")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const startDateTime = startDate ? new Date(startDate) : null
    const endDateTime = endDate ? new Date(endDate) : null

    // Build the query based on filters
    let result
    if (deviceId && metricType && startDateTime && endDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId} 
          AND metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (deviceId && metricType && startDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId} 
          AND metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (deviceId && metricType) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId} 
          AND metric_type = ${metricType}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (deviceId && startDateTime && endDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (deviceId && startDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND timestamp >= ${startDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (deviceId) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE device_id = ${deviceId}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (metricType && startDateTime && endDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (metricType && startDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (metricType) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE metric_type = ${metricType}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (startDateTime && endDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (startDateTime) {
      result = await sql`
        SELECT * FROM health_metrics 
        WHERE timestamp >= ${startDateTime}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
        SELECT * FROM health_metrics 
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Get total count for pagination
    let countResult
    if (deviceId && metricType && startDateTime && endDateTime) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM health_metrics 
        WHERE device_id = ${deviceId} 
          AND metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
      `
    } else if (deviceId && metricType && startDateTime) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM health_metrics 
        WHERE device_id = ${deviceId} 
          AND metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
      `
    } else if (deviceId && metricType) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM health_metrics 
        WHERE device_id = ${deviceId} 
          AND metric_type = ${metricType}
      `
    } else if (deviceId && startDateTime && endDateTime) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
      `
    } else if (deviceId && startDateTime) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM health_metrics 
        WHERE device_id = ${deviceId}
          AND timestamp >= ${startDateTime}
      `
    } else if (deviceId) {
      countResult = await sql`SELECT COUNT(*) as total FROM health_metrics WHERE device_id = ${deviceId}`
    } else if (metricType && startDateTime && endDateTime) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM health_metrics 
        WHERE metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
      `
    } else if (metricType && startDateTime) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM health_metrics 
        WHERE metric_type = ${metricType}
          AND timestamp >= ${startDateTime}
      `
    } else if (metricType) {
      countResult = await sql`SELECT COUNT(*) as total FROM health_metrics WHERE metric_type = ${metricType}`
    } else if (startDateTime && endDateTime) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM health_metrics 
        WHERE timestamp >= ${startDateTime}
          AND timestamp <= ${endDateTime}
      `
    } else if (startDateTime) {
      countResult = await sql`SELECT COUNT(*) as total FROM health_metrics WHERE timestamp >= ${startDateTime}`
    } else {
      countResult = await sql`SELECT COUNT(*) as total FROM health_metrics`
    }

    const total = Number.parseInt(countResult[0].total)

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching metrics:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
