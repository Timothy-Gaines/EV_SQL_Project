/*
1. DC-fast market leader by state: For every state, which charging network operates the largest share of DC-fast stations, and what percent of the state’s DC-fast network do they control?

2. Biggest builder over the last year: Which network opened the highest number of new stations in the past 12 months, and how many sites did it add?

3. Free-charging strongholds: In states where free stations account for more than 5 % of all sites, which networks provide the majority of those free locations?
*/

WITH stations_per_state AS (
    -- Total number of DC-fast stations in each state
    SELECT
        state_abbrev,
        COUNT(station_id) AS total_stations
    FROM
        ev_stations
    WHERE
        ev_dc_fast_count > 0                        -- Consider only DC-fast capable sites
    GROUP BY
        state_abbrev
),

network_total_per_state AS (
    -- Number of DC-fast stations owned by each network within each state
    SELECT
        state_abbrev,
        ev_network,
        COUNT(station_id) AS network_total
    FROM
        ev_stations
    WHERE
        ev_dc_fast_count > 0
    GROUP BY
        state_abbrev,
        ev_network
),

state_network_share AS (
    -- Compute each network's % share of the state total
    SELECT
        nt.state_abbrev,
        nt.ev_network,
        nt.network_total,
        sps.total_stations,
        ROUND(100.0 * nt.network_total::numeric / sps.total_stations, 1) AS network_share
    FROM
        network_total_per_state nt
    JOIN
        stations_per_state sps ON nt.state_abbrev = sps.state_abbrev
),

ranked AS (
    -- Rank networks by share within each state (1 = largest)
    SELECT
        state_abbrev,
        ev_network,
        ROUND(network_share,2) AS network_share,
        RANK() OVER (PARTITION BY state_abbrev ORDER BY network_share DESC) AS rank
    FROM
        state_network_share
)

-- Final result: one row per state showing the #1 network and its market share
SELECT                                          -- Columns returned to the user
    state_abbrev,                               -- Two-letter state code
    ev_network AS top_network,                  -- Network with highest share in that state
    network_share AS market_share_pct           -- Percentage of DC-fast sites run by that network
FROM
    ranked
WHERE
    rank = 1                                     -- Keep only highest-ranked network per state
ORDER BY
    state_abbrev;                                -- Alphabetical state ordering


-- Query 2a: Network with the most total stations opened in the last 12 months (any charger type)
-- -----------------------------------------------------------------------------------------------------------------

WITH network_growth AS (
    -- Determine rolling 12-month window ending on the latest open_date in the data
    SELECT
        MAX(open_date) AS latest_date,                       -- Most recent station opening date
        MAX(open_date) - INTERVAL '12 months' AS first_date  -- Date 12 months prior
    FROM ev_stations
    WHERE open_date IS NOT NULL                              -- Ignore records missing open_date
)

-- Count new stations for every network inside that window
SELECT
    ev_stations.ev_network,                                  -- Network/operator name
    COUNT(station_id) AS new_stations,                       -- Number of stations opened in window
    network_growth.latest_date,                              -- Window end date (for reference)
    network_growth.first_date                                -- Window start date (for reference)
FROM
    ev_stations
CROSS JOIN network_growth                                    -- Apply same window bounds to all rows
WHERE
    ev_stations.open_date BETWEEN network_growth.first_date  -- Keep rows inside 12-month range
        AND network_growth.latest_date
GROUP BY                                                    -- Aggregate counts per network
    ev_stations.ev_network,
    network_growth.latest_date,
    network_growth.first_date
ORDER BY
    new_stations DESC                                        -- Network with most growth first
LIMIT 1;                                                     -- Return only the top network


-- Query 2b: Network with the most DC-fast stations opened in the last 12 months
-- --------------------------------------------------------------------------------

WITH network_growth AS (
    SELECT
        MAX(open_date) AS latest_date,
        MAX(open_date) - INTERVAL '12 months' AS first_date
    FROM
        ev_stations
    WHERE
        open_date IS NOT NULL
)

SELECT
    ev_stations.ev_network,                                  -- Network/operator name
    COUNT(station_id) AS new_stations,                       -- DC-fast stations opened in window
    network_growth.latest_date,
    network_growth.first_date
FROM
    ev_stations
CROSS JOIN
    network_growth
WHERE
    ev_stations.open_date BETWEEN network_growth.first_date AND network_growth.latest_date
    AND ev_stations.ev_dc_fast_count > 0                     -- Require at least one DC-fast port
GROUP BY
    ev_stations.ev_network,
    network_growth.latest_date,
    network_growth.first_date
ORDER BY
    new_stations DESC
LIMIT 1;


-- Query 3: States where >5 % of stations are free to use and the
--          networks that dominate those free stations
-- ---------------------------------------------------------------

WITH free_stations AS (
    -- Free stations per state
    SELECT
        state_abbrev,                                        -- State identifier
        COUNT(station_id) AS total_free_stations             -- All stations that are free in that state
    FROM ev_stations
    WHERE ev_pricing = 'Free'                                -- Filter to free stations only
    GROUP BY state_abbrev
),

state_totals AS (
    -- All stations per state
    SELECT
        state_abbrev,
        COUNT(station_id) AS total_stations
    FROM
        ev_stations
    GROUP BY
        state_abbrev
),

state_free_share AS (
    -- Percentage of stations that are free in each state
    SELECT
        free_stations.state_abbrev,
        free_stations.total_free_stations,
        state_totals.total_stations,
        ROUND(100 * free_stations.total_free_stations::numeric / state_totals.total_stations, 1) AS pct_free
    FROM
        free_stations
    JOIN
        state_totals ON free_stations.state_abbrev = state_totals.state_abbrev
),

dominating_states AS (
    -- Keep states where free share > 5 %
    SELECT
        state_abbrev,
        pct_free
    FROM state_free_share
    WHERE pct_free > 5                                       -- Threshold: focus where free >5 % of stations
),

free_networks AS (
    -- Free-station counts by network within dominating states
    SELECT
        ev_stations.state_abbrev,
        ev_stations.ev_network,
        COUNT(ev_stations.station_id) AS network_free_count
    FROM
        ev_stations 
    JOIN
        dominating_states USING (state_abbrev)
    WHERE
        ev_stations.ev_pricing = 'Free'
    GROUP BY
        ev_stations.state_abbrev,
        ev_stations.ev_network
    ORDER BY
        network_free_count DESC
),

network_free_share AS (
    -- Network share of free stations within the state
    SELECT
        free_networks.state_abbrev,
        free_networks.ev_network,
        free_networks.network_free_count,
        state_free_share.total_free_stations,
        ROUND(free_networks.network_free_count::numeric / state_free_share.total_free_stations * 100, 1) AS pct_of_free
    FROM
        free_networks
    JOIN
        state_free_share ON free_networks.state_abbrev = state_free_share.state_abbrev
)

-- Final output: dominant free-station network in every qualifying state
SELECT
    state_abbrev,                                           -- State code
    ev_network AS dominating_network,                       -- Network with most free sites
    network_free_count,                                     -- Number of free sites for that network
    total_free_stations,                                    -- All free sites in state
    pct_of_free AS pct_share_of_free                        -- Network's share of free sites (%)
FROM network_free_share
WHERE ev_network IS NOT NULL                                -- Exclude rows with missing network label
ORDER BY
    state_abbrev,                                           -- Alphabetical state order
    pct_share_of_free DESC;                                 -- For each state, network with highest share first



