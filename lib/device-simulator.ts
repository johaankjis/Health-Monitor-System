// Device simulator utility functions
export interface SimulatedMetric {
  device_id: string
  metric_type: "heart_rate" | "blood_pressure" | "temperature" | "oxygen_saturation" | "steps"
  value: number
  unit: string
  timestamp: string
}

export function generateRandomMetric(
  deviceId: string,
  metricType: "heart_rate" | "blood_pressure" | "temperature" | "oxygen_saturation" | "steps",
  includeAnomaly = false,
): SimulatedMetric {
  const baseValues: Record<string, { min: number; max: number; unit: string }> = {
    heart_rate: { min: 60, max: 100, unit: "bpm" },
    blood_pressure: { min: 90, max: 140, unit: "mmHg" },
    temperature: { min: 36.1, max: 37.2, unit: "°C" },
    oxygen_saturation: { min: 95, max: 100, unit: "%" },
    steps: { min: 0, max: 10000, unit: "steps" },
  }

  const config = baseValues[metricType]
  let value: number

  if (includeAnomaly) {
    // Generate anomalous value (outside normal range)
    const isHigh = Math.random() > 0.5
    if (isHigh) {
      value = config.max + Math.random() * (config.max * 0.3)
    } else {
      value = config.min - Math.random() * (config.min * 0.3)
    }
  } else {
    // Generate normal value
    value = config.min + Math.random() * (config.max - config.min)
  }

  return {
    device_id: deviceId,
    metric_type: metricType,
    value: Number(value.toFixed(2)),
    unit: config.unit,
    timestamp: new Date().toISOString(),
  }
}

export function generateBatchMetrics(deviceIds: string[], count: number, anomalyRate = 0.1): SimulatedMetric[] {
  const metricTypes: Array<"heart_rate" | "blood_pressure" | "temperature" | "oxygen_saturation" | "steps"> = [
    "heart_rate",
    "blood_pressure",
    "temperature",
    "oxygen_saturation",
    "steps",
  ]

  const metrics: SimulatedMetric[] = []

  for (let i = 0; i < count; i++) {
    const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)]
    const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)]
    const includeAnomaly = Math.random() < anomalyRate

    metrics.push(generateRandomMetric(deviceId, metricType, includeAnomaly))
  }

  return metrics
}

export async function sendMetric(metric: SimulatedMetric) {
  const response = await fetch("/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metric),
  })

  if (!response.ok) {
    throw new Error(`Failed to send metric: ${response.statusText}`)
  }

  return response.json()
}

export async function sendBatchMetrics(metrics: SimulatedMetric[]) {
  const response = await fetch("/api/ingest/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metrics }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send batch metrics: ${response.statusText}`)
  }

  return response.json()
}
