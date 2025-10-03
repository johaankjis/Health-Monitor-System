"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { resolveAnomaly } from "@/lib/api-client"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface Anomaly {
  id: number
  device_id: string
  metric_type: string
  detected_at: string
  value: number
  threshold_min?: number
  threshold_max?: number
  severity: "low" | "medium" | "high" | "critical"
  resolved: boolean
}

interface AnomalyListProps {
  anomalies: Anomaly[]
  onResolve?: () => void
}

export function AnomalyList({ anomalies, onResolve }: AnomalyListProps) {
  const [resolvingIds, setResolvingIds] = useState<Set<number>>(new Set())

  const handleResolve = async (id: number) => {
    setResolvingIds((prev) => new Set(prev).add(id))
    try {
      await resolveAnomaly(id)
      onResolve?.()
    } catch (error) {
      console.error("[v0] Failed to resolve anomaly:", error)
    } finally {
      setResolvingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anomalies</CardTitle>
          <CardDescription>No anomalies detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            All systems operating normally
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anomalies</CardTitle>
        <CardDescription>{anomalies.length} anomalies detected</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className="flex items-start justify-between p-3 rounded-lg border border-border bg-card/50"
            >
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{anomaly.device_id}</span>
                    <Badge variant={getSeverityColor(anomaly.severity)} className="text-xs">
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {anomaly.metric_type}: {anomaly.value}
                    {anomaly.threshold_min && anomaly.threshold_max && (
                      <span className="ml-1">
                        (expected: {anomaly.threshold_min}-{anomaly.threshold_max})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(anomaly.detected_at).toLocaleString()}</p>
                </div>
              </div>
              {!anomaly.resolved && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolve(anomaly.id)}
                  disabled={resolvingIds.has(anomaly.id)}
                >
                  {resolvingIds.has(anomaly.id) ? "Resolving..." : "Resolve"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
