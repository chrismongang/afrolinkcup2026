-- Remove third-place stage and restrict halftime to KO matches only

-- Remove any existing third-place matches (cascades to related data)
DELETE FROM matches WHERE stage = 'THIRD_PLACE';

-- Normalize existing statuses to satisfy new constraints
UPDATE matches
SET status = 'LIVE_FIRST_HALF'
WHERE stage IN ('SEMIFINAL', 'FINAL') AND status = 'LIVE';

UPDATE matches
SET status = 'LIVE'
WHERE stage = 'GROUP'
  AND status IN ('LIVE_FIRST_HALF', 'HALF_TIME', 'LIVE_SECOND_HALF', 'EXTRA_TIME', 'PENALTIES');

-- Update stage constraint to remove THIRD_PLACE
ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_stage_check;

ALTER TABLE matches
  ADD CONSTRAINT matches_stage_check
  CHECK (stage IN ('GROUP', 'SEMIFINAL', 'FINAL'));

-- Enforce stage-specific status rules
ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_stage_status_check;

ALTER TABLE matches
  ADD CONSTRAINT matches_stage_status_check
  CHECK (
    (stage = 'GROUP' AND status IN ('SCHEDULED', 'LIVE', 'FINISHED')) OR
    (stage IN ('SEMIFINAL', 'FINAL') AND status IN (
      'SCHEDULED',
      'LIVE_FIRST_HALF',
      'HALF_TIME',
      'LIVE_SECOND_HALF',
      'EXTRA_TIME',
      'PENALTIES',
      'FINISHED'
    ))
  );
