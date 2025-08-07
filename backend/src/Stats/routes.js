import { Router } from "express";
import { teamsController, playersController, teamPlayerController, statsController } from "./controller.js";

const router = Router();

// Main stats route
router.get("/", (req, res) => {
    res.json({ 
        message: "Stats API routes working!",
        version: "1.0.0",
        endpoints: {
            teams: "/teams",
            players: "/players",
            teamPlayer: "/team-player", 
            stats: "/stats"
        }
    });
});

// ==================== TEAMS ROUTES ====================
// GET /api/v1/Stats/teams - Get all teams
router.get("/teams", teamsController.getAllTeams);

// POST /api/v1/Stats/teams - Create new team
router.post("/teams", teamsController.createTeam);

// GET /api/v1/Stats/teams/:id - Get team by ID
router.get("/teams/:id", teamsController.getTeamById);

// GET /api/v1/Stats/teams/:id/players - Get team with players
router.get("/teams/:id/players", teamsController.getTeamWithPlayers);

// PUT /api/v1/Stats/teams/:id - Update team
router.put("/teams/:id", teamsController.updateTeam);

// DELETE /api/v1/Stats/teams/:id - Delete team
router.delete("/teams/:id", teamsController.deleteTeam);

// ==================== PLAYERS ROUTES ====================
// GET /api/v1/Stats/players - Get all players
router.get("/players", playersController.getAllPlayers);

// POST /api/v1/Stats/players - Create new player
router.post("/players", playersController.createPlayer);

// GET /api/v1/Stats/players/:id - Get player by ID
router.get("/players/:id", playersController.getPlayerById);

// GET /api/v1/Stats/players/team/:teamId - Get players by team
router.get("/players/team/:teamId", playersController.getPlayersByTeam);

// PUT /api/v1/Stats/players/:id - Update player
router.put("/players/:id", playersController.updatePlayer);

// DELETE /api/v1/Stats/players/:id - Delete player
router.delete("/players/:id", playersController.deletePlayer);

// ==================== TEAM-PLAYER ROUTES ====================
// POST /api/v1/Stats/team-player - Assign player to team
router.post("/team-player", teamPlayerController.assignPlayerToTeam);

// GET /api/v1/Stats/team-player - Get all team-player assignments
router.get("/team-player", teamPlayerController.getAllAssignments);

// GET /api/v1/Stats/team-player/team/:teamId - Get players by team
router.get("/team-player/team/:teamId", teamPlayerController.getPlayersByTeam);

// GET /api/v1/Stats/team-player/player/:playerId - Get teams by player
router.get("/team-player/player/:playerId", teamPlayerController.getTeamsByPlayer);

// PUT /api/v1/Stats/team-player/:playerId/:teamId - Update player team assignment
router.put("/team-player/:playerId/:teamId", teamPlayerController.updateAssignment);

// DELETE /api/v1/Stats/team-player/:playerId/:teamId - Remove player from team
router.delete("/team-player/:playerId/:teamId", teamPlayerController.removePlayerFromTeam);

// ==================== STATS ROUTES ====================
// GET /api/v1/Stats/stats - Get all player stats
router.get("/stats", statsController.getAllStats);

// POST /api/v1/Stats/stats - Create new player stats
router.post("/stats", statsController.createPlayerStats);

// GET /api/v1/Stats/stats/top-scorers - Get top scorers
router.get("/stats/top-scorers", statsController.getTopScorers);

// PUT /api/v1/Stats/stats - Update player stats
router.put("/stats", statsController.updatePlayerStats);

export default router;