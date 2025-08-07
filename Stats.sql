-- Stats Database Schema
-- Run this in your PostgreSQL database to create the tables
-- Create teams table
CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    season VARCHAR(20) NOT NULL,
    sport VARCHAR(50) NOT NULL DEFAULT 'hockey',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city, name, season) -- Prevent duplicate city/name/season combinations
);
-- Create players table
CREATE TABLE IF NOT EXISTS player (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(first_name, last_name, date_of_birth) -- Prevent duplicate first_name/last_name/date_of_birth combinations
);
-- Create team_player junction table
CREATE TABLE IF NOT EXISTS team_player (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES player(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES team(id) ON DELETE CASCADE,
    jersey_number INTEGER NOT NULL,
    position VARCHAR(20) NOT NULL CHECK (position IN ('Forward', 'Defence', 'Goalie')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, jersey_number),
    -- Prevent duplicate jersey numbers within same team
    UNIQUE(player_id, team_id) -- Prevent duplicate player-team assignments
);
-- Insert sample data
INSERT INTO team (city, name, level, season, sport)
VALUES (
        'Toronto',
        'Maple Leafs',
        'NHL',
        '2024-25',
        'hockey'
    ),
    (
        'Montreal',
        'Canadiens',
        'NHL',
        '2024-25',
        'hockey'
    ),
    (
        'Boston',
        'Bruins',
        'NHL',
        '2024-25',
        'hockey'
    ),
    (
        'New York',
        'Rangers',
        'NHL',
        '2024-25',
        'hockey'
    ),
    (
        'Chicago',
        'Blackhawks',
        'NHL',
        '2024-25',
        'hockey'
    ) ON CONFLICT (city, name, season) DO NOTHING;
INSERT INTO player (
        first_name,
        last_name,
        date_of_birth
    )
VALUES (
        'Marcus',
        'Rashford',
        '1997-10-31'
    ),
    (
        'David',
        'de Gea',
        '1990-11-07'
    ),
    (
        'Harry',
        'Maguire',
        '1993-03-05'
    ),
    (
        'Robert',
        'Lewandowski',
        '1988-08-21'
    ),
    (
        'Marc-André',
        'ter Stegen',
        '1992-04-30'
    ),
    (
        'Gerard',
        'Piqué',
        '1987-02-02'
    ),
    (
        'Karim',
        'Benzema',
        '1987-12-19'
    ),
    (
        'Thibaut',
        'Courtois',
        '1992-05-11'
    ),
    (
        'Sergio',
        'Ramos',
        '1986-03-30'
    ) ON CONFLICT (first_name, last_name, date_of_birth) DO NOTHING;
INSERT INTO team_player (
        player_id,
        team_id,
        jersey_number,
        position
    )
VALUES (1, 1, 10, 'Forward'),
    (2, 1, 1, 'Goalie'),
    (3, 1, 5, 'Defence'),
    (4, 2, 9, 'Forward'),
    (5, 2, 1, 'Goalie'),
    (6, 2, 3, 'Defence'),
    (7, 3, 9, 'Forward'),
    (8, 3, 1, 'Goalie'),
    (9, 3, 4, 'Defence'),
    -- Example: Player 1 (Marcus Rashford) also plays for team 2 with different jersey number
    (1, 2, 7, 'Forward') ON CONFLICT (player_id, team_id) DO NOTHING;