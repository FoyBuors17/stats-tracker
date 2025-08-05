import { useState, useEffect } from "react";
import "./App.css";
import TeamsComponent from "./components/Teams";
import TeamDetails from "./components/TeamDetails";
import { healthApi } from "./services/api";

function App() {
  const [currentView, setCurrentView] = useState("teams"); // "teams" or "teamDetails"
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking");

  // Check server health on component mount
  useEffect(() => {
    checkServerHealth();
  }, []);

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

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setCurrentView("teams");
  };

  const renderContent = () => {
    switch (currentView) {
      case "teams":
        return <TeamsComponent onTeamSelect={handleTeamSelect} />;
      case "teamDetails":
        return (
          <TeamDetails team={selectedTeam} onBackToTeams={handleBackToTeams} />
        );
      default:
        return <TeamsComponent onTeamSelect={handleTeamSelect} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚽ Stats Management System</h1>
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
