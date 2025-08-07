// Database queries for CRUD operations

// ==================== TEAMS QUERIES ====================
export const teamQueries = {
  // CREATE
  createTeam: `
    INSERT INTO team (city, name, level, season, sport)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,

  // READ
  getAllTeams: `
    SELECT * FROM team
    ORDER BY season DESC, name ASC
  `,

  getTeamById: `
    SELECT * FROM team 
    WHERE id = $1
  `,

  getTeamWithPlayers: `
    SELECT 
      t.*,
      json_agg(
        json_build_object(
          'id', tp.id,
          'player_id', tp.player_id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'date_of_birth', p.date_of_birth,
          'jersey_number', tp.jersey_number,
          'position', tp.position
        )
      ) FILTER (WHERE tp.id IS NOT NULL) as players
    FROM team t
    LEFT JOIN team_player tp ON t.id = tp.team_id
    LEFT JOIN player p ON tp.player_id = p.id
    WHERE t.id = $1
    GROUP BY t.id
  `,

  // UPDATE
  updateTeam: `
    UPDATE team 
    SET city = $2, name = $3, level = $4, season = $5, sport = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,

  // DELETE
  deleteTeam: `
    DELETE FROM team 
    WHERE id = $1
    RETURNING *
  `
};

// ==================== PLAYERS QUERIES ====================
export const playerQueries = {
  // CREATE
  createPlayer: `
    INSERT INTO player (first_name, last_name, date_of_birth)
    VALUES ($1, $2, $3)
    RETURNING *
  `,

  // READ
  getAllPlayers: `
    SELECT 
      p.*,
      CONCAT(p.first_name, ' ', p.last_name) as full_name
    FROM player p
    ORDER BY p.last_name ASC, p.first_name ASC
  `,

  getPlayerById: `
    SELECT 
      p.*,
      CONCAT(p.first_name, ' ', p.last_name) as full_name
    FROM player p
    WHERE p.id = $1
  `,

  getPlayersByTeam: `
    SELECT 
      p.*,
      CONCAT(p.first_name, ' ', p.last_name) as full_name
    FROM player p
    ORDER BY p.last_name ASC, p.first_name ASC
  `,

  getPlayerWithStats: `
    SELECT 
      p.*,
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
    FROM player p
    LEFT JOIN player_stat ps ON p.id = ps.player_id
    WHERE p.id = $1
    GROUP BY p.id
  `,

  // UPDATE
  updatePlayer: `
    UPDATE player 
    SET first_name = $2, last_name = $3, date_of_birth = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,

  // DELETE
  deletePlayer: `
    DELETE FROM player 
    WHERE id = $1
    RETURNING *
  `
};

// ==================== TEAM-PLAYER QUERIES ====================
export const teamPlayerQueries = {
  // CREATE
  assignPlayerToTeam: `
    INSERT INTO team_player (player_id, team_id, jersey_number, position)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,

  // READ
  getPlayersByTeam: `
    SELECT 
      tp.*,
      p.first_name,
      p.last_name,
      p.date_of_birth,
      CONCAT(p.first_name, ' ', p.last_name) as full_name
    FROM team_player tp
    JOIN player p ON tp.player_id = p.id
    WHERE tp.team_id = $1
    ORDER BY tp.jersey_number ASC
  `,

  getTeamsByPlayer: `
    SELECT 
      tp.*,
      t.city,
      t.name as team_name,
      t.level,
      t.season,
      t.sport
    FROM team_player tp
    JOIN team t ON tp.team_id = t.id
    WHERE tp.player_id = $1
    ORDER BY t.name ASC
  `,

  getPlayerTeamAssignment: `
    SELECT * FROM team_player 
    WHERE player_id = $1 AND team_id = $2
  `,

  getAllTeamPlayerAssignments: `
    SELECT 
      tp.*,
      p.first_name,
      p.last_name,
      CONCAT(p.first_name, ' ', p.last_name) as player_name,
      t.name as team_name,
      t.city
    FROM team_player tp
    JOIN player p ON tp.player_id = p.id
    JOIN team t ON tp.team_id = t.id
    ORDER BY t.name ASC, tp.jersey_number ASC
  `,

  // UPDATE
  updatePlayerTeamAssignment: `
    UPDATE team_player 
    SET jersey_number = $3, position = $4, updated_at = CURRENT_TIMESTAMP
    WHERE player_id = $1 AND team_id = $2
    RETURNING *
  `,

  // DELETE
  removePlayerFromTeam: `
    DELETE FROM team_player 
    WHERE player_id = $1 AND team_id = $2
    RETURNING *
  `,

  removeAllPlayerAssignments: `
    DELETE FROM team_player 
    WHERE player_id = $1
    RETURNING *
  `,

  removeAllTeamAssignments: `
    DELETE FROM team_player 
    WHERE team_id = $1
    RETURNING *
  `
};

// ==================== PLAYER STATS QUERIES ====================
export const statsQueries = {
  // CREATE
  createPlayerStats: `
    INSERT INTO player_stat (player_id, season, games_played, goals, assists, yellow_cards, red_cards, minutes_played)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,

  // READ
  getAllStats: `
    SELECT 
      ps.*,
      p.name as player_name,
      t.name as team_name
    FROM player_stat ps
    JOIN player p ON ps.player_id = p.id
    JOIN team t ON p.team_id = t.id
    ORDER BY ps.created_at DESC
  `,

  getStatsByPlayer: `
    SELECT * FROM player_stat 
    WHERE player_id = $1
    ORDER BY season DESC
  `,

  getStatsBySeason: `
    SELECT 
      ps.*,
      p.name as player_name,
      t.name as team_name
    FROM player_stat ps
    JOIN player p ON ps.player_id = p.id
    JOIN team t ON p.team_id = t.id
    WHERE ps.season = $1
    ORDER BY ps.goals DESC
  `,

  // UPDATE
  updatePlayerStats: `
    UPDATE player_stat 
    SET games_played = $3, goals = $4, assists = $5, yellow_cards = $6, 
        red_cards = $7, minutes_played = $8, updated_at = CURRENT_TIMESTAMP
    WHERE player_id = $1 AND season = $2
    RETURNING *
  `,

  // DELETE
  deletePlayerStats: `
    DELETE FROM player_stat 
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
    FROM player_stat ps
    JOIN player p ON ps.player_id = p.id
    JOIN team t ON p.team_id = t.id
    WHERE ps.season = $1
    ORDER BY ps.goals DESC, ps.assists DESC
    LIMIT $2
  `,

  // Team statistics
  getTeamStats: `
    SELECT 
      t.name as team_name,
      COUNT(p.id) as total_player,
      AVG(p.age) as average_age,
      SUM(ps.goals) as total_goals,
      SUM(ps.assists) as total_assists
    FROM team t
    LEFT JOIN player p ON t.id = p.team_id
    LEFT JOIN player_stat ps ON p.id = ps.player_id AND ps.season = $1
    GROUP BY t.id, t.name
    ORDER BY total_goals DESC
  `
};
