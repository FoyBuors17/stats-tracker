--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-05 23:16:30

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 17514)
-- Name: player_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_stats (
    id integer NOT NULL,
    player_id integer,
    season character varying(20) NOT NULL,
    games_played integer DEFAULT 0,
    goals integer DEFAULT 0,
    assists integer DEFAULT 0,
    yellow_cards integer DEFAULT 0,
    red_cards integer DEFAULT 0,
    minutes_played integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.player_stats OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17513)
-- Name: player_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.player_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_stats_id_seq OWNER TO postgres;

--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 221
-- Name: player_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.player_stats_id_seq OWNED BY public.player_stats.id;


--
-- TOC entry 220 (class 1259 OID 17497)
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    team_id integer,
    jersey_number integer NOT NULL,
    "position" character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT players_position_check CHECK ((("position")::text = ANY ((ARRAY['goalie'::character varying, 'forward'::character varying, 'defence'::character varying])::text[])))
);


ALTER TABLE public.players OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17496)
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO postgres;

--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 219
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- TOC entry 218 (class 1259 OID 17485)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    city character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    season character varying(20) NOT NULL,
    sport character varying(50) DEFAULT 'hockey'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17484)
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO postgres;

--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 217
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- TOC entry 4712 (class 2604 OID 17517)
-- Name: player_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_stats ALTER COLUMN id SET DEFAULT nextval('public.player_stats_id_seq'::regclass);


--
-- TOC entry 4709 (class 2604 OID 17500)
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- TOC entry 4705 (class 2604 OID 17488)
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- TOC entry 4886 (class 0 OID 17514)
-- Dependencies: 222
-- Data for Name: player_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player_stats (id, player_id, season, games_played, goals, assists, yellow_cards, red_cards, minutes_played, created_at, updated_at) FROM stdin;
1	1	2023-24	25	12	8	0	0	2100	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
2	2	2023-24	28	6	14	0	0	2400	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
3	3	2023-24	30	18	4	0	0	2600	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
4	4	2023-24	32	4	12	0	0	2800	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
5	5	2023-24	29	15	9	0	0	2500	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
6	6	2023-24	31	3	11	0	0	2700	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
\.


--
-- TOC entry 4884 (class 0 OID 17497)
-- Dependencies: 220
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.players (id, first_name, last_name, team_id, jersey_number, "position", created_at, updated_at) FROM stdin;
1	Marcus	Rashford	1	10	forward	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
2	David	de Gea	1	1	goalie	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
3	Harry	Maguire	1	5	defence	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
4	Robert	Lewandowski	2	9	forward	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
5	Marc-André	ter Stegen	2	1	goalie	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
6	Gerard	Piqué	2	3	defence	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
10	Cruz	Buors	6	17	forward	2025-08-05 15:22:46.783167	2025-08-05 15:22:46.783167
11	Rhys	Riddell	6	16	forward	2025-08-05 15:23:08.413673	2025-08-05 15:23:08.413673
12	Josh	Martin	6	18	forward	2025-08-05 15:23:28.695208	2025-08-05 15:23:28.695208
13	Kale 	Jonas	6	21	forward	2025-08-05 15:23:56.697468	2025-08-05 15:23:56.697468
14	Garrett	Dickinson	6	31	goalie	2025-08-05 15:24:16.118498	2025-08-05 15:24:16.118498
15	Derek	VanTilbourg	6	4	defence	2025-08-05 15:24:43.787377	2025-08-05 15:24:43.787377
16	Jaxon	Tarnowski	6	2	defence	2025-08-05 15:25:03.695358	2025-08-05 15:25:03.695358
17	Max	Catalano	6	3	defence	2025-08-05 15:25:36.624841	2025-08-05 15:25:36.624841
18	Seth 	Buors	7	29	goalie	2025-08-05 16:03:36.113452	2025-08-05 16:03:36.113452
19	Alex	Kandler	7	18	forward	2025-08-05 16:03:55.500075	2025-08-05 16:03:55.500075
20	Decker	Sutherland	7	21	defence	2025-08-05 16:04:41.886815	2025-08-05 16:04:41.886815
\.


--
-- TOC entry 4882 (class 0 OID 17485)
-- Dependencies: 218
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, city, name, season, sport, created_at, updated_at) FROM stdin;
1	Toronto	Toronto Maple Leafs	2024-25	hockey	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
2	Montreal	Montreal Canadiens	2024-25	hockey	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
4	New York	New York Rangers	2024-25	hockey	2025-08-05 15:20:27.345619	2025-08-05 15:20:27.345619
6	Abbotsford	Hawks U18 A1	2025-26	hockey	2025-08-05 15:21:57.506109	2025-08-05 15:21:57.506109
7	Abbotsford	Hawks U15 C4	2025-26	hockey	2025-08-05 16:03:06.776398	2025-08-05 16:03:06.776398
\.


--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 221
-- Name: player_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.player_stats_id_seq', 6, true);


--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 219
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 20, true);


--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 217
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 7, true);


--
-- TOC entry 4731 (class 2606 OID 17527)
-- Name: player_stats player_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_stats
    ADD CONSTRAINT player_stats_pkey PRIMARY KEY (id);


--
-- TOC entry 4733 (class 2606 OID 17529)
-- Name: player_stats player_stats_player_id_season_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_stats
    ADD CONSTRAINT player_stats_player_id_season_key UNIQUE (player_id, season);


--
-- TOC entry 4727 (class 2606 OID 17505)
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- TOC entry 4729 (class 2606 OID 17507)
-- Name: players players_team_id_jersey_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_jersey_number_key UNIQUE (team_id, jersey_number);


--
-- TOC entry 4723 (class 2606 OID 17495)
-- Name: teams teams_name_season_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_name_season_key UNIQUE (name, season);


--
-- TOC entry 4725 (class 2606 OID 17493)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 4735 (class 2606 OID 17530)
-- Name: player_stats player_stats_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_stats
    ADD CONSTRAINT player_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4734 (class 2606 OID 17508)
-- Name: players players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


-- Completed on 2025-08-05 23:16:30

--
-- PostgreSQL database dump complete
--

