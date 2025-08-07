import client from "../../database.js";
import { teamQueries, playerQueries, teamPlayerQueries, statsQueries, utilityQueries } from "./queries.js";

// ==================== TEAMS CONTROLLER ====================
export const teamsController = {
  // CREATE team
  createTeam: async (req, res) => {
    try {
      const { city, name, level, season, sport } = req.body;
      
      if (!city || !name || !level || !season || !sport) {
        return res.status(400).json({ 
          success: false, 
          error: "City, name, level, season, and sport are required" 
        });
      }

      const result = await client.query(teamQueries.createTeam, [
        city, name, level, season, sport
      ]);

      res.status(201).json({
        success: true,
        message: "Team created successfully",
        team: result.rows[0]
      });
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({
        success: false,
        error: error.code === '23505' ? "Team name already exists for this season" : "Failed to create team"
      });
    }
  },

  // READ all teams
  getAllTeams: async (req, res) => {
    try {
      const result = await client.query(teamQueries.getAllTeams);
      
      res.json({
        success: true,
        count: result.rows.length,
        teams: result.rows
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch teams"
      });
    }
  },

  // READ team by ID
  getTeamById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await client.query(teamQueries.getTeamById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Team not found"
        });
      }

      res.json({
        success: true,
        team: result.rows[0]
      });
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch team"
      });
    }
  },

  // READ team with players
  getTeamWithPlayers: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await client.query(teamQueries.getTeamWithPlayers, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Team not found"
        });
      }

      res.json({
        success: true,
        team: result.rows[0]
      });
    } catch (error) {
      console.error("Error fetching team with players:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch team with players"
      });
    }
  },

  // UPDATE team
  updateTeam: async (req, res) => {
    try {
      const { id } = req.params;
      const { city, name, level, season, sport } = req.body;

      if (!city || !name || !level || !season || !sport) {
        return res.status(400).json({ 
          success: false, 
          error: "City, name, level, season, and sport are required" 
        });
      }

      const result = await client.query(teamQueries.updateTeam, [
        id, city, name, level, season, sport
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Team not found"
        });
      }

      res.json({
        success: true,
        message: "Team updated successfully",
        team: result.rows[0]
      });
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update team"
      });
    }
  },

  // DELETE team
  deleteTeam: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await client.query(teamQueries.deleteTeam, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Team not found"
        });
      }

      res.json({
        success: true,
        message: "Team deleted successfully",
        team: result.rows[0]
      });
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete team"
      });
    }
  }
};

// ==================== PLAYERS CONTROLLER ====================
export const playersController = {
  // CREATE player
  createPlayer: async (req, res) => {
    try {
      const { first_name, last_name, date_of_birth } = req.body;
      
      if (!first_name || !last_name || !date_of_birth) {
        return res.status(400).json({ 
          success: false, 
          error: "First name, last name, and date of birth are required" 
        });
      }

      const result = await client.query(playerQueries.createPlayer, [
        first_name, last_name, date_of_birth
      ]);

      res.status(201).json({
        success: true,
        message: "Player created successfully",
        player: result.rows[0]
      });
    } catch (error) {
      console.error("Error creating player:", error);
      res.status(500).json({
        success: false,
        error: error.code === '23505' ? "Player with this name and date of birth already exists" : "Failed to create player"
      });
    }
  },

  // READ all players
  getAllPlayers: async (req, res) => {
    try {
      const result = await client.query(playerQueries.getAllPlayers);
      
      res.json({
        success: true,
        count: result.rows.length,
        players: result.rows
      });
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch players"
      });
    }
  },

  // READ player by ID
  getPlayerById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await client.query(playerQueries.getPlayerById, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Player not found"
        });
      }

      res.json({
        success: true,
        player: result.rows[0]
      });
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch player"
      });
    }
  },

  // READ players by team - deprecated since players no longer have team associations
  getPlayersByTeam: async (req, res) => {
    try {
      // Since players no longer belong to teams, return all players
      const result = await client.query(playerQueries.getAllPlayers);

      res.json({
        success: true,
        count: result.rows.length,
        players: result.rows
      });
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch players"
      });
    }
  },

  // UPDATE player
  updatePlayer: async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, date_of_birth } = req.body;

      if (!first_name || !last_name || !date_of_birth) {
        return res.status(400).json({ 
          success: false, 
          error: "First name, last name, and date of birth are required" 
        });
      }

      const result = await client.query(playerQueries.updatePlayer, [
        id, first_name, last_name, date_of_birth
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Player not found"
        });
      }

      res.json({
        success: true,
        message: "Player updated successfully",
        player: result.rows[0]
      });
    } catch (error) {
      console.error("Error updating player:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update player"
      });
    }
  },

  // DELETE player
  deletePlayer: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await client.query(playerQueries.deletePlayer, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Player not found"
        });
      }

      res.json({
        success: true,
        message: "Player deleted successfully",
        player: result.rows[0]
      });
    } catch (error) {
      console.error("Error deleting player:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete player"
      });
    }
  }
};

// ==================== TEAM-PLAYER CONTROLLER ====================
export const teamPlayerController = {
  // CREATE - assign player to team
  assignPlayerToTeam: async (req, res) => {
    try {
      const { player_id, team_id, jersey_number, position } = req.body;
      
      if (!player_id || !team_id || !jersey_number || !position) {
        return res.status(400).json({ 
          success: false, 
          error: "Player ID, team ID, jersey number, and position are required" 
        });
      }

      // Validate position
      if (!['Forward', 'Defence', 'Goalie'].includes(position)) {
        return res.status(400).json({ 
          success: false, 
          error: "Position must be 'Forward', 'Defence', or 'Goalie'" 
        });
      }

      const result = await client.query(teamPlayerQueries.assignPlayerToTeam, [
        player_id, team_id, jersey_number, position
      ]);

      res.status(201).json({
        success: true,
        message: "Player assigned to team successfully",
        assignment: result.rows[0]
      });
    } catch (error) {
      console.error("Error assigning player to team:", error);
      res.status(500).json({
        success: false,
        error: error.code === '23505' ? 
          (error.constraint?.includes('jersey_number') ? 
            "Jersey number already taken for this team" : 
            "Player already assigned to this team") : 
          "Failed to assign player to team"
      });
    }
  },

  // READ - get players by team
  getPlayersByTeam: async (req, res) => {
    try {
      const { teamId } = req.params;
      const result = await client.query(teamPlayerQueries.getPlayersByTeam, [teamId]);

      res.json({
        success: true,
        count: result.rows.length,
        players: result.rows
      });
    } catch (error) {
      console.error("Error fetching team players:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch team players"
      });
    }
  },

  // READ - get teams by player
  getTeamsByPlayer: async (req, res) => {
    try {
      const { playerId } = req.params;
      const result = await client.query(teamPlayerQueries.getTeamsByPlayer, [playerId]);

      res.json({
        success: true,
        count: result.rows.length,
        teams: result.rows
      });
    } catch (error) {
      console.error("Error fetching player teams:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch player teams"
      });
    }
  },

  // READ - get all team-player assignments
  getAllAssignments: async (req, res) => {
    try {
      const result = await client.query(teamPlayerQueries.getAllTeamPlayerAssignments);

      res.json({
        success: true,
        count: result.rows.length,
        assignments: result.rows
      });
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch assignments"
      });
    }
  },

  // UPDATE - update player team assignment
  updateAssignment: async (req, res) => {
    try {
      const { playerId, teamId } = req.params;
      const { jersey_number, position } = req.body;

      if (!jersey_number || !position) {
        return res.status(400).json({ 
          success: false, 
          error: "Jersey number and position are required" 
        });
      }

      // Validate position
      if (!['Forward', 'Defence', 'Goalie'].includes(position)) {
        return res.status(400).json({ 
          success: false, 
          error: "Position must be 'Forward', 'Defence', or 'Goalie'" 
        });
      }

      const result = await client.query(teamPlayerQueries.updatePlayerTeamAssignment, [
        playerId, teamId, jersey_number, position
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Player assignment not found"
        });
      }

      res.json({
        success: true,
        message: "Assignment updated successfully",
        assignment: result.rows[0]
      });
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({
        success: false,
        error: error.code === '23505' ? "Jersey number already taken for this team" : "Failed to update assignment"
      });
    }
  },

  // DELETE - remove player from team
  removePlayerFromTeam: async (req, res) => {
    try {
      const { playerId, teamId } = req.params;
      const result = await client.query(teamPlayerQueries.removePlayerFromTeam, [playerId, teamId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Player assignment not found"
        });
      }

      res.json({
        success: true,
        message: "Player removed from team successfully",
        assignment: result.rows[0]
      });
    } catch (error) {
      console.error("Error removing player from team:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove player from team"
      });
    }
  }
};

// ==================== STATS CONTROLLER ====================
export const statsController = {
  // CREATE player stats
  createPlayerStats: async (req, res) => {
    try {
      const { player_id, season, games_played, goals, assists, yellow_cards, red_cards, minutes_played } = req.body;
      
      if (!player_id || !season) {
        return res.status(400).json({ 
          success: false, 
          error: "Player ID and season are required" 
        });
      }

      const result = await client.query(statsQueries.createPlayerStats, [
        player_id, season, games_played || 0, goals || 0, assists || 0, 
        yellow_cards || 0, red_cards || 0, minutes_played || 0
      ]);

      res.status(201).json({
        success: true,
        message: "Player stats created successfully",
        stats: result.rows[0]
      });
    } catch (error) {
      console.error("Error creating player stats:", error);
      res.status(500).json({
        success: false,
        error: error.code === '23505' ? "Stats already exist for this player and season" : "Failed to create player stats"
      });
    }
  },

  // READ all stats
  getAllStats: async (req, res) => {
    try {
      const result = await client.query(statsQueries.getAllStats);
      
      res.json({
        success: true,
        count: result.rows.length,
        stats: result.rows
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch stats"
      });
    }
  },

  // READ top scorers
  getTopScorers: async (req, res) => {
    try {
      const { season = '2023-24', limit = 10 } = req.query;
      const result = await client.query(utilityQueries.getTopScorers, [season, limit]);
      
      res.json({
        success: true,
        season: season,
        count: result.rows.length,
        topScorers: result.rows
      });
    } catch (error) {
      console.error("Error fetching top scorers:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch top scorers"
      });
    }
  },

  // UPDATE player stats
  updatePlayerStats: async (req, res) => {
    try {
      const { player_id, season, games_played, goals, assists, yellow_cards, red_cards, minutes_played } = req.body;

      const result = await client.query(statsQueries.updatePlayerStats, [
        player_id, season, games_played, goals, assists, yellow_cards, red_cards, minutes_played
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Player stats not found"
        });
      }

      res.json({
        success: true,
        message: "Player stats updated successfully",
        stats: result.rows[0]
      });
    } catch (error) {
      console.error("Error updating player stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update player stats"
      });
    }
  }
};
