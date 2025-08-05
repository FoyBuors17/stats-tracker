-- Stats Database Schema
-- Run this in your PostgreSQL database to create the tables
-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    season VARCHAR(20) NOT NULL,
    sport VARCHAR(50) NOT NULL DEFAULT 'hockey',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, season) -- Prevent duplicate team names in same season
);
-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    jersey_number INTEGER NOT NULL,
    position VARCHAR(20) NOT NULL CHECK (position IN ('goalie', 'forward', 'defence')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, jersey_number) -- Prevent duplicate jersey numbers within same team
);
-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL,
    games_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, season)
);
-- Insert sample data
INSERT INTO teams (city, name, season, sport)
VALUES (
        'Toronto',
        'Toronto Maple Leafs',
        '2024-25',
        'hockey'
    ),
    (
        'Montreal',
        'Montreal Canadiens',
        '2024-25',
        'hockey'
    ),
    (
        'Boston',
        'Boston Bruins',
        '2024-25',
        'hockey'
    ),
    (
        'New York',
        'New York Rangers',
        '2024-25',
        'hockey'
    ),
    (
        'Chicago',
        'Chicago Blackhawks',
        '2024-25',
        'hockey'
    ) ON CONFLICT (name, season) DO NOTHING;
INSERT INTO players (
        first_name,
        last_name,
        team_id,
        jersey_number,
        position
    )
VALUES (
        'Marcus',
        'Rashford',
        1,
        10,
        'forward'
    ),
    (
        'David',
        'de Gea',
        1,
        1,
        'goalie'
    ),
    (
        'Harry',
        'Maguire',
        1,
        5,
        'defence'
    ),
    (
        'Robert',
        'Lewandowski',
        2,
        9,
        'forward'
    ),
    (
        'Marc-André',
        'ter Stegen',
        2,
        1,
        'goalie'
    ),
    (
        'Gerard',
        'Piqué',
        2,
        3,
        'defence'
    ),
    (
        'Karim',
        'Benzema',
        3,
        9,
        'forward'
    ),
    (
        'Thibaut',
        'Courtois',
        3,
        1,
        'goalie'
    ),
    (
        'Sergio',
        'Ramos',
        3,
        4,
        'defence'
    ) ON CONFLICT (team_id, jersey_number) DO NOTHING;
INSERT INTO player_stats (
        player_id,
        season,
        games_played,
        goals,
        assists,
        minutes_played
    )
VALUES (1, '2023-24', 25, 12, 8, 2100),
    (2, '2023-24', 28, 6, 14, 2400),
    (3, '2023-24', 30, 18, 4, 2600),
    (4, '2023-24', 32, 4, 12, 2800),
    (5, '2023-24', 29, 15, 9, 2500),
    (6, '2023-24', 31, 3, 11, 2700) ON CONFLICT (player_id, season) DO NOTHING;