-- Create health_metrics table to store all device health data
CREATE TABLE IF NOT EXISTS health_metrics (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Create indexes for common query patterns
  CONSTRAINT valid_metric_type CHECK (metric_type IN ('heart_rate', 'blood_pressure', 'temperature', 'oxygen_saturation', 'steps'))
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_device_id ON health_metrics(device_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON health_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_device_timestamp ON health_metrics(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metric_type ON health_metrics(metric_type);

-- Create a table for device metadata
CREATE TABLE IF NOT EXISTS devices (
  device_id VARCHAR(100) PRIMARY KEY,
  device_name VARCHAR(200),
  device_type VARCHAR(50),
  last_seen TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'maintenance'))
);

-- Create a table for anomaly detection results
CREATE TABLE IF NOT EXISTS anomalies (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value DECIMAL(10, 2) NOT NULL,
  threshold_min DECIMAL(10, 2),
  threshold_max DECIMAL(10, 2),
  severity VARCHAR(20) DEFAULT 'medium',
  resolved BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX IF NOT EXISTS idx_anomalies_device ON anomalies(device_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_unresolved ON anomalies(resolved, detected_at DESC);
