import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/devices/:deviceId - Get device details
export async function GET(request: NextRequest, { params }: { params: { deviceId: string } }) {
  try {
    const { deviceId } = params

    const result = await sql`
      SELECT * FROM devices WHERE device_id = ${deviceId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error fetching device:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// PATCH /api/devices/:deviceId - Update device details
export async function PATCH(request: NextRequest, { params }: { params: { deviceId: string } }) {
  try {
    const { deviceId } = params
    const body = await request.json()
    const { device_name, device_type, status } = body

    // Check if device exists
    const existing = await sql`
      SELECT * FROM devices WHERE device_id = ${deviceId}
    `

    if (existing.length === 0) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (device_name !== undefined) {
      updates.push(`device_name = $${paramIndex}`)
      values.push(device_name)
      paramIndex++
    }

    if (device_type !== undefined) {
      updates.push(`device_type = $${paramIndex}`)
      values.push(device_type)
      paramIndex++
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(deviceId)
    const query = `UPDATE devices SET ${updates.join(", ")} WHERE device_id = $${paramIndex} RETURNING *`

    const result = await sql(query, values)

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error updating device:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// DELETE /api/devices/:deviceId - Delete a device
export async function DELETE(request: NextRequest, { params }: { params: { deviceId: string } }) {
  try {
    const { deviceId } = params

    const result = await sql`
      DELETE FROM devices WHERE device_id = ${deviceId} RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Device deleted successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error deleting device:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
