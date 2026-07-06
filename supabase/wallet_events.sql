-- Ejecuta esto en el SQL Editor de Supabase
-- Tabla de auditoría del ciclo de vida de Apple Wallet passes

CREATE TABLE IF NOT EXISTS wallet_events (
  id                        uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at                timestamptz DEFAULT now() NOT NULL,
  serial_number             text        NOT NULL,
  device_library_identifier text,
  event_type                text        NOT NULL,
  -- valores posibles de event_type:
  --   'registration'                  POST /v1/devices/.../registrations/...
  --   'unregistration'                DELETE /v1/devices/.../registrations/...
  --   'push_sent'                     APNs devolvió 200
  --   'push_failed'                   APNs devolvió non-200 (incluye 410/BadDeviceToken)
  --   'push_skipped_no_registration'  0 dispositivos registrados para ese serial
  --   'get_registrations'             iOS pidió lista de passes actualizados
  detail                    jsonb
);

CREATE INDEX IF NOT EXISTS idx_wallet_events_serial_time
  ON wallet_events (serial_number, created_at DESC);
