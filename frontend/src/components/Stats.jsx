import { useState, useEffect } from "react";
import { statsApi, playersApi } from "../services/api";

const StatsComponent = ({ teamId = null, teamName = null }) => {
  const [stats, setStats] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [formData, setFormData] = useState({
    player_id: "",
    season: "2023-24",
    games_played: "",
    goals: "",
    assists: "",
    yellow_cards: "",
    red_cards: "",
    minutes_played: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      if (teamId) {
        // Load data for specific team
        const [statsResponse, topScorersResponse, playersResponse] =
          await Promise.all([
            statsApi.getAll(), // We'll filter this on frontend for now
            statsApi.getTopScorers(),
            playersApi.getByTeam(teamId),
          ]);

        // Filter stats for this team's players
        const teamPlayerIds = (playersResponse.data.players || []).map(
          (p) => p.id
        );
        const teamStats = (statsResponse.data.stats || []).filter((stat) =>
          teamPlayerIds.includes(stat.player_id)
        );

        setStats(teamStats);
        setTopScorers(topScorersResponse.data.topScorers || []);
        setPlayers(playersResponse.data.players || []);
      } else {
        // Load all data
        const [statsResponse, topScorersResponse, playersResponse] =
          await Promise.all([
            statsApi.getAll(),
            statsApi.getTopScorers(),
            playersApi.getAll(),
          ]);
        setStats(statsResponse.data.stats || []);
        setTopScorers(topScorersResponse.data.topScorers || []);
        setPlayers(playersResponse.data.players || []);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load statistics");
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
      const statsData = {
        ...formData,
        player_id: parseInt(formData.player_id),
        games_played: parseInt(formData.games_played) || 0,
        goals: parseInt(formData.goals) || 0,
        assists: parseInt(formData.assists) || 0,
        yellow_cards: parseInt(formData.yellow_cards) || 0,
        red_cards: parseInt(formData.red_cards) || 0,
        minutes_played: parseInt(formData.minutes_played) || 0,
      };

      await statsApi.create(statsData);
      await loadData();
      resetForm();
    } catch (err) {
      setError("Failed to create player statistics");
      console.error("Error submitting form:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      player_id: "",
      season: "2023-24",
      games_played: "",
      goals: "",
      assists: "",
      yellow_cards: "",
      red_cards: "",
      minutes_played: "",
    });
    setShowForm(false);
  };

  const calculateAverages = () => {
    if (stats.length === 0)
      return { avgGoals: 0, avgAssists: 0, avgMinutes: 0 };

    const totals = stats.reduce(
      (acc, stat) => ({
        goals: acc.goals + (stat.goals || 0),
        assists: acc.assists + (stat.assists || 0),
        minutes: acc.minutes + (stat.minutes_played || 0),
      }),
      { goals: 0, assists: 0, minutes: 0 }
    );

    return {
      avgGoals: (totals.goals / stats.length).toFixed(1),
      avgAssists: (totals.assists / stats.length).toFixed(1),
      avgMinutes: (totals.minutes / stats.length).toFixed(0),
    };
  };

  const averages = calculateAverages();

  if (loading) return <div className="loading">Loading statistics...</div>;

  return (
    <div className="stats-container">
      <div className="section-header">
        <h2>
          📊 {teamName ? `${teamName} Statistics` : "Statistics Management"}
        </h2>
        <div className="stats-nav">
          <button
            className={activeView === "overview" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveView("overview")}
          >
            Overview
          </button>
          <button
            className={
              activeView === "topscorers" ? "nav-btn active" : "nav-btn"
            }
            onClick={() => setActiveView("topscorers")}
          >
            Top Scorers
          </button>
          <button
            className={activeView === "all" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveView("all")}
          >
            All Stats
          </button>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Stats"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="stats-form" onSubmit={handleSubmit}>
          <h3>Add Player Statistics</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Player *</label>
              <select
                name="player_id"
                value={formData.player_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.team_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Season *</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                required
              >
                <option value="2023-24">2023-24</option>
                <option value="2022-23">2022-23</option>
                <option value="2021-22">2021-22</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Games Played</label>
              <input
                type="number"
                name="games_played"
                value={formData.games_played}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Goals</label>
              <input
                type="number"
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Assists</label>
              <input
                type="number"
                name="assists"
                value={formData.assists}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Minutes Played</label>
              <input
                type="number"
                name="minutes_played"
                value={formData.minutes_played}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Yellow Cards</label>
              <input
                type="number"
                name="yellow_cards"
                value={formData.yellow_cards}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Red Cards</label>
              <input
                type="number"
                name="red_cards"
                value={formData.red_cards}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              Create Statistics
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

      {activeView === "overview" && (
        <div className="stats-overview">
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Players</h3>
              <p className="stat-number">{stats.length}</p>
            </div>
            <div className="stat-card">
              <h3>Avg Goals/Player</h3>
              <p className="stat-number">{averages.avgGoals}</p>
            </div>
            <div className="stat-card">
              <h3>Avg Assists/Player</h3>
              <p className="stat-number">{averages.avgAssists}</p>
            </div>
            <div className="stat-card">
              <h3>Avg Minutes/Player</h3>
              <p className="stat-number">{averages.avgMinutes}</p>
            </div>
          </div>
        </div>
      )}

      {activeView === "topscorers" && (
        <div className="top-scorers">
          <h3>🥇 Top Scorers (2023-24)</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Games</th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((player, index) => (
                <tr key={index}>
                  <td className="rank">#{index + 1}</td>
                  <td className="player-name">{player.player_name}</td>
                  <td>{player.team_name}</td>
                  <td className="goals">{player.goals}</td>
                  <td>{player.assists}</td>
                  <td>{player.games_played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === "all" && (
        <div className="all-stats">
          <h3>All Player Statistics</h3>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Team</th>
                <th>Season</th>
                <th>Games</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Minutes</th>
                <th>Cards</th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No statistics found. Add your first player stats!
                  </td>
                </tr>
              ) : (
                stats.map((stat) => (
                  <tr key={stat.id}>
                    <td className="player-name">{stat.player_name}</td>
                    <td>{stat.team_name}</td>
                    <td>{stat.season}</td>
                    <td>{stat.games_played}</td>
                    <td className="goals">{stat.goals}</td>
                    <td>{stat.assists}</td>
                    <td>{stat.minutes_played}</td>
                    <td>
                      <span className="yellow-cards">
                        🟨{stat.yellow_cards}
                      </span>
                      <span className="red-cards">🟥{stat.red_cards}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StatsComponent;
