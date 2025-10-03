// Client-side API helper functions
export async function fetchStats(deviceId?: string) {
  const url = deviceId ? `/api/stats?device_id=${deviceId}` : "/api/stats"
  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch stats")
  return response.json()
}

export async function fetchDevices(status?: string) {
  const url = status ? `/api/devices?status=${status}` : "/api/devices"
  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch devices")
  return response.json()
}

export async function fetchAnomalies(params?: { device_id?: string; resolved?: boolean; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.device_id) searchParams.set("device_id", params.device_id)
  if (params?.resolved !== undefined) searchParams.set("resolved", String(params.resolved))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  const url = `/api/anomalies?${searchParams.toString()}`
  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch anomalies")
  return response.json()
}

export async function fetchMetrics(params?: {
  device_id?: string
  metric_type?: string
  start_date?: string
  end_date?: string
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params?.device_id) searchParams.set("device_id", params.device_id)
  if (params?.metric_type) searchParams.set("metric_type", params.metric_type)
  if (params?.start_date) searchParams.set("start_date", params.start_date)
  if (params?.end_date) searchParams.set("end_date", params.end_date)
  if (params?.limit) searchParams.set("limit", String(params.limit))

  const url = `/api/metrics?${searchParams.toString()}`
  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch metrics")
  return response.json()
}

export async function resolveAnomaly(id: number) {
  const response = await fetch(`/api/anomalies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolved: true }),
  })
  if (!response.ok) throw new Error("Failed to resolve anomaly")
  return response.json()
}
