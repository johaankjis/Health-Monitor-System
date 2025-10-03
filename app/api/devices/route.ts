import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/devices - Get all devices with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let result
    if (status) {
      result = await sql`
        SELECT * FROM devices 
        WHERE status = ${status}
        ORDER BY last_seen DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
        SELECT * FROM devices 
        ORDER BY last_seen DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Get total count
    let countResult
    if (status) {
      countResult = await sql`SELECT COUNT(*) as total FROM devices WHERE status = ${status}`
    } else {
      countResult = await sql`SELECT COUNT(*) as total FROM devices`
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
    console.error("[v0] Error fetching devices:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST /api/devices - Register a new device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { device_id, device_name, device_type } = body

    if (!device_id) {
      return NextResponse.json({ error: "device_id is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO devices (device_id, device_name, device_type, status)
      VALUES (${device_id}, ${device_name || null}, ${device_type || null}, 'active')
      ON CONFLICT (device_id) 
      DO UPDATE SET 
        device_name = COALESCE(${device_name}, devices.device_name),
        device_type = COALESCE(${device_type}, devices.device_type),
        status = 'active'
      RETURNING *
    `

    return NextResponse.json(
      {
        success: true,
        data: result[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error registering device:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
