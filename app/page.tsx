"use client"

import { Card } from "@/components/ui/card"

import { AnomalyList } from "@/components/anomaly-list"
import { DeviceList } from "@/components/device-list"
import { MetricsChart } from "@/components/metrics-chart"
import { StatsCard } from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import { fetchAnomalies, fetchDevices, fetchMetrics, fetchStats } from "@/lib/api-client"
import { Activity, AlertTriangle, Database, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import useSWR from "swr"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  // Fetch data using SWR for automatic revalidation
  const { data: statsData, error: statsError } = useSWR("/api/stats", fetchStats, {
    refreshInterval: 10000, // Refresh every 10 seconds
  })

  const { data: devicesData, error: devicesError } = useSWR("/api/devices", () => fetchDevices(), {
    refreshInterval: 30000,
  })

  const {
    data: anomaliesData,
    error: anomaliesError,
    mutate: mutateAnomalies,
  } = useSWR("/api/anomalies", () => fetchAnomalies({ resolved: false, limit: 10 }), {
    refreshInterval: 10000,
  })

  const { data: metricsData, error: metricsError } = useSWR("/api/metrics/recent", () =>
    fetchMetrics({ limit: 50 }).then((res) => {
      // Transform data for chart
      return res.data.map((m: any) => ({
        timestamp: new Date(m.timestamp).toLocaleTimeString(),
        value: m.value,
      }))
    }),
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const stats = statsData?.stats
  const devices = devicesData?.data || []
  const anomalies = anomaliesData?.data || []
  const metrics = metricsData || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Health Monitoring System</h1>
              <p className="text-sm text-muted-foreground">Real-time health metrics monitoring and anomaly detection</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/simulator">Device Simulator</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/api-docs">API Docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Metrics"
            value={stats?.total_metrics?.toLocaleString() || "0"}
            icon={Database}
            description="All-time health metrics collected"
          />
          <StatsCard
            title="Active Devices"
            value={`${stats?.active_devices || 0}/${stats?.total_devices || 0}`}
            icon={Activity}
            description="Currently active devices"
          />
          <StatsCard
            title="Unresolved Anomalies"
            value={stats?.unresolved_anomalies || "0"}
            icon={AlertTriangle}
            description="Requires attention"
          />
          <StatsCard
            title="24h Activity"
            value={stats?.recent_activity_24h?.toLocaleString() || "0"}
            icon={TrendingUp}
            description="Metrics in last 24 hours"
          />
        </div>

        {/* Charts Section */}
        {metrics.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <MetricsChart
              title="Recent Metrics"
              description="Last 50 health metrics received"
              data={metrics}
              metricType="Health Metrics"
            />
            <div className="grid gap-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Metrics by Type</h3>
                <div className="space-y-2">
                  {stats?.metrics_by_type &&
                    Object.entries(stats.metrics_by_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{type.replace("_", " ")}</span>
                        <span className="font-medium">{(count as number).toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Anomalies by Severity</h3>
                <div className="space-y-2">
                  {stats?.anomalies_by_severity &&
                    Object.entries(stats.anomalies_by_severity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{severity}</span>
                        <span className="font-medium">{(count as number).toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Anomalies and Devices */}
        <div className="grid gap-4 md:grid-cols-2">
          <AnomalyList anomalies={anomalies} onResolve={() => mutateAnomalies()} />
          <DeviceList devices={devices.slice(0, 10)} />
        </div>
      </main>
    </div>
  )
}
