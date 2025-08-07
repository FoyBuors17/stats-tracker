import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/Stats',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== TEAMS API ====================
export const teamsApi = {
  // Get all teams
  getAll: () => api.get('/teams'),
  
  // Get team by ID
  getById: (id) => api.get(`/teams/${id}`),
  
  // Get team with players
  getWithPlayers: (id) => api.get(`/teams/${id}/players`),
  
  // Create new team
  create: (teamData) => api.post('/teams', teamData),
  
  // Update team
  update: (id, teamData) => api.put(`/teams/${id}`, teamData),
  
  // Delete team
  delete: (id) => api.delete(`/teams/${id}`),
};

// ==================== PLAYERS API ====================
export const playersApi = {
  // Get all players
  getAll: () => api.get('/players'),
  
  // Get player by ID
  getById: (id) => api.get(`/players/${id}`),
  
  // Get players by team
  getByTeam: (teamId) => api.get(`/players/team/${teamId}`),
  
  // Get player with their stats
  getWithStats: (id) => api.get(`/players/${id}/stats`),
  
  // Create new player
  create: (playerData) => api.post('/players', playerData),
  
  // Update player
  update: (id, playerData) => api.put(`/players/${id}`, playerData),
  
  // Delete player
  delete: (id) => api.delete(`/players/${id}`),
};

// ==================== TEAM-PLAYER API ====================
export const teamPlayerApi = {
  // Assign player to team
  assignToTeam: (assignmentData) => api.post('/team-player', assignmentData),
  
  // Get all team-player assignments
  getAllAssignments: () => api.get('/team-player'),
  
  // Get players by team
  getPlayersByTeam: (teamId) => api.get(`/team-player/team/${teamId}`),
  
  // Get teams by player
  getTeamsByPlayer: (playerId) => api.get(`/team-player/player/${playerId}`),
  
  // Update player team assignment
  updateAssignment: (playerId, teamId, assignmentData) => 
    api.put(`/team-player/${playerId}/${teamId}`, assignmentData),
  
  // Remove player from team
  removeFromTeam: (playerId, teamId) => 
    api.delete(`/team-player/${playerId}/${teamId}`),
};

// ==================== STATS API ====================
export const statsApi = {
  // Get all stats
  getAll: () => api.get('/stats'),
  
  // Get stats by player ID
  getByPlayer: (playerId) => api.get(`/stats/player/${playerId}`),
  
  // Get top scorers
  getTopScorers: (season = '2023-24', limit = 10) => 
    api.get(`/stats/top-scorers?season=${season}&limit=${limit}`),
  
  // Create player stats
  create: (statsData) => api.post('/stats', statsData),
  
  // Update player stats
  update: (statsData) => api.put('/stats', statsData),
};

// ==================== HEALTH CHECK ====================
export const healthApi = {
  // Check server and database health
  check: () => axios.get('http://localhost:3000/health'),
};

export default api;