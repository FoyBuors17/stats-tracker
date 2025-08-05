// Database queries for CRUD operations

// ==================== TEAMS QUERIES ====================
export const teamQueries = {
  // CREATE
  createTeam: `
    INSERT INTO teams (city, name, season, sport)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,

  // READ
  getAllTeams: `
    SELECT * FROM teams
    ORDER BY season DESC, name ASC
  `,

  getTeamById: `
    SELECT * FROM teams 
    WHERE id = $1
  `,

  getTeamWithPlayers: `
    SELECT 
      t.*,
      json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'position', p.position,
          'jersey_number', p.jersey_number,
          'age', p.age
        )
      ) FILTER (WHERE p.id IS NOT NULL) as players
    FROM teams t
    LEFT JOIN players p ON t.id = p.team_id
    WHERE t.id = $1
    GROUP BY t.id
  `,

  // UPDATE
  updateTeam: `
    UPDATE teams 
    SET city = $2, name = $3, season = $4, sport = $5, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,

  // DELETE
  deleteTeam: `
    DELETE FROM teams 
    WHERE id = $1
    RETURNING *
  `
};

// ==================== PLAYERS QUERIES ====================
export const playerQueries = {
  // CREATE
  createPlayer: `
    INSERT INTO players (first_name, last_name, team_id, jersey_number, position)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,

  // READ
  getAllPlayers: `
    SELECT 
      p.*,
      t.name as team_name,
      CONCAT(p.first_name, ' ', p.last_name) as full_name
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    ORDER BY t.name ASC, p.jersey_number ASC
  `,

  getPlayerById: `
    SELECT 
      p.*,
      t.name as team_name,
      CONCAT(p.first_name, ' ', p.last_name) as full_name
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.id = $1
  `,

  getPlayersByTeam: `
    SELECT 
      p.*,
      CONCAT(p.first_name, ' ', p.last_name) as full_name
    FROM players p
    WHERE team_id = $1
    ORDER BY p.jersey_number ASC
  `,

  getPlayerWithStats: `
    SELECT 
      p.*,
      t.name as team_name,
      CONCAT(p.first_name, ' ', p.last_name) as full_name,
      json_agg(
        json_build_object(
          'id', ps.id,
          'season', ps.season,
          'games_played', ps.games_played,
          'goals', ps.goals,
          'assists', ps.assists,
          'minutes_played', ps.minutes_played
        )
      ) FILTER (WHERE ps.id IS NOT NULL) as stats
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    LEFT JOIN player_stats ps ON p.id = ps.player_id
    WHERE p.id = $1
    GROUP BY p.id, t.name
  `,

  // UPDATE
  updatePlayer: `
    UPDATE players 
    SET first_name = $2, last_name = $3, team_id = $4, jersey_number = $5, 
        position = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,

  // DELETE
  deletePlayer: `
    DELETE FROM players 
    WHERE id = $1
    RETURNING *
  `
};

// ==================== PLAYER STATS QUERIES ====================
export const statsQueries = {
  // CREATE
  createPlayerStats: `
    INSERT INTO player_stats (player_id, season, games_played, goals, assists, yellow_cards, red_cards, minutes_played)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,

  // READ
  getAllStats: `
    SELECT 
      ps.*,
      p.name as player_name,
      t.name as team_name
    FROM player_stats ps
    JOIN players p ON ps.player_id = p.id
    JOIN teams t ON p.team_id = t.id
    ORDER BY ps.created_at DESC
  `,

  getStatsByPlayer: `
    SELECT * FROM player_stats 
    WHERE player_id = $1
    ORDER BY season DESC
  `,

  getStatsBySeason: `
    SELECT 
      ps.*,
      p.name as player_name,
      t.name as team_name
    FROM player_stats ps
    JOIN players p ON ps.player_id = p.id
    JOIN teams t ON p.team_id = t.id
    WHERE ps.season = $1
    ORDER BY ps.goals DESC
  `,

  // UPDATE
  updatePlayerStats: `
    UPDATE player_stats 
    SET games_played = $3, goals = $4, assists = $5, yellow_cards = $6, 
        red_cards = $7, minutes_played = $8, updated_at = CURRENT_TIMESTAMP
    WHERE player_id = $1 AND season = $2
    RETURNING *
  `,

  // DELETE
  deletePlayerStats: `
    DELETE FROM player_stats 
    WHERE id = $1
    RETURNING *
  `
};

// ==================== UTILITY QUERIES ====================
export const utilityQueries = {
  // Get table info
  getTableInfo: `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `,

  // Get top scorers
  getTopScorers: `
    SELECT 
      p.name as player_name,
      t.name as team_name,
      ps.season,
      ps.goals,
      ps.assists,
      ps.games_played
    FROM player_stats ps
    JOIN players p ON ps.player_id = p.id
    JOIN teams t ON p.team_id = t.id
    WHERE ps.season = $1
    ORDER BY ps.goals DESC, ps.assists DESC
    LIMIT $2
  `,

  // Team statistics
  getTeamStats: `
    SELECT 
      t.name as team_name,
      COUNT(p.id) as total_players,
      AVG(p.age) as average_age,
      SUM(ps.goals) as total_goals,
      SUM(ps.assists) as total_assists
    FROM teams t
    LEFT JOIN players p ON t.id = p.team_id
    LEFT JOIN player_stats ps ON p.id = ps.player_id AND ps.season = $1
    GROUP BY t.id, t.name
    ORDER BY total_goals DESC
  `
};
