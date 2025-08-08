import { useState, useEffect } from "react";
import { teamPlayerApi, playersApi } from "../services/api";

const TeamPlayersComponent = ({ teamId, teamName, onPlayerSelect }) => {
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    player_id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    jersey_number: "",
    position: "",
    is_new_player: false,
  });

  useEffect(() => {
    if (teamId) {
      loadTeamPlayers();
      loadAllPlayers();
    }
  }, [teamId]);

  const loadTeamPlayers = async () => {
    try {
      setLoading(true);
      const response = await teamPlayerApi.getPlayersByTeam(teamId);
      setTeamPlayers(response.data.players || []);
      setError(null);
    } catch (err) {
      setError("Failed to load team players");
      console.error("Error loading team players:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllPlayers = async () => {
    try {
      const response = await playersApi.getAll();
      setAllPlayers(response.data.players || []);
    } catch (err) {
      console.error("Error loading all players:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let playerId = formData.player_id;

      // If adding a new player, create them first
      if (formData.is_new_player || !playerId) {
        const playerData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
        };
        const playerResponse = await playersApi.create(playerData);
        playerId = playerResponse.data.player.id;
      }

      // Create team-player assignment
      const assignmentData = {
        player_id: playerId,
        team_id: teamId,
        jersey_number: parseInt(formData.jersey_number),
        position: formData.position,
      };

      if (editingAssignment) {
        await teamPlayerApi.updateAssignment(playerId, teamId, {
          jersey_number: parseInt(formData.jersey_number),
          position: formData.position,
        });
      } else {
        await teamPlayerApi.assignToTeam(assignmentData);
      }

      await loadTeamPlayers();
      await loadAllPlayers();
      resetForm();
    } catch (err) {
      setError(
        editingAssignment
          ? "Failed to update player assignment"
          : "Failed to assign player to team"
      );
      console.error("Error submitting form:", err);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      player_id: assignment.player_id,
      first_name: assignment.first_name,
      last_name: assignment.last_name,
      date_of_birth: assignment.date_of_birth,
      jersey_number: assignment.jersey_number,
      position: assignment.position,
      is_new_player: false,
    });
    setShowForm(true);
  };

  const handleDelete = async (playerId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this player from the team?"
      )
    ) {
      try {
        await teamPlayerApi.removeFromTeam(playerId, teamId);
        await loadTeamPlayers();
      } catch (err) {
        setError("Failed to remove player from team");
        console.error("Error removing player:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      player_id: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      jersey_number: "",
      position: "",
      is_new_player: false,
    });
    setEditingAssignment(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading team players...</div>;

  return (
    <div className="team-players-container">
      <div className="section-header">
        <h2>👤 {teamName} Players</h2>
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
          <h3>
            {editingAssignment
              ? "Edit Player Assignment"
              : "Add Player to Team"}
          </h3>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_new_player"
                checked={formData.is_new_player}
                onChange={handleInputChange}
                disabled={editingAssignment}
              />
              Add New Player (check if player doesn't exist)
            </label>
          </div>

          {!formData.is_new_player && !editingAssignment && (
            <div className="form-group">
              <label>Select Existing Player *</label>
              <select
                name="player_id"
                value={formData.player_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a player</option>
                {allPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.first_name} {player.last_name} -{" "}
                    {new Date(player.date_of_birth).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(formData.is_new_player || editingAssignment) && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    disabled={editingAssignment}
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
                    disabled={editingAssignment}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                  disabled={editingAssignment}
                />
              </div>
            </>
          )}

          <div className="form-row">
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

            <div className="form-group">
              <label>Position *</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              >
                <option value="">Select position</option>
                <option value="Forward">Forward</option>
                <option value="Defence">Defence</option>
                <option value="Goalie">Goalie</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingAssignment ? "Update Assignment" : "Add Player"}
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

      <div className="team-players-table">
        <table>
          <thead>
            <tr>
              <th>Jersey #</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamPlayers.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No players assigned to {teamName}. Add your first player!
                </td>
              </tr>
            ) : (
              teamPlayers
                .sort((a, b) => {
                  // Define position priority (Defence first, then Forward, then Goalie)
                  const positionOrder = { Defence: 1, Forward: 2, Goalie: 3 };

                  // First sort by position
                  const positionDiff =
                    (positionOrder[a.position] || 999) -
                    (positionOrder[b.position] || 999);
                  if (positionDiff !== 0) return positionDiff;

                  // Then sort by jersey number within the same position
                  return a.jersey_number - b.jersey_number;
                })
                .map((player) => (
                  <tr key={`${player.player_id}-${teamId}`}>
                    <td className="jersey-number">#{player.jersey_number}</td>
                    <td
                      className={`player-name ${
                        onPlayerSelect ? "clickable" : ""
                      }`}
                      onClick={() => onPlayerSelect && onPlayerSelect(player)}
                      title={
                        onPlayerSelect ? "Click to view player details" : ""
                      }
                    >
                      {player.last_name}
                    </td>
                    <td
                      className={`player-name ${
                        onPlayerSelect ? "clickable" : ""
                      }`}
                      onClick={() => onPlayerSelect && onPlayerSelect(player)}
                      title={
                        onPlayerSelect ? "Click to view player details" : ""
                      }
                    >
                      {player.first_name}
                    </td>
                    <td className="position">
                      <span
                        className={`position-badge ${player.position.toLowerCase()}`}
                      >
                        {player.position}
                      </span>
                    </td>
                    <td className="actions">
                      {onPlayerSelect && (
                        <button
                          className="btn btn-view"
                          onClick={() => onPlayerSelect(player)}
                          title="View player details"
                        >
                          👁️
                        </button>
                      )}
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(player)}
                        title="Edit assignment"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(player.player_id)}
                        title="Remove from team"
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

      <div className="team-players-stats">
        <p>Total Players: {teamPlayers.length}</p>
      </div>
    </div>
  );
};

export default TeamPlayersComponent;
