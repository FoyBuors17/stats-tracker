import { useState, useEffect } from "react";
import { playersApi, statsApi } from "../services/api";

const PlayerDetails = ({ player, onBackToPlayers }) => {
  const [playerStats, setPlayerStats] = useState([]);
  const [totalStats, setTotalStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (player?.id) {
      loadPlayerStats();
    }
  }, [player]);

  const loadPlayerStats = async () => {
    try {
      setLoading(true);

      // Get all stats and filter for this player
      const statsResponse = await statsApi.getAll();
      const allStats = statsResponse.data.stats || [];

      // Filter stats for this specific player
      const playerStatsData = allStats.filter(
        (stat) => stat.player_id === player.id
      );
      setPlayerStats(playerStatsData);

      // Calculate total stats
      const totals = playerStatsData.reduce((acc, stat) => {
        acc.games_played = (acc.games_played || 0) + (stat.games_played || 0);
        acc.goals = (acc.goals || 0) + (stat.goals || 0);
        acc.assists = (acc.assists || 0) + (stat.assists || 0);
        acc.yellow_cards = (acc.yellow_cards || 0) + (stat.yellow_cards || 0);
        acc.red_cards = (acc.red_cards || 0) + (stat.red_cards || 0);
        acc.minutes_played =
          (acc.minutes_played || 0) + (stat.minutes_played || 0);
        return acc;
      }, {});

      // Calculate additional stats
      totals.points = (totals.goals || 0) + (totals.assists || 0);
      totals.avg_minutes =
        totals.games_played > 0
          ? Math.round(totals.minutes_played / totals.games_played)
          : 0;

      setTotalStats(totals);
      setError(null);
    } catch (err) {
      setError("Failed to load player statistics");
      console.error("Error loading player stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading player details...</div>;

  return (
    <div className="player-details-container">
      {/* Player Header */}
      <div className="player-header">
        <div className="player-info">
          <h2>
            🏒 {player.first_name} {player.last_name}
          </h2>
          <div className="player-meta">
            <span className="jersey">#{player.jersey_number}</span>
            <span className={`position-badge ${player.position}`}>
              {player.position?.charAt(0).toUpperCase() +
                player.position?.slice(1)}
            </span>
            <span className="team-name">{player.team_name}</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Total Stats Summary */}
      <div className="stats-summary">
        <h3>📊 Career Totals</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{totalStats.games_played || 0}</div>
            <div className="stat-label">Games</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalStats.goals || 0}</div>
            <div className="stat-label">Goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalStats.assists || 0}</div>
            <div className="stat-label">Assists</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalStats.points || 0}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalStats.avg_minutes || 0}</div>
            <div className="stat-label">Avg Min/Game</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalStats.yellow_cards || 0}</div>
            <div className="stat-label">Yellow Cards</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalStats.red_cards || 0}</div>
            <div className="stat-label">Red Cards</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalStats.minutes_played || 0}</div>
            <div className="stat-label">Total Minutes</div>
          </div>
        </div>
      </div>

      {/* Game-by-Game Stats */}
      <div className="game-stats">
        <h3>🎮 Game Statistics</h3>
        {playerStats.length === 0 ? (
          <div className="no-data">
            <p>
              No game statistics found for {player.first_name}{" "}
              {player.last_name}.
            </p>
            <p>Game stats will appear here once games are recorded.</p>
          </div>
        ) : (
          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Games</th>
                  <th>Goals</th>
                  <th>Assists</th>
                  <th>Points</th>
                  <th>Minutes</th>
                  <th>Yellow Cards</th>
                  <th>Red Cards</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((stat, index) => (
                  <tr key={`${stat.player_id}-${stat.season}-${index}`}>
                    <td>{stat.season}</td>
                    <td>{stat.games_played || 0}</td>
                    <td className="highlight-goals">{stat.goals || 0}</td>
                    <td className="highlight-assists">{stat.assists || 0}</td>
                    <td className="highlight-points">
                      {(stat.goals || 0) + (stat.assists || 0)}
                    </td>
                    <td>{stat.minutes_played || 0}</td>
                    <td className="cards yellow">{stat.yellow_cards || 0}</td>
                    <td className="cards red">{stat.red_cards || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {playerStats.length > 0 && (
        <div className="performance-insights">
          <h3>📈 Performance Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-title">Goals per Game</div>
              <div className="insight-value">
                {totalStats.games_played > 0
                  ? (totalStats.goals / totalStats.games_played).toFixed(2)
                  : "0.00"}
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-title">Assists per Game</div>
              <div className="insight-value">
                {totalStats.games_played > 0
                  ? (totalStats.assists / totalStats.games_played).toFixed(2)
                  : "0.00"}
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-title">Points per Game</div>
              <div className="insight-value">
                {totalStats.games_played > 0
                  ? (totalStats.points / totalStats.games_played).toFixed(2)
                  : "0.00"}
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-title">Discipline Rating</div>
              <div className="insight-value">
                {totalStats.games_played > 0
                  ? (
                      (totalStats.yellow_cards + totalStats.red_cards * 2) /
                      totalStats.games_played
                    ).toFixed(2)
                  : "0.00"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetails;
