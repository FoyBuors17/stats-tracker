import { useState, useEffect } from "react";
import { playersApi, teamsApi } from "../services/api";

const PlayersComponent = ({ teamId = null, teamName = null }) => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    team_id: "",
    jersey_number: "",
    position: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      if (teamId) {
        // Load players for specific team
        const [playersResponse, teamsResponse] = await Promise.all([
          playersApi.getByTeam(teamId),
          teamsApi.getAll(),
        ]);
        setPlayers(playersResponse.data.players || []);
        setTeams(teamsResponse.data.teams || []);
      } else {
        // Load all players and teams
        const [playersResponse, teamsResponse] = await Promise.all([
          playersApi.getAll(),
          teamsApi.getAll(),
        ]);
        setPlayers(playersResponse.data.players || []);
        setTeams(teamsResponse.data.teams || []);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
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
      const playerData = {
        ...formData,
        team_id: teamId ? teamId : parseInt(formData.team_id),
        jersey_number: parseInt(formData.jersey_number),
      };

      if (editingPlayer) {
        await playersApi.update(editingPlayer.id, playerData);
      } else {
        await playersApi.create(playerData);
      }
      await loadData();
      resetForm();
    } catch (err) {
      setError(
        editingPlayer ? "Failed to update player" : "Failed to create player"
      );
      console.error("Error submitting form:", err);
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      first_name: player.first_name || "",
      last_name: player.last_name || "",
      team_id: player.team_id || "",
      jersey_number: player.jersey_number || "",
      position: player.position || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        await playersApi.delete(id);
        await loadData();
      } catch (err) {
        setError("Failed to delete player");
        console.error("Error deleting player:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      team_id: "",
      jersey_number: "",
      position: "",
    });
    setEditingPlayer(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    return amount ? `$${Number(amount).toLocaleString()}` : "-";
  };

  if (loading) return <div className="loading">Loading players...</div>;

  return (
    <div className="players-container">
      <div className="section-header">
        <h2>👤 {teamName ? `${teamName} Players` : "Players Management"}</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Player"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="player-form" onSubmit={handleSubmit}>
          <h3>{editingPlayer ? "Edit Player" : "Add New Player"}</h3>

          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                placeholder="Enter first name"
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="form-row">
            {!teamId && (
              <div className="form-group">
                <label>Team *</label>
                <select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {teamId && (
              <div className="form-group">
                <label>Team</label>
                <input
                  type="text"
                  value={teamName}
                  disabled
                  className="disabled-input"
                />
              </div>
            )}

            <div className="form-group">
              <label>Jersey Number *</label>
              <input
                type="number"
                name="jersey_number"
                value={formData.jersey_number}
                onChange={handleInputChange}
                required
                placeholder="e.g. 10"
                min="1"
                max="99"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Position *</label>
            <select
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
            >
              <option value="">Select position</option>
              <option value="goalie">Goalie</option>
              <option value="defence">Defence</option>
              <option value="forward">Forward</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingPlayer ? "Update Player" : "Create Player"}
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

      <div className="players-table">
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              {!teamId && <th>Team</th>}
              <th>Jersey #</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={teamId ? "5" : "6"} className="no-data">
                  {teamName
                    ? `No players found for ${teamName}. Add your first player!`
                    : "No players found. Add your first player!"}
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr key={player.id}>
                  <td className="player-name">{player.first_name}</td>
                  <td className="player-name">{player.last_name}</td>
                  {!teamId && <td>{player.team_name || "-"}</td>}
                  <td className="jersey-number">{player.jersey_number}</td>
                  <td className="position">
                    <span className={`position-badge ${player.position}`}>
                      {player.position
                        ? player.position.charAt(0).toUpperCase() +
                          player.position.slice(1)
                        : "-"}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(player)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(player.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="players-stats">
        <p>Total Players: {players.length}</p>
      </div>
    </div>
  );
};

export default PlayersComponent;
