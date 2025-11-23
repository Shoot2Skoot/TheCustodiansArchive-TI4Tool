-- Add Mecatol Rex owner tracking to game_state table
-- This allows tracking which player currently controls Mecatol Rex

ALTER TABLE game_state
ADD COLUMN mecatol_rex_owner_id UUID REFERENCES players(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_game_state_mecatol_owner ON game_state(mecatol_rex_owner_id);

-- Add comment to document the column
COMMENT ON COLUMN game_state.mecatol_rex_owner_id IS 'References the player who currently controls Mecatol Rex';
