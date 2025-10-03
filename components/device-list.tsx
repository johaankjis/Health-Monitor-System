"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock } from "lucide-react"

interface Device {
  device_id: string
  device_name?: string
  device_type?: string
  last_seen?: string
  status: "active" | "inactive" | "maintenance"
  created_at: string
}

interface DeviceListProps {
  devices: Device[]
}

export function DeviceList({ devices }: DeviceListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "maintenance":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>{devices.length} devices registered</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.device_id}
              className="flex items-center justify-between p-3 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${getStatusDot(device.status)}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{device.device_name || device.device_id}</span>
                    <Badge variant={getStatusColor(device.status)} className="text-xs">
                      {device.status}
                    </Badge>
                  </div>
                  {device.device_type && <p className="text-xs text-muted-foreground">{device.device_type}</p>}
                  {device.last_seen && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      Last seen: {new Date(device.last_seen).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
