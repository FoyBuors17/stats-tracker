import { useState, useEffect } from "react";
import "./App.css";
import TeamsComponent from "./components/Teams";
import TeamDetails from "./components/TeamDetails";
import PlayerDetails from "./components/PlayerDetails";
import { healthApi } from "./services/api";

function App() {
  const [currentView, setCurrentView] = useState("teams"); // "teams", "teamDetails", or "playerDetails"
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking");
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);

  // Sports emojis array for cycling
  const sportsEmojis = [
    "🏒", // hockey
    "⚽", // soccer
    "🏀", // basketball
    "🏈", // football
    "⚾", // baseball
    "🎾", // tennis
    "🏐", // volleyball
    "🏉", // rugby
    "🏏", // cricket
    "🏌️", // golf
  ];

  // Check server health on component mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  // Cycle through sports emojis every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmojiIndex(
        (prevIndex) => (prevIndex + 1) % sportsEmojis.length
      );
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [sportsEmojis.length]);

  const checkServerHealth = async () => {
    try {
      await healthApi.check();
      setServerStatus("connected");
    } catch (error) {
      setServerStatus("disconnected");
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case "connected":
        return "#10b981";
      case "disconnected":
        return "#ef4444";
      default:
        return "#f59e0b";
    }
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setCurrentView("teamDetails");
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setCurrentView("playerDetails");
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setSelectedPlayer(null);
    setCurrentView("teams");
  };

  const handleBackToTeamDetails = () => {
    setSelectedPlayer(null);
    setCurrentView("teamDetails");
  };

  const renderContent = () => {
    switch (currentView) {
      case "teams":
        return <TeamsComponent onTeamSelect={handleTeamSelect} />;
      case "teamDetails":
        return (
          <TeamDetails
            team={selectedTeam}
            onBackToTeams={handleBackToTeams}
            onPlayerSelect={handlePlayerSelect}
          />
        );
      case "playerDetails":
        return (
          <PlayerDetails
            player={selectedPlayer}
            onBackToPlayers={handleBackToTeamDetails}
          />
        );
      default:
        return <TeamsComponent onTeamSelect={handleTeamSelect} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>{sportsEmojis[currentEmojiIndex]} Stats Management System</h1>
        <div className="server-status">
          <span
            className="status-indicator"
            style={{ backgroundColor: getStatusColor() }}
          ></span>
          <span>Server: {serverStatus}</span>
          <button onClick={checkServerHealth} className="refresh-btn">
            🔄
          </button>
        </div>
      </header>

      {currentView === "teams" && (
        <nav className="app-nav">
          <button className="nav-btn active">🏟️ Teams</button>
        </nav>
      )}

      {currentView === "teamDetails" && selectedTeam && (
        <nav className="app-nav">
          <button className="nav-btn back-btn" onClick={handleBackToTeams}>
            ← Back to Teams
          </button>
          <div className="team-header">
            <h2>
              📊 {selectedTeam.name} ({selectedTeam.season})
            </h2>
          </div>
        </nav>
      )}

      {currentView === "playerDetails" && selectedPlayer && (
        <nav className="app-nav">
          <button
            className="nav-btn back-btn"
            onClick={handleBackToTeamDetails}
          >
            ← Back to {selectedTeam?.name || "Team"}
          </button>
          <div className="player-header">
            <h2>
              🏒 {selectedPlayer.first_name} {selectedPlayer.last_name}
            </h2>
          </div>
        </nav>
      )}

      <main className="app-main">
        {serverStatus === "disconnected" ? (
          <div className="error-message">
            <h2>⚠️ Server Disconnected</h2>
            <p>Please make sure your backend server is running on port 3000</p>
            <code>cd backend && npm start</code>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}

export default App;
