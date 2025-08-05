import { useState } from "react";
import PlayersComponent from "./Players";
import StatsComponent from "./Stats";

const TeamDetails = ({ team, onBackToTeams }) => {
  const [activeTab, setActiveTab] = useState("players");

  if (!team) {
    return (
      <div className="error-message">
        <h2>⚠️ No Team Selected</h2>
        <p>Please select a team to view details.</p>
        <button className="btn btn-primary" onClick={onBackToTeams}>
          ← Back to Teams
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "players":
        return <PlayersComponent teamId={team.id} teamName={team.name} />;
      case "stats":
        return <StatsComponent teamId={team.id} teamName={team.name} />;
      default:
        return <PlayersComponent teamId={team.id} teamName={team.name} />;
    }
  };

  return (
    <div className="team-details">
      <div className="team-details-header">
        <div className="team-info">
          <h1>{team.name}</h1>
          <p className="team-meta">
            📍 {team.city} • 📅 {team.season}
          </p>
        </div>
      </div>

      <nav className="team-nav">
        <button
          className={activeTab === "players" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("players")}
        >
          👤 Players
        </button>
        <button
          className={activeTab === "stats" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("stats")}
        >
          📊 Statistics
        </button>
      </nav>

      <main className="team-content">{renderTabContent()}</main>
    </div>
  );
};

export default TeamDetails;
