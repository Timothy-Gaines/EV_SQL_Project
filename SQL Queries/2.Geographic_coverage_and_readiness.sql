/*
1. Port availability by state: Which five states have the highest and the lowest total charging-port counts per 100 000 residents?

2. DC-fast ZIP-code hotspots: Which ten ZIP codes contain the greatest number of stations equipped with at least one DC-fast charger?

3. Large-city gaps: Among U.S. cities with populations above 100 000, which ones operate fewer than five charging stations of any type?
*/


-- Query 1a: Identify the five states with the highest and lowest
-- total number of charging ports per 100 000 residents.
-- ================================================================

WITH ports_per_state AS (
    -- Aggregate total ports (Level 1 + Level 2 + DC-fast) for each state
    SELECT
        ev_stations.state_abbrev,                                             -- State two-letter code
        SUM(                                                                   -- Total charging ports in the state
            COALESCE(ev_stations.ev_level1_evse_num,0) +
            COALESCE(ev_stations.ev_level2_evse_num,0) +
            COALESCE(ev_stations.ev_dc_fast_count,0)
        ) AS total_ports,
        ROUND(                                                                 -- Ports per 100 000 residents
            SUM(
              COALESCE(ev_stations.ev_level1_evse_num,0) +
              COALESCE(ev_stations.ev_level2_evse_num,0) +
              COALESCE(ev_stations.ev_dc_fast_count,0)
            )::numeric * 100000 / state_population.popestimate2023,
        2) AS ports_per_100k
    FROM
        ev_stations
    LEFT JOIN
        state_population ON ev_stations.state_abbrev = state_population.state_abbrev
    GROUP BY
        ev_stations.state_abbrev,                                              -- Group by state
        state_population.popestimate2023                                       -- Required for per-capita calc
)

-- Top 5 states by ports per 100 k
(
    SELECT
        'TOP 5 STATES' AS Category,
        state_abbrev,
        total_ports,
        ports_per_100k
    FROM    
        ports_per_state
    ORDER BY
        ports_per_100k DESC                                                    -- Highest first
    LIMIT 5
)

UNION ALL

-- Bottom 5 states by ports per 100 k
(
    SELECT
        'BOTTOM 5 STATES' AS Category,
        state_abbrev,
        total_ports,
        ports_per_100k
    FROM    
        ports_per_state
    ORDER BY
        ports_per_100k                                                         -- Lowest first
    LIMIT 5
);

/* 
   Query 1b: Same analysis but only for DC-fast charging connectors
   per 100 000 residents.
----------------------------------------------------------------- */

WITH DC_fast_ports_per_state AS (
    -- Calculate DC-fast ports per 100 k residents for each state
    SELECT
        ev_stations.state_abbrev,
        ROUND(SUM(ev_dc_fast_count)::numeric * 100000 / state_population.popestimate2023,2) AS DC_fast_ports_per_100k
    FROM
        ev_stations
    LEFT JOIN
        state_population ON ev_stations.state_abbrev = state_population.state_abbrev
    WHERE
        ev_dc_fast_count > 0                                                   -- Ignore stations without DC-fast
    GROUP BY
        ev_stations.state_abbrev,
        state_population.popestimate2023
)

-- Top 5
(
    SELECT
        'TOP 5 STATES' AS Category,
        state_abbrev,
        DC_fast_ports_per_100k
    FROM    
        DC_fast_ports_per_state
    ORDER BY
        DC_fast_ports_per_100k DESC
    LIMIT 5
)

UNION ALL

-- Bottom 5
(
    SELECT
        'BOTTOM 5 STATES' AS Category,
        state_abbrev,
        DC_fast_ports_per_100k
    FROM    
        DC_fast_ports_per_state
    ORDER BY
        DC_fast_ports_per_100k
    LIMIT 5
);

/*
2. DC-fast ZIP-code hotspots: Which ten ZIP codes contain the greatest number of stations equipped with at least one DC-fast charger?
*/

/* 
   Query 2a: Top ten ZIP codes by total number of DC-fast stations.
----------------------------------------------------------------- */

SELECT
    zip,                                   -- 5-digit ZIP
    COUNT(*) AS total_stations             -- Number of stations (rows) in ZIP
FROM
    ev_stations
WHERE
    zip IS NOT NULL                        -- Exclude null ZIPs
    AND ev_dc_fast_count > 0               -- Focus on locations with at least one DC-fast port
GROUP BY
    zip
ORDER BY
    total_stations DESC
LIMIT 10;

/* 
   Query 2b: Same, but also show mix of DC-fast vs Level 2 stations
   and percent that are DC-fast.
----------------------------------------------------------------- */

SELECT
    zip,
    COUNT(*) AS total_stations,
    -- Count of stations that have DC-fast ports
    SUM(CASE WHEN ev_dc_fast_count > 0 THEN 1 ELSE 0 END) AS total_dc_fast_stations,
    -- Count of stations that have Level 2 ports
    SUM(CASE WHEN ev_level2_evse_num > 0 THEN 1 ELSE 0 END) AS total_level2_stations,
    -- % of stations in the ZIP that are DC-fast
    ROUND(
      100.0 * SUM(CASE WHEN ev_dc_fast_count > 0 THEN 1 ELSE 0 END) / COUNT(*),
    1) AS dc_fast_station_percentage
FROM
    ev_stations
WHERE
    zip IS NOT NULL
GROUP BY
    zip
ORDER BY
    total_stations DESC
LIMIT 10;

/*
3. Large-city gaps: Among U.S. cities with populations above 100 000, which ones operate fewer than five charging stations of any type?
*/

/* 
   Query 3: Cities with population >100 000 that have fewer than
   5 EV charging stations (any type).
----------------------------------------------------------------- */

SELECT
    city_population.city,
    city_population.state_abbrev,
    city_population.pop2024,
    COUNT(station_id) AS total_stations
FROM
    ev_stations
LEFT JOIN
    city_population ON ev_stations.city = city_population.city
WHERE
    city_population.city IS NOT NULL          -- Ensure population record exists
    AND pop2024 > 100000                      -- Large cities only
GROUP BY
    city_population.city,
    city_population.state_abbrev,
    city_population.pop2024
ORDER BY
    total_stations ASC                        -- Fewest stations first
LIMIT 5;                                      -- Surface the five most underserved







