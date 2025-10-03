"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { generateBatchMetrics, generateRandomMetric, sendBatchMetrics, sendMetric } from "@/lib/device-simulator"
import { Play, Square } from "lucide-react"
import { useState } from "react"

export function SimulatorControls() {
  const [deviceId, setDeviceId] = useState("device-001")
  const [metricType, setMetricType] = useState<
    "heart_rate" | "blood_pressure" | "temperature" | "oxygen_saturation" | "steps"
  >("heart_rate")
  const [includeAnomaly, setIncludeAnomaly] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationInterval, setSimulationInterval] = useState(5)
  const [batchSize, setBatchSize] = useState(10)
  const [anomalyRate, setAnomalyRate] = useState(10)
  const [logs, setLogs] = useState<string[]>([])
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 49)])
  }

  const handleSendSingle = async () => {
    try {
      const metric = generateRandomMetric(deviceId, metricType, includeAnomaly)
      const result = await sendMetric(metric)
      addLog(
        `✓ Sent ${metricType} for ${deviceId}: ${metric.value}${metric.unit}${result.anomaly?.detected ? " (ANOMALY)" : ""}`,
      )
    } catch (error) {
      addLog(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleSendBatch = async () => {
    try {
      const deviceIds = Array.from({ length: 5 }, (_, i) => `device-${String(i + 1).padStart(3, "0")}`)
      const metrics = generateBatchMetrics(deviceIds, batchSize, anomalyRate / 100)
      const result = await sendBatchMetrics(metrics)
      addLog(`✓ Sent batch of ${result.inserted} metrics, ${result.anomalies_detected} anomalies detected`)
    } catch (error) {
      addLog(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const startSimulation = () => {
    setIsSimulating(true)
    addLog("Started continuous simulation")

    const id = setInterval(async () => {
      try {
        const deviceIds = Array.from({ length: 5 }, (_, i) => `device-${String(i + 1).padStart(3, "0")}`)
        const metrics = generateBatchMetrics(deviceIds, 5, anomalyRate / 100)
        const result = await sendBatchMetrics(metrics)
        addLog(`✓ Auto-sent ${result.inserted} metrics, ${result.anomalies_detected} anomalies`)
      } catch (error) {
        addLog(`✗ Auto-send error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }, simulationInterval * 1000)

    setIntervalId(id)
  }

  const stopSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setIsSimulating(false)
    addLog("Stopped continuous simulation")
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Single Metric Sender */}
      <Card>
        <CardHeader>
          <CardTitle>Single Metric Sender</CardTitle>
          <CardDescription>Send individual health metrics to test the ingestion API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-id">Device ID</Label>
            <Input
              id="device-id"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="device-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-type">Metric Type</Label>
            <Select value={metricType} onValueChange={(value: any) => setMetricType(value)}>
              <SelectTrigger id="metric-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heart_rate">Heart Rate</SelectItem>
                <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="oxygen_saturation">Oxygen Saturation</SelectItem>
                <SelectItem value="steps">Steps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="anomaly-switch">Include Anomaly</Label>
            <Switch id="anomaly-switch" checked={includeAnomaly} onCheckedChange={setIncludeAnomaly} />
          </div>

          <Button onClick={handleSendSingle} className="w-full">
            Send Metric
          </Button>
        </CardContent>
      </Card>

      {/* Batch Sender */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Metric Sender</CardTitle>
          <CardDescription>Send multiple metrics at once for load testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Batch Size: {batchSize} metrics</Label>
            <Slider value={[batchSize]} onValueChange={(value) => setBatchSize(value[0])} min={1} max={100} step={1} />
          </div>

          <div className="space-y-2">
            <Label>Anomaly Rate: {anomalyRate}%</Label>
            <Slider
              value={[anomalyRate]}
              onValueChange={(value) => setAnomalyRate(value[0])}
              min={0}
              max={50}
              step={5}
            />
          </div>

          <Button onClick={handleSendBatch} className="w-full">
            Send Batch
          </Button>
        </CardContent>
      </Card>

      {/* Continuous Simulation */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Continuous Simulation</CardTitle>
          <CardDescription>Automatically send metrics at regular intervals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Interval: {simulationInterval} seconds</Label>
            <Slider
              value={[simulationInterval]}
              onValueChange={(value) => setSimulationInterval(value[0])}
              min={1}
              max={60}
              step={1}
              disabled={isSimulating}
            />
          </div>

          <div className="flex gap-2">
            {!isSimulating ? (
              <Button onClick={startSimulation} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Simulation
              </Button>
            ) : (
              <Button onClick={stopSimulation} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop Simulation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Real-time log of simulator actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 h-[300px] overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">No activity yet. Start sending metrics to see logs.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-foreground">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
