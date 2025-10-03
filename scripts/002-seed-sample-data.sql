-- Seed sample devices for testing
INSERT INTO devices (device_id, device_name, device_type, status)
VALUES 
  ('device-001', 'Patient Monitor A', 'Wearable', 'active'),
  ('device-002', 'Patient Monitor B', 'Wearable', 'active'),
  ('device-003', 'Patient Monitor C', 'Wearable', 'active'),
  ('device-004', 'Patient Monitor D', 'Wearable', 'inactive'),
  ('device-005', 'Patient Monitor E', 'Wearable', 'maintenance')
ON CONFLICT (device_id) DO NOTHING;

-- Seed sample health metrics
INSERT INTO health_metrics (device_id, metric_type, value, unit, timestamp)
VALUES
  ('device-001', 'heart_rate', 72, 'bpm', NOW() - INTERVAL '1 hour'),
  ('device-001', 'blood_pressure', 120, 'mmHg', NOW() - INTERVAL '1 hour'),
  ('device-001', 'temperature', 36.8, '°C', NOW() - INTERVAL '1 hour'),
  ('device-001', 'oxygen_saturation', 98, '%', NOW() - INTERVAL '1 hour'),
  ('device-002', 'heart_rate', 68, 'bpm', NOW() - INTERVAL '30 minutes'),
  ('device-002', 'blood_pressure', 115, 'mmHg', NOW() - INTERVAL '30 minutes'),
  ('device-002', 'temperature', 36.5, '°C', NOW() - INTERVAL '30 minutes'),
  ('device-003', 'heart_rate', 150, 'bpm', NOW() - INTERVAL '15 minutes'),
  ('device-003', 'blood_pressure', 160, 'mmHg', NOW() - INTERVAL '15 minutes'),
  ('device-003', 'temperature', 38.5, '°C', NOW() - INTERVAL '15 minutes');

-- Seed sample anomalies
INSERT INTO anomalies (device_id, metric_type, value, threshold_min, threshold_max, severity, resolved)
VALUES
  ('device-003', 'heart_rate', 150, 60, 100, 'critical', false),
  ('device-003', 'blood_pressure', 160, 90, 140, 'high', false),
  ('device-003', 'temperature', 38.5, 36.1, 37.2, 'high', false);
