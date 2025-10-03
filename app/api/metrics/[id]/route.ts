import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/metrics/:id - Get a specific metric by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid metric ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM health_metrics WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error fetching metric:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// DELETE /api/metrics/:id - Delete a specific metric
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid metric ID" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM health_metrics WHERE id = ${id} RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Metric deleted successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error deleting metric:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
