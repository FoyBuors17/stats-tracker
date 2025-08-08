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
  const [allStartingGoalies, setAllStartingGoalies] = useState({});
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [selectedGameLineup, setSelectedGameLineup] = useState(null);
  const [startingGoalie, setStartingGoalie] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    home_away: "",
    game_type: "",
    opponent: "",
    period_1_length: 20,
    period_2_length: 20,
    period_3_length: 20,
    ot_length: 0,
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
      await loadAllStartingGoalies(gamesData);

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

  const loadAllStartingGoalies = async (gamesData) => {
    try {
      const goaliesMap = {};

      for (const game of gamesData) {
        try {
          const response = await gamePlayerApi.getStartingGoalie(game.id);
          goaliesMap[game.id] = response.data.startingGoalie || null;
          console.log(
            `Game ${game.id} starting goalie:`,
            response.data.startingGoalie
          );
        } catch (err) {
          console.error(
            `Error loading starting goalie for game ${game.id}:`,
            err
          );
          goaliesMap[game.id] = null;
        }
      }

      console.log("All starting goalies loaded:", goaliesMap);
      setAllStartingGoalies(goaliesMap);
    } catch (err) {
      console.error("Error loading all starting goalies:", err);
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
      period_1_length: game.period_1_length || 20,
      period_2_length: game.period_2_length || 20,
      period_3_length: game.period_3_length || 20,
      ot_length: game.ot_length || 0,
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

  const handleAddPlayers = async (game) => {
    setSelectedGameForPlayers(game);
    await loadGamePlayers(game.id);

    // Load current starting goalie for this game
    try {
      const response = await gamePlayerApi.getStartingGoalie(game.id);
      const currentStartingGoalie = response.data.startingGoalie;
      setStartingGoalie(
        currentStartingGoalie ? currentStartingGoalie.player_id : null
      );
    } catch (err) {
      console.error("Error loading current starting goalie:", err);
      setStartingGoalie(null);
    }

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
      await loadAllStartingGoalies(games);
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
      period_1_length: 20,
      period_2_length: 20,
      period_3_length: 20,
      ot_length: 0,
    });
    setEditingGame(null);
    setShowForm(false);
  };

  const handleSaveLineup = async () => {
    try {
      console.log("=== SAVING LINEUP ===");
      console.log("Selected game:", selectedGameForPlayers.id);
      console.log("Starting goalie to save:", startingGoalie);

      // Always clear existing starting goalie first
      console.log("Clearing existing starting goalie...");
      const clearResult = await gamePlayerApi.clearStartingGoalie(
        selectedGameForPlayers.id
      );
      console.log("Clear result:", clearResult);

      // If a starting goalie is selected, set them as starting goalie via API
      if (startingGoalie) {
        console.log("Setting new starting goalie:", startingGoalie);
        const setResult = await gamePlayerApi.setStartingGoalie(
          selectedGameForPlayers.id,
          startingGoalie
        );
        console.log("Set result:", setResult);
      } else {
        console.log("No starting goalie selected, skipping set operation");
      }

      // Reload data to get updated lineup info
      console.log("Reloading data...");
      await loadAllGamePlayers(games);
      await loadAllStartingGoalies(games);
      console.log("=== SAVE COMPLETE ===");

      // Close modal
      closePlayerModal();
    } catch (err) {
      console.error("Error saving lineup:", err);
      setError("Failed to save lineup");
    }
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedGameForPlayers(null);
    setGamePlayers([]);
    setStartingGoalie(null);
  };

  const handleLineupClick = (game) => {
    setSelectedGameLineup(game);
    setShowLineupModal(true);
  };

  const closeLineupModal = () => {
    setShowLineupModal(false);
    setSelectedGameLineup(null);
  };

  const getLineupDetails = (gameId) => {
    const gamePlayersForGame = allGamePlayers[gameId] || [];

    const forwards = gamePlayersForGame.filter(
      (gp) => gp.position === "Forward"
    );
    const defence = gamePlayersForGame.filter(
      (gp) => gp.position === "Defence"
    );
    const goalies = gamePlayersForGame.filter((gp) => gp.position === "Goalie");

    return { forwards, defence, goalies, total: gamePlayersForGame.length };
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

  const formatModalOpponentDisplay = (opponent, homeAway) => {
    switch (homeAway) {
      case "Home":
        return `vs ${opponent}`;
      case "Away":
        return `@ ${opponent}`;
      case "Tournament":
        return `T ${opponent}`;
      default:
        return opponent;
    }
  };

  const handleStartingGoalieToggle = (playerId) => {
    console.log("=== STARTING GOALIE TOGGLE ===");
    console.log("Player ID:", playerId);
    console.log("Current starting goalie:", startingGoalie);
    const newStartingGoalie = startingGoalie === playerId ? null : playerId;
    console.log("New starting goalie:", newStartingGoalie);
    setStartingGoalie(newStartingGoalie);
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

  const getLineupButtonText = (gameId) => {
    const gamePlayersForGame = allGamePlayers[gameId] || [];
    return gamePlayersForGame.length === 0
      ? "Enter Lineup"
      : getPositionCounts(gameId);
  };

  const handleLineupButtonClick = (game) => {
    // Always open player assignment modal for easier lineup management
    handleAddPlayers(game);
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

          <div className="form-section">
            <h4>⏱️ Period Lengths (in minutes)</h4>
            <div className="form-row">
              <div className="form-group">
                <label>1st Period</label>
                <input
                  type="number"
                  name="period_1_length"
                  value={formData.period_1_length}
                  onChange={handleInputChange}
                  min="0"
                  max="60"
                  placeholder="20"
                />
              </div>

              <div className="form-group">
                <label>2nd Period</label>
                <input
                  type="number"
                  name="period_2_length"
                  value={formData.period_2_length}
                  onChange={handleInputChange}
                  min="0"
                  max="60"
                  placeholder="20"
                />
              </div>

              <div className="form-group">
                <label>3rd Period</label>
                <input
                  type="number"
                  name="period_3_length"
                  value={formData.period_3_length}
                  onChange={handleInputChange}
                  min="0"
                  max="60"
                  placeholder="20"
                />
              </div>

              <div className="form-group">
                <label>Overtime</label>
                <input
                  type="number"
                  name="ot_length"
                  value={formData.ot_length}
                  onChange={handleInputChange}
                  min="0"
                  max="30"
                  placeholder="0"
                />
              </div>
            </div>
            <small className="form-help">
              Enter the actual length of each period in minutes. Leave Overtime
              as 0 if the game didn't go to OT.
            </small>
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
              <th>Game Time</th>
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
                  <td className="game-time" title="Total game time in minutes">
                    <span className="time-total">
                      {(game.period_1_length || 0) +
                        (game.period_2_length || 0) +
                        (game.period_3_length || 0) +
                        (game.ot_length || 0)}{" "}
                      min
                    </span>
                  </td>
                  <td className="position-counts">
                    <button
                      className="lineup-summary-btn"
                      onClick={() => handleLineupButtonClick(game)}
                      title="Click to manage lineup for this game"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        lineHeight: "1.2",
                      }}
                    >
                      <div>{getLineupButtonText(game.id)}</div>
                      {allStartingGoalies[game.id] && (
                        <div
                          style={{
                            fontSize: "0.75em",
                            color: "#666",
                            marginTop: "2px",
                          }}
                        >
                          {allStartingGoalies[game.id].first_name}{" "}
                          {allStartingGoalies[game.id].last_name}
                        </div>
                      )}
                    </button>
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
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              width: "100vw",
              maxWidth: "100vw",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
              margin: "0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: "20px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "1.5rem",
                    color: "#333",
                  }}
                >
                  🏒 Manage Lineup -{" "}
                  {formatModalOpponentDisplay(
                    selectedGameForPlayers.opponent,
                    selectedGameForPlayers.home_away
                  )}
                </h3>
                <div
                  className="game-info"
                  style={{ color: "#666", fontSize: "0.9rem" }}
                >
                  <span>
                    {new Date(selectedGameForPlayers.date).toLocaleDateString()}
                  </span>
                  <span className="separator" style={{ margin: "0 8px" }}>
                    •
                  </span>
                  <span>{selectedGameForPlayers.game_type}</span>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={closePlayerModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
            <div
              className="modal-content"
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                padding: "0",
              }}
            >
              <div
                className="lineup-management"
                style={{
                  flex: 1,
                  overflow: "auto",
                  padding: "0 20px",
                }}
              >
                <div
                  className="current-lineup-summary"
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "10px 15px",
                    borderRadius: "4px",
                    marginBottom: "12px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <h4
                    style={{
                      margin: "0",
                      color: "#495057",
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    📊 Current Lineup:{" "}
                    {getPositionCounts(selectedGameForPlayers.id)}
                  </h4>
                </div>

                <div className="player-selection">
                  <h5
                    style={{
                      marginBottom: "10px",
                      color: "#343a40",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                    }}
                  >
                    👥 Select Players for This Game:
                  </h5>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "15px",
                      height: "380px",
                    }}
                  >
                    {/* Forwards Column */}
                    <div
                      style={{
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        backgroundColor: "#fafafa",
                        padding: "10px",
                      }}
                    >
                      <h6
                        style={{
                          margin: "0 0 10px 0",
                          color: "#495057",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          textAlign: "center",
                          borderBottom: "2px solid #007bff",
                          paddingBottom: "5px",
                        }}
                      >
                        🏒 Forwards
                      </h6>
                      <div
                        style={{
                          maxHeight: "320px",
                          overflowY: "auto",
                          paddingRight: "3px",
                        }}
                      >
                        {teamPlayers
                          .filter((player) => player.position === "Forward")
                          .sort(
                            (a, b) =>
                              (a.jersey_number || 0) - (b.jersey_number || 0)
                          )
                          .map((player) => {
                            const isSelected = gamePlayers.some(
                              (gp) => gp.player_id === player.player_id
                            );
                            return (
                              <div
                                key={player.player_id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "8px",
                                  marginBottom: "5px",
                                  backgroundColor: isSelected
                                    ? "#d4edda"
                                    : "white",
                                  border: isSelected
                                    ? "1px solid #28a745"
                                    : "1px solid #e9ecef",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handlePlayerToggle(
                                    player.player_id,
                                    isSelected
                                  )
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    handlePlayerToggle(
                                      player.player_id,
                                      isSelected
                                    )
                                  }
                                  style={{ marginRight: "10px" }}
                                />
                                <span
                                  style={{
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  #{player.jersey_number} {player.first_name}{" "}
                                  {player.last_name}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Defence Column */}
                    <div
                      style={{
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        backgroundColor: "#fafafa",
                        padding: "10px",
                      }}
                    >
                      <h6
                        style={{
                          margin: "0 0 10px 0",
                          color: "#495057",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          textAlign: "center",
                          borderBottom: "2px solid #28a745",
                          paddingBottom: "5px",
                        }}
                      >
                        🛡️ Defence
                      </h6>
                      <div
                        style={{
                          maxHeight: "320px",
                          overflowY: "auto",
                          paddingRight: "3px",
                        }}
                      >
                        {teamPlayers
                          .filter((player) => player.position === "Defence")
                          .sort(
                            (a, b) =>
                              (a.jersey_number || 0) - (b.jersey_number || 0)
                          )
                          .map((player) => {
                            const isSelected = gamePlayers.some(
                              (gp) => gp.player_id === player.player_id
                            );
                            return (
                              <div
                                key={player.player_id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "8px",
                                  marginBottom: "5px",
                                  backgroundColor: isSelected
                                    ? "#d4edda"
                                    : "white",
                                  border: isSelected
                                    ? "1px solid #28a745"
                                    : "1px solid #e9ecef",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handlePlayerToggle(
                                    player.player_id,
                                    isSelected
                                  )
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    handlePlayerToggle(
                                      player.player_id,
                                      isSelected
                                    )
                                  }
                                  style={{ marginRight: "10px" }}
                                />
                                <span
                                  style={{
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  #{player.jersey_number} {player.first_name}{" "}
                                  {player.last_name}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Goalies Column */}
                    <div
                      style={{
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        backgroundColor: "#fafafa",
                        padding: "10px",
                      }}
                    >
                      <h6
                        style={{
                          margin: "0 0 10px 0",
                          color: "#495057",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          textAlign: "center",
                          borderBottom: "2px solid #dc3545",
                          paddingBottom: "5px",
                        }}
                      >
                        🥅 Goalies
                      </h6>
                      <div
                        style={{
                          maxHeight: "320px",
                          overflowY: "auto",
                          paddingRight: "3px",
                        }}
                      >
                        {teamPlayers
                          .filter((player) => player.position === "Goalie")
                          .sort(
                            (a, b) =>
                              (a.jersey_number || 0) - (b.jersey_number || 0)
                          )
                          .map((player) => {
                            const isSelected = gamePlayers.some(
                              (gp) => gp.player_id === player.player_id
                            );
                            const isStarting =
                              startingGoalie === player.player_id;

                            return (
                              <div
                                key={player.player_id}
                                style={{
                                  padding: "6px",
                                  marginBottom: "6px",
                                  backgroundColor: isSelected
                                    ? "#d4edda"
                                    : "white",
                                  border: isSelected
                                    ? "1px solid #28a745"
                                    : "1px solid #e9ecef",
                                  borderRadius: "3px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    marginBottom: "3px",
                                  }}
                                  onClick={() =>
                                    handlePlayerToggle(
                                      player.player_id,
                                      isSelected
                                    )
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      handlePlayerToggle(
                                        player.player_id,
                                        isSelected
                                      )
                                    }
                                    style={{ marginRight: "10px" }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "0.9rem",
                                      fontWeight: "500",
                                    }}
                                  >
                                    #{player.jersey_number} {player.first_name}{" "}
                                    {player.last_name}
                                  </span>
                                </div>
                                {isSelected && player.position === "Goalie" && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginLeft: "25px",
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartingGoalieToggle(
                                        player.player_id
                                      );
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isStarting}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleStartingGoalieToggle(
                                          player.player_id
                                        );
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      style={{ marginRight: "8px" }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "0.75rem",
                                        color: "#dc3545",
                                        fontWeight: "600",
                                      }}
                                    >
                                      ⭐ Starting Goalie
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="modal-footer"
              style={{
                padding: "20px",
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8f9fa",
              }}
            >
              <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>
                Selected: {gamePlayers.length} players
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={closePlayerModal}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #6c757d",
                    backgroundColor: "white",
                    color: "#6c757d",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveLineup}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    backgroundColor: "#007bff",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  💾 Save Lineup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lineup Details Modal */}
      {showLineupModal && selectedGameLineup && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                Dressed Players -{" "}
                {formatOpponentDisplay(
                  selectedGameLineup.opponent,
                  selectedGameLineup.home_away
                )}
              </h3>
              <div className="game-info">
                <span>
                  {new Date(selectedGameLineup.date).toLocaleDateString()}
                </span>
                <span className="separator">•</span>
                <span>{selectedGameLineup.game_type}</span>
              </div>
              <button className="modal-close" onClick={closeLineupModal}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="lineup-details">
                {(() => {
                  const lineup = getLineupDetails(selectedGameLineup.id);
                  return (
                    <>
                      {lineup.total === 0 ? (
                        <div className="no-players">
                          <p>No players assigned to this game yet.</p>
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              closeLineupModal();
                              handleAddPlayers(selectedGameLineup);
                            }}
                          >
                            Assign Players
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Forwards */}
                          {lineup.forwards.length > 0 && (
                            <div className="position-section">
                              <h4 className="position-title">
                                🏒 Forwards ({lineup.forwards.length})
                              </h4>
                              <div className="players-grid">
                                {lineup.forwards
                                  .sort(
                                    (a, b) =>
                                      (a.jersey_number || 0) -
                                      (b.jersey_number || 0)
                                  )
                                  .map((player) => (
                                    <div
                                      key={player.player_id}
                                      className="player-card"
                                    >
                                      <span className="jersey">
                                        #{player.jersey_number || "?"}
                                      </span>
                                      <span className="name">
                                        {player.first_name} {player.last_name}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Defence */}
                          {lineup.defence.length > 0 && (
                            <div className="position-section">
                              <h4 className="position-title">
                                🛡️ Defence ({lineup.defence.length})
                              </h4>
                              <div className="players-grid">
                                {lineup.defence
                                  .sort(
                                    (a, b) =>
                                      (a.jersey_number || 0) -
                                      (b.jersey_number || 0)
                                  )
                                  .map((player) => (
                                    <div
                                      key={player.player_id}
                                      className="player-card"
                                    >
                                      <span className="jersey">
                                        #{player.jersey_number || "?"}
                                      </span>
                                      <span className="name">
                                        {player.first_name} {player.last_name}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Goalies */}
                          {lineup.goalies.length > 0 && (
                            <div className="position-section">
                              <h4 className="position-title">
                                🥅 Goalies ({lineup.goalies.length})
                              </h4>
                              <div className="players-grid">
                                {lineup.goalies
                                  .sort(
                                    (a, b) =>
                                      (a.jersey_number || 0) -
                                      (b.jersey_number || 0)
                                  )
                                  .map((player) => (
                                    <div
                                      key={player.player_id}
                                      className="player-card"
                                    >
                                      <span className="jersey">
                                        #{player.jersey_number || "?"}
                                      </span>
                                      <span className="name">
                                        {player.first_name} {player.last_name}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          <div className="lineup-summary">
                            <p>
                              <strong>Total Players Dressed:</strong>{" "}
                              {lineup.total}
                            </p>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  closeLineupModal();
                  handleAddPlayers(selectedGameLineup);
                }}
              >
                Edit Lineup
              </button>
              <button className="btn btn-primary" onClick={closeLineupModal}>
                Close
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
