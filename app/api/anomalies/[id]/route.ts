import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/anomalies/:id - Get a specific anomaly
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid anomaly ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM anomalies WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Anomaly not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error fetching anomaly:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// PATCH /api/anomalies/:id - Update anomaly (e.g., mark as resolved)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid anomaly ID" }, { status: 400 })
    }

    const body = await request.json()
    const { resolved } = body

    if (resolved === undefined) {
      return NextResponse.json({ error: "resolved field is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE anomalies 
      SET resolved = ${resolved}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Anomaly not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error updating anomaly:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
