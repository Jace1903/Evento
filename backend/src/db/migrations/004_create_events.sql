CREATE TYPE event_source AS ENUM ('eventbrite', 'luma', 'meetup', 'cerebral_valley', 'manual');

CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id      TEXT,                          -- source platform's own ID (for deduplication)
  source           event_source NOT NULL,
  source_url       TEXT,

  title            TEXT NOT NULL,
  description      TEXT,
  image_url        TEXT,

  category_id      INTEGER REFERENCES categories(id) ON DELETE SET NULL,

  start_at         TIMESTAMPTZ NOT NULL,
  end_at           TIMESTAMPTZ,

  location_name    TEXT,
  location_address TEXT,
  latitude         NUMERIC(9, 6),
  longitude        NUMERIC(9, 6),

  is_free          BOOLEAN NOT NULL DEFAULT FALSE,
  price_min        NUMERIC(10, 2),
  price_max        NUMERIC(10, 2),

  attendee_count   INTEGER NOT NULL DEFAULT 0,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (source, external_id)   -- prevents duplicate ingestion from same source
);

CREATE INDEX idx_events_category  ON events (category_id);
CREATE INDEX idx_events_start_at  ON events (start_at);
CREATE INDEX idx_events_source    ON events (source);
CREATE INDEX idx_events_is_free   ON events (is_free);
