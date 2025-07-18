DROP DATABASE IF EXISTS ev_project;
CREATE DATABASE ev_project;

--Create tables

DROP TABLE IF EXISTS ev_stations CASCADE;
DROP TABLE IF EXISTS state_population CASCADE;

-- Create population lookup table
CREATE TABLE IF NOT EXISTS state_population (
    state_abbrev     CHAR(2) PRIMARY KEY,   -- two-letter code (e.g. 'CA')
    state_name       TEXT NOT NULL,         -- full state or region name
    popestimate2023  INT                    -- population estimate
);

-- Create EV station data table with relationships
CREATE TABLE IF NOT EXISTS ev_stations (
    station_id                 SERIAL PRIMARY KEY,
    station_name               TEXT,
    street_address             TEXT,
    city                       TEXT,
    state_abbrev               CHAR(2) NOT NULL REFERENCES public.state_population(state_abbrev),
    zip                        TEXT,
    open_date                  DATE,
    ev_network                 TEXT,
    ev_level1_evse_num         INT,
    ev_level2_evse_num         INT,
    ev_dc_fast_count           INT,
    access_days_time           TEXT,
    latitude                   DOUBLE PRECISION,
    longitude                  DOUBLE PRECISION,
    ev_pricing                 TEXT,
    ev_connector_types         TEXT,
    facility_type              TEXT
);

-- Index to speed up queries by state
CREATE INDEX IF NOT EXISTS idx_ev_state ON ev_stations(state_abbrev);

-- Ownership can be reset if needed
ALTER TABLE state_population OWNER TO postgres;
ALTER TABLE ev_stations     OWNER TO postgres;


CREATE TABLE city_population (
    city          TEXT NOT NULL,
    state_abbrev  CHAR(2) NOT NULL,
    pop2024       INT,
    PRIMARY KEY (city, state_abbrev)
);


-- Insert data into the tables used pgAdmin and Psql to add data to the tables

\COPY state_population(state_abbrev,state_name,popestimate2023)FROM 'C:\Users\timga\Documents\GitHub\EV_SQL_Project\Data\State_population.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');


\COPY ev_stations (station_name,street_address,city,state_abbrev,zip,open_date,ev_network,ev_level1_evse_num,ev_level2_evse_num,ev_dc_fast_count,access_days_time,latitude,longitude,ev_pricing,ev_connector_types,facility_type)FROM 'C:\Users\timga\Documents\GitHub\EV_SQL_Project\Data\alt_fuel_stations_(Jun 19 2025)_updated.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8');

\COPY city_population(city,state_abbrev,pop2024)FROM 'C:\Users\timga\Documents\GitHub\EV_SQL_Project\Data\City_population.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

SELECT * FROM city_population
LIMIT 10;


SELECT current_user;
