import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/anomalies - Get all anomalies with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deviceId = searchParams.get("device_id")
    const severity = searchParams.get("severity")
    const resolved = searchParams.get("resolved")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const resolvedBool = resolved === "true" ? true : resolved === "false" ? false : null

    // Build query based on filters
    let result
    if (deviceId && severity && resolvedBool !== null) {
      result = await sql`
        SELECT * FROM anomalies 
        WHERE device_id = ${deviceId} 
          AND severity = ${severity}
          AND resolved = ${resolvedBool}
        ORDER BY detected_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (deviceId && severity) {
      result = await sql`
        SELECT * FROM anomalies 
        WHERE device_id = ${deviceId} 
          AND severity = ${severity}
        ORDER BY detected_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (deviceId && resolvedBool !== null) {
      result = await sql`
        SELECT * FROM anomalies 
        WHERE device_id = ${deviceId}
          AND resolved = ${resolvedBool}
        ORDER BY detected_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (severity && resolvedBool !== null) {
      result = await sql`
        SELECT * FROM anomalies 
        WHERE severity = ${severity}
          AND resolved = ${resolvedBool}
        ORDER BY detected_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (deviceId) {
      result = await sql`
        SELECT * FROM anomalies 
        WHERE device_id = ${deviceId}
        ORDER BY detected_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (severity) {
      result = await sql`
        SELECT * FROM anomalies 
        WHERE severity = ${severity}
        ORDER BY detected_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (resolvedBool !== null) {
      result = await sql`
        SELECT * FROM anomalies 
        WHERE resolved = ${resolvedBool}
        ORDER BY detected_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
        SELECT * FROM anomalies 
        ORDER BY detected_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Get total count
    let countResult
    if (deviceId && severity && resolvedBool !== null) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM anomalies 
        WHERE device_id = ${deviceId} 
          AND severity = ${severity}
          AND resolved = ${resolvedBool}
      `
    } else if (deviceId && severity) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM anomalies 
        WHERE device_id = ${deviceId} 
          AND severity = ${severity}
      `
    } else if (deviceId && resolvedBool !== null) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM anomalies 
        WHERE device_id = ${deviceId}
          AND resolved = ${resolvedBool}
      `
    } else if (severity && resolvedBool !== null) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM anomalies 
        WHERE severity = ${severity}
          AND resolved = ${resolvedBool}
      `
    } else if (deviceId) {
      countResult = await sql`SELECT COUNT(*) as total FROM anomalies WHERE device_id = ${deviceId}`
    } else if (severity) {
      countResult = await sql`SELECT COUNT(*) as total FROM anomalies WHERE severity = ${severity}`
    } else if (resolvedBool !== null) {
      countResult = await sql`SELECT COUNT(*) as total FROM anomalies WHERE resolved = ${resolvedBool}`
    } else {
      countResult = await sql`SELECT COUNT(*) as total FROM anomalies`
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
    console.error("[v0] Error fetching anomalies:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
