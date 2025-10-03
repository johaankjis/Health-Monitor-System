import { neon } from "@neondatabase/serverless"

// Create a singleton SQL client
const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Type definitions for our database models
export interface HealthMetric {
  id: number
  device_id: string
  timestamp: Date
  metric_type: "heart_rate" | "blood_pressure" | "temperature" | "oxygen_saturation" | "steps"
  value: number
  unit?: string
  created_at: Date
}

export interface Device {
  device_id: string
  device_name?: string
  device_type?: string
  last_seen?: Date
  status: "active" | "inactive" | "maintenance"
  created_at: Date
}

export interface Anomaly {
  id: number
  device_id: string
  metric_type: string
  detected_at: Date
  value: number
  threshold_min?: number
  threshold_max?: number
  severity: "low" | "medium" | "high" | "critical"
  resolved: boolean
}

// Helper function to detect anomalies based on thresholds
export function detectAnomaly(
  metricType: string,
  value: number,
): {
  isAnomaly: boolean
  severity: "low" | "medium" | "high" | "critical"
  thresholdMin?: number
  thresholdMax?: number
} {
  const thresholds: Record<string, { min: number; max: number }> = {
    heart_rate: { min: 60, max: 100 },
    blood_pressure: { min: 90, max: 140 },
    temperature: { min: 36.1, max: 37.2 },
    oxygen_saturation: { min: 95, max: 100 },
    steps: { min: 0, max: 50000 },
  }

  const threshold = thresholds[metricType]
  if (!threshold) {
    return { isAnomaly: false, severity: "low" }
  }

  const isAnomaly = value < threshold.min || value > threshold.max

  let severity: "low" | "medium" | "high" | "critical" = "low"
  if (isAnomaly) {
    const deviation = Math.max(
      Math.abs(value - threshold.min) / threshold.min,
      Math.abs(value - threshold.max) / threshold.max,
    )

    if (deviation > 0.5) severity = "critical"
    else if (deviation > 0.3) severity = "high"
    else if (deviation > 0.15) severity = "medium"
    else severity = "low"
  }

  return {
    isAnomaly,
    severity,
    thresholdMin: threshold.min,
    thresholdMax: threshold.max,
  }
}
