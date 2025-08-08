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
-- Create game table
CREATE TABLE IF NOT EXISTS game (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES team(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    home_away VARCHAR(20) NOT NULL CHECK (home_away IN ('Home', 'Away', 'Tournament')),
    game_type VARCHAR(100) NOT NULL,
    opponent VARCHAR(100) NOT NULL,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    period_1_length INTEGER DEFAULT 0,
    period_2_length INTEGER DEFAULT 0,
    period_3_length INTEGER DEFAULT 0,
    ot_length INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create game_type table for dropdown options
CREATE TABLE IF NOT EXISTS game_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create opponent table for dropdown options
CREATE TABLE IF NOT EXISTS opponent (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create game_player junction table (players assigned to specific games)
CREATE TABLE IF NOT EXISTS game_player (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES game(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES player(id) ON DELETE CASCADE,
    is_starting_goalie BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, player_id) -- Prevent duplicate player assignments to same game
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
-- Insert sample game types
INSERT INTO game_type (name)
VALUES ('Regular Season'),
    ('Playoff'),
    ('Exhibition'),
    ('Tournament'),
    ('Championship'),
    ('Friendly') ON CONFLICT (name) DO NOTHING;
-- Insert sample opponents
INSERT INTO opponent (name)
VALUES ('Rangers'),
    ('Bruins'),
    ('Canadiens'),
    ('Flyers'),
    ('Penguins'),
    ('Senators') ON CONFLICT (name) DO NOTHING;
-- Insert sample games
INSERT INTO game (
        team_id,
        date,
        home_away,
        game_type,
        opponent,
        goals_for,
        goals_against,
        period_1_length,
        period_2_length,
        period_3_length,
        ot_length
    )
VALUES (
        1,
        '2024-01-15',
        'Home',
        'Regular Season',
        'Rangers',
        3,
        2,
        20,
        20,
        20,
        0
    ),
    (
        1,
        '2024-01-18',
        'Away',
        'Regular Season',
        'Bruins',
        1,
        4,
        20,
        20,
        20,
        0
    ),
    (
        1,
        '2024-01-22',
        'Home',
        'Playoff',
        'Canadiens',
        5,
        1,
        20,
        20,
        20,
        5
    ),
    (
        2,
        '2024-01-16',
        'Away',
        'Regular Season',
        'Flyers',
        2,
        3,
        20,
        20,
        20,
        0
    ),
    (
        2,
        '2024-01-20',
        'Home',
        'Exhibition',
        'Penguins',
        4,
        2,
        20,
        20,
        20,
        0
    );
-- Insert sample game-player assignments
INSERT INTO game_player (game_id, player_id, is_starting_goalie)
VALUES (1, 1, TRUE),
    -- Player 1 is starting goalie for Game 1
    (1, 2, FALSE),
    (1, 3, FALSE),
    -- Game 1 players
    (2, 1, TRUE),
    -- Player 1 is starting goalie for Game 2
    (2, 3, FALSE),
    (2, 4, FALSE),
    -- Game 2 players
    (3, 2, FALSE),
    (3, 4, FALSE),
    (3, 5, TRUE),
    -- Player 5 is starting goalie for Game 3
    -- Game 3 players
    (4, 6, FALSE),
    (4, 7, FALSE),
    (4, 8, TRUE),
    -- Player 8 is starting goalie for Game 4
    -- Game 4 players
    (5, 7, FALSE),
    (5, 8, TRUE),
    -- Player 8 is starting goalie for Game 5
    (5, 9, FALSE) ON CONFLICT (game_id, player_id) DO NOTHING;
-- Game 5 players