import { useState, useEffect } from "react";
import {
  gameApi,
  gameTypeApi,
  opponentApi,
  teamPlayerApi,
  gamePlayerApi,
} from "../services/api";

const GamesComponent = ({ teamId, teamName }) => {
  const [games, setGames] = useState([]);
  const [gameTypes, setGameTypes] = useState([]);
  const [opponents, setOpponents] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [selectedGameForPlayers, setSelectedGameForPlayers] = useState(null);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [allGamePlayers, setAllGamePlayers] = useState({});
  const [formData, setFormData] = useState({
    date: "",
    home_away: "",
    game_type: "",
    opponent: "",
  });

  // Stats calculations
  const totalGoalsFor = games.reduce(
    (sum, game) => sum + (game.goals_for || 0),
    0
  );
  const totalGoalsAgainst = games.reduce(
    (sum, game) => sum + (game.goals_against || 0),
    0
  );
  const ppGoals = 0; // Placeholder
  const ppPercentage = 0; // Placeholder
  const ppGoalsAgainst = 0; // Placeholder
  const pkPercentage = 0; // Placeholder

  useEffect(() => {
    if (teamId) {
      loadData();
    }
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        gamesResponse,
        gameTypesResponse,
        opponentsResponse,
        teamPlayersResponse,
      ] = await Promise.all([
        gameApi.getByTeam(teamId),
        gameTypeApi.getAll(),
        opponentApi.getAll(),
        teamPlayerApi.getPlayersByTeam(teamId),
      ]);

      const gamesData = gamesResponse.data.games || [];
      setGames(gamesData);
      setGameTypes(gameTypesResponse.data.gameTypes || []);
      setOpponents(opponentsResponse.data.opponents || []);
      setTeamPlayers(teamPlayersResponse.data.players || []);

      // Load players for each game
      await loadAllGamePlayers(gamesData);

      setError(null);
    } catch (err) {
      setError("Failed to load games data");
      console.error("Error loading games data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllGamePlayers = async (gamesData) => {
    try {
      const gamePlayersMap = {};

      for (const game of gamesData) {
        try {
          const response = await gamePlayerApi.getPlayersByGame(game.id);
          gamePlayersMap[game.id] = response.data.players || [];
        } catch (err) {
          console.error(`Error loading players for game ${game.id}:`, err);
          gamePlayersMap[game.id] = [];
        }
      }

      setAllGamePlayers(gamePlayersMap);
    } catch (err) {
      console.error("Error loading all game players:", err);
    }
  };

  const loadGamePlayers = async (gameId) => {
    try {
      const response = await gamePlayerApi.getPlayersByGame(gameId);
      setGamePlayers(response.data.players || []);
    } catch (err) {
      console.error("Error loading game players:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const gameData = {
        ...formData,
        team_id: teamId,
        goals_for: 0,
        goals_against: 0,
      };

      if (editingGame) {
        await gameApi.update(editingGame.id, gameData);
      } else {
        await gameApi.create(gameData);
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(editingGame ? "Failed to update game" : "Failed to create game");
      console.error("Error submitting form:", err);
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);

    // Format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setFormData({
      date: formatDateForInput(game.date),
      home_away: game.home_away,
      game_type: game.game_type,
      opponent: game.opponent,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await gameApi.delete(id);
        await loadData();
      } catch (err) {
        setError("Failed to delete game");
        console.error("Error deleting game:", err);
      }
    }
  };

  const handleAddPlayers = (game) => {
    setSelectedGameForPlayers(game);
    loadGamePlayers(game.id);
    setShowPlayerModal(true);
  };

  const handlePlayerToggle = async (playerId, isSelected) => {
    try {
      if (isSelected) {
        // Remove player from game
        await gamePlayerApi.removeFromGame(selectedGameForPlayers.id, playerId);
      } else {
        // Add player to game
        await gamePlayerApi.assignToGame({
          game_id: selectedGameForPlayers.id,
          player_id: playerId,
        });
      }
      await loadGamePlayers(selectedGameForPlayers.id);
      // Update the all game players data
      await loadAllGamePlayers(games);
    } catch (err) {
      console.error("Error toggling player:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      date: "",
      home_away: "",
      game_type: "",
      opponent: "",
    });
    setEditingGame(null);
    setShowForm(false);
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedGameForPlayers(null);
    setGamePlayers([]);
  };

  const addNewGameType = async () => {
    const name = prompt("Enter new game type:");
    if (name && name.trim()) {
      try {
        await gameTypeApi.create({ name: name.trim() });
        const response = await gameTypeApi.getAll();
        setGameTypes(response.data.gameTypes || []);
      } catch (err) {
        alert("Failed to add game type");
      }
    }
  };

  const addNewOpponent = async () => {
    const name = prompt("Enter new opponent team name:");
    if (name && name.trim()) {
      try {
        await opponentApi.create({ name: name.trim() });
        const response = await opponentApi.getAll();
        setOpponents(response.data.opponents || []);
        // Auto-select the newly created opponent
        setFormData((prev) => ({ ...prev, opponent: name.trim() }));
      } catch (err) {
        if (err.response?.data?.error?.includes("already exists")) {
          alert("This opponent already exists in the list");
        } else {
          alert("Failed to add opponent");
        }
      }
    }
  };

  const formatOpponentDisplay = (opponent, homeAway) => {
    switch (homeAway) {
      case "Home":
        return opponent;
      case "Away":
        return `@${opponent}`;
      case "Tournament":
        return `T ${opponent}`;
      default:
        return opponent;
    }
  };

  const getGameResult = (goalsFor, goalsAgainst) => {
    if (goalsFor > goalsAgainst) {
      return "Win";
    } else if (goalsFor < goalsAgainst) {
      return "Loss";
    } else {
      return "Tie";
    }
  };

  const getPositionCounts = (gameId) => {
    const gamePlayersForGame = allGamePlayers[gameId] || [];

    const forwards = gamePlayersForGame.filter(
      (gp) => gp.position === "Forward"
    ).length;
    const defence = gamePlayersForGame.filter(
      (gp) => gp.position === "Defence"
    ).length;
    const goalies = gamePlayersForGame.filter(
      (gp) => gp.position === "Goalie"
    ).length;

    return `${forwards}F, ${defence}D, ${goalies}G`;
  };

  if (loading) return <div className="loading">Loading games...</div>;

  return (
    <div className="games-container">
      <div className="section-header">
        <h2>🏆 {teamName} Games</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Game"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalGoalsFor}</div>
            <div className="stat-label">Total Goals For</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{totalGoalsAgainst}</div>
            <div className="stat-label">Total Goals Against</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{ppGoals}</div>
            <div className="stat-label">PP Goals</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{ppPercentage}%</div>
            <div className="stat-label">PP%</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{ppGoalsAgainst}</div>
            <div className="stat-label">PP Goals Against</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{pkPercentage}%</div>
            <div className="stat-label">PK%</div>
          </div>
        </div>
      </div>

      {/* Game Form */}
      {showForm && (
        <form className="game-form" onSubmit={handleSubmit}>
          <h3>{editingGame ? "Edit Game" : "Add New Game"}</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Home/Away *</label>
              <select
                name="home_away"
                value={formData.home_away}
                onChange={handleInputChange}
                required
              >
                <option value="">Select location</option>
                <option value="Home">Home</option>
                <option value="Away">Away</option>
                <option value="Tournament">Tournament</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Game Type *</label>
              <div className="form-group-with-button">
                <select
                  name="game_type"
                  value={formData.game_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select game type</option>
                  {gameTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addNewGameType}
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Opponent Team *</label>
              <div className="form-group-with-button">
                <select
                  name="opponent"
                  value={formData.opponent}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select opponent team</option>
                  {opponents.map((opponent) => (
                    <option key={opponent.id} value={opponent.name}>
                      {opponent.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addNewOpponent}
                  title="Add new opponent team"
                >
                  + Add New Team
                </button>
              </div>
              <small className="form-help">
                If this is your first game against this opponent, click "+ Add
                New Team"
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingGame ? "Update Game" : "Create Game"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Games Table */}
      <div className="games-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Game Type</th>
              <th>Opponent</th>
              <th>Score</th>
              <th>Result</th>
              <th>Players</th>
              <th>Lineup</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No games found for {teamName}. Add your first game!
                </td>
              </tr>
            ) : (
              games.map((game) => (
                <tr key={game.id}>
                  <td>{new Date(game.date).toLocaleDateString()}</td>
                  <td>{game.game_type}</td>
                  <td>
                    {formatOpponentDisplay(game.opponent, game.home_away)}
                  </td>
                  <td className="score">
                    <span className="goals-for">{game.goals_for}</span>
                    {" - "}
                    <span className="goals-against">{game.goals_against}</span>
                  </td>
                  <td className="result">
                    <span
                      className={`result-badge ${getGameResult(
                        game.goals_for,
                        game.goals_against
                      ).toLowerCase()}`}
                    >
                      {getGameResult(game.goals_for, game.goals_against)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-players"
                      onClick={() => handleAddPlayers(game)}
                    >
                      👤 Players
                    </button>
                  </td>
                  <td className="position-counts">
                    <span
                      className="lineup-summary"
                      title="Your team's lineup: Forwards, Defence, Goalies"
                    >
                      {getPositionCounts(game.id)}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(game)}
                      title="Edit game"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(game.id)}
                      title="Delete game"
                    >
                      🗑️
                    </button>
                    <button className="btn btn-goal" title="Add Goal">
                      ⚽
                    </button>
                    <button className="btn btn-pim" title="Add PIMs">
                      🟨
                    </button>
                    <button className="btn btn-hit" title="Add Hits">
                      💥
                    </button>
                    <button className="btn btn-block" title="Add Blocks">
                      🛡️
                    </button>
                    <button className="btn btn-shot" title="Add Shots">
                      🥅
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Player Selection Modal */}
      {showPlayerModal && selectedGameForPlayers && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                Select Players for Game vs {selectedGameForPlayers.opponent}
              </h3>
              <button className="modal-close" onClick={closePlayerModal}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="player-selection">
                {teamPlayers.map((player) => {
                  const isSelected = gamePlayers.some(
                    (gp) => gp.player_id === player.player_id
                  );
                  return (
                    <div key={player.player_id} className="player-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handlePlayerToggle(player.player_id, isSelected)
                          }
                        />
                        <span className="jersey-number">
                          #{player.jersey_number}
                        </span>
                        <span className="player-name">
                          {player.first_name} {player.last_name}
                        </span>
                        <span className="position">{player.position}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closePlayerModal}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="games-stats">
        <p>Total Games: {games.length}</p>
      </div>
    </div>
  );
};

export default GamesComponent;
