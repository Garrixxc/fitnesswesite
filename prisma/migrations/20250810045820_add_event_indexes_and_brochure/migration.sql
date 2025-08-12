-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_sport_idx" ON "Event"("sport");

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "Event_location_trgm_idx"
ON "Event" USING GIN (lower("location") gin_trgm_ops);
