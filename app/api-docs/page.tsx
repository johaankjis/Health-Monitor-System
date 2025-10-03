"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const endpoints = [
    {
      method: "POST",
      path: "/api/ingest",
      description: "Ingest a single health metric",
      example: JSON.stringify(
        {
          device_id: "device-001",
          metric_type: "heart_rate",
          value: 72,
          unit: "bpm",
          timestamp: "2025-01-10T12:00:00Z",
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: "/api/ingest/batch",
      description: "Ingest multiple health metrics at once",
      example: JSON.stringify(
        {
          metrics: [
            {
              device_id: "device-001",
              metric_type: "heart_rate",
              value: 72,
              unit: "bpm",
            },
            {
              device_id: "device-002",
              metric_type: "temperature",
              value: 36.8,
              unit: "°C",
            },
          ],
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: "/api/metrics",
      description: "Query health metrics with filters",
      example: "?device_id=device-001&metric_type=heart_rate&limit=50",
    },
    {
      method: "GET",
      path: "/api/devices",
      description: "Get all registered devices",
      example: "?status=active&limit=100",
    },
    {
      method: "GET",
      path: "/api/anomalies",
      description: "Get detected anomalies",
      example: "?resolved=false&severity=critical",
    },
    {
      method: "GET",
      path: "/api/stats",
      description: "Get system statistics and metrics summary",
      example: "?device_id=device-001",
    },
    {
      method: "PATCH",
      path: "/api/anomalies/:id",
      description: "Update an anomaly (e.g., mark as resolved)",
      example: JSON.stringify({ resolved: true }, null, 2),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">API Documentation</h1>
              <p className="text-sm text-muted-foreground">RESTful API endpoints for the health monitoring system</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                        endpoint.method === "GET"
                          ? "bg-blue-500/20 text-blue-400"
                          : endpoint.method === "POST"
                            ? "bg-green-500/20 text-green-400"
                            : endpoint.method === "PATCH"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <CardTitle className="text-lg font-mono">{endpoint.path}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(endpoint.path, endpoint.path)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <pre className="text-xs font-mono overflow-x-auto flex-1">
                      <code>{endpoint.example}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard(endpoint.example, `${endpoint.path}-example`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {copiedEndpoint === endpoint.path && (
                  <p className="text-xs text-green-500 mt-2">Copied to clipboard!</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>API authentication and security</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Currently, the API does not require authentication for testing purposes. In production, implement proper
              authentication using API keys or OAuth tokens.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Rate Limiting</CardTitle>
            <CardDescription>API usage limits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No rate limiting is currently enforced. For production deployment, consider implementing rate limiting to
              prevent abuse and ensure fair usage.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
