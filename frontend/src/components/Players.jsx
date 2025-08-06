import { useState, useEffect } from "react";
import { playersApi } from "../services/api";

const PlayersComponent = ({ onPlayerSelect = null }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all players
      const playersResponse = await playersApi.getAll();
      setPlayers(playersResponse.data.players || []);

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
      date_of_birth: player.date_of_birth || "",
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
      date_of_birth: "",
    });
    setEditingPlayer(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading players...</div>;

  return (
    <div className="players-container">
      <div className="section-header">
        <h2>👤 Players Management</h2>
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
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                required
                placeholder="Select date of birth"
              />
            </div>
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
              <th>Date of Birth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  No players found. Add your first player!
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr key={player.id}>
                  <td
                    className={`player-name ${
                      onPlayerSelect ? "clickable" : ""
                    }`}
                    onClick={() => onPlayerSelect && onPlayerSelect(player)}
                    title={onPlayerSelect ? "Click to view player details" : ""}
                  >
                    {player.first_name}
                  </td>
                  <td
                    className={`player-name ${
                      onPlayerSelect ? "clickable" : ""
                    }`}
                    onClick={() => onPlayerSelect && onPlayerSelect(player)}
                    title={onPlayerSelect ? "Click to view player details" : ""}
                  >
                    {player.last_name}
                  </td>
                  <td className="date-of-birth">
                    {player.date_of_birth
                      ? new Date(player.date_of_birth).toLocaleDateString()
                      : "-"}
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
