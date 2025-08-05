import { useState, useEffect } from "react";
import { teamsApi } from "../services/api";

const TeamsComponent = ({ onTeamSelect }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    city: "",
    name: "",
    season: "2024-25",
    sport: "hockey",
  });

  // Load teams on component mount
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsApi.getAll();
      setTeams(response.data.teams || []);
      setError(null);
    } catch (err) {
      setError("Failed to load teams");
      console.error("Error loading teams:", err);
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
      if (editingTeam) {
        await teamsApi.update(editingTeam.id, formData);
      } else {
        await teamsApi.create(formData);
      }
      await loadTeams();
      resetForm();
    } catch (err) {
      setError(editingTeam ? "Failed to update team" : "Failed to create team");
      console.error("Error submitting form:", err);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      city: team.city || "",
      name: team.name || "",
      season: team.season || "2024-25",
      sport: team.sport || "hockey",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await teamsApi.delete(id);
        await loadTeams();
      } catch (err) {
        setError("Failed to delete team");
        console.error("Error deleting team:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      city: "",
      name: "",
      season: "2024-25",
      sport: "hockey",
    });
    setEditingTeam(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading teams...</div>;

  return (
    <div className="teams-container">
      <div className="section-header">
        <h2>🏟️ Teams Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Team"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="team-form" onSubmit={handleSubmit}>
          <h3>{editingTeam ? "Edit Team" : "Add New Team"}</h3>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Enter city"
              />
            </div>

            <div className="form-group">
              <label>Team Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter team name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Season *</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                required
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
                <option value="2027-28">2027-28</option>
                <option value="2023-24">2023-24</option>
                <option value="2022-23">2022-23</option>
                <option value="2021-22">2021-22</option>
                <option value="2020-21">2020-21</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sport *</label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                required
              >
                <option value="hockey">🏒 Hockey</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingTeam ? "Update Team" : "Create Team"}
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

      <div className="teams-table">
        <table>
          <thead>
            <tr>
              <th>City</th>
              <th>Team Name</th>
              <th>Season</th>
              <th>Sport</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No teams found. Add your first team!
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr key={team.id}>
                  <td>{team.city}</td>
                  <td
                    className="team-name clickable"
                    onClick={() => onTeamSelect(team)}
                    title="Click to view team details"
                  >
                    {team.name}
                  </td>
                  <td>{team.season}</td>
                  <td>
                    <span className="sport-badge hockey">
                      🏒{" "}
                      {team.sport
                        ? team.sport.charAt(0).toUpperCase() +
                          team.sport.slice(1)
                        : "Hockey"}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-view"
                      onClick={() => onTeamSelect(team)}
                      title="View team details"
                    >
                      👁️
                    </button>
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(team)}
                      title="Edit team"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(team.id)}
                      title="Delete team"
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

      <div className="teams-stats">
        <p>Total Teams: {teams.length}</p>
      </div>
    </div>
  );
};

export default TeamsComponent;
