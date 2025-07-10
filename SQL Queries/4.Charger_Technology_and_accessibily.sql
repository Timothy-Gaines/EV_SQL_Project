/*
1. Port-type mix by state: What share of each state’s total charging ports are DC-fast versus Level-2 today?

2. Around-the-clock availability: Which states report that at least 80 % of their stations are open “24 hours daily”?

3. Top DC-fast connector since 2023: Among stations opened in 2023 or later, which DC-fast connector (CCS, CHAdeMO, Tesla/NACS) dominates in each U.S. region?
*/



-- Query 1: Statewide split between DC-fast and Level-2 ports
-- ================================================================

WITH dc_fast_ports AS (
    -- Sum of DC-fast ports per state
    SELECT
        state_abbrev,
        COALESCE(SUM(ev_dc_fast_count), 0) AS total_dc_fast_count
    FROM
        ev_stations
    GROUP BY
        state_abbrev
),

level_2_ports AS (
    -- Sum of Level-2 ports per state
    SELECT
        state_abbrev,
        COALESCE(SUM(ev_level2_evse_num), 0) AS total_level_2_count
    FROM
        ev_stations
    GROUP BY
        state_abbrev
),

state_port_totals AS (
    -- Combine DC-fast and Level-2 counts for each state
    SELECT
        dcp.state_abbrev,
        dcp.total_dc_fast_count,
        l2p.total_level_2_count,
        (dcp.total_dc_fast_count + l2p.total_level_2_count) AS total_ports
    FROM
        dc_fast_ports dcp
    JOIN
        level_2_ports l2p USING (state_abbrev)
),

state_port_share AS (
    -- Calculate % share of each port type
    SELECT
        spt.state_abbrev,
        spt.total_dc_fast_count,
        spt.total_level_2_count,
        ROUND(100 * spt.total_dc_fast_count::NUMERIC / spt.total_ports) AS pct_dc_fast,
        ROUND(100 * spt.total_level_2_count::NUMERIC / spt.total_ports) AS pct_level2
    FROM
        state_port_totals spt
)

SELECT
    state_abbrev,
    total_dc_fast_count,
    total_level_2_count,
    pct_dc_fast,
    pct_level2
FROM 
    state_port_share
ORDER BY
    state_abbrev;


-- Query 2: States where ≥80 % of stations are open 24/7
-- ================================================================

WITH state_totals AS (
    -- Total stations per state
    SELECT
        state_abbrev,
        COUNT(station_id) AS total_stations
    FROM
        ev_stations
    GROUP BY
        state_abbrev
),

open_24 AS (
    -- Stations explicitly flagged "24 hours daily"
    SELECT
        state_abbrev,
        COUNT(station_id) AS total_open_24_stations
    FROM
        ev_stations
    WHERE
        access_days_time = '24 hours daily'          -- Exact value in dataset
    GROUP BY
        state_abbrev
),

state_24_share AS (
    -- Compute % of 24-hour stations per state
    SELECT
        st.state_abbrev,
        st.total_stations,
        o24.total_open_24_stations,
        ROUND(100 * o24.total_open_24_stations::NUMERIC / st.total_stations) AS pct_open_24
    FROM
        state_totals st
    JOIN
        open_24 o24 USING (state_abbrev)
),

states_80_24 AS (
    -- Keep only states with ≥80 % 24-hour coverage
    SELECT
        state_abbrev,
        pct_open_24,
        total_stations,
        total_open_24_stations
    FROM
        state_24_share
    WHERE
        pct_open_24 >= 80
)

SELECT
    state_abbrev,
    total_stations,
    total_open_24_stations,
    pct_open_24
FROM
    states_80_24
ORDER BY
    state_abbrev;


-- Query 3: Leading DC-fast connector type by U.S. region since 2023
-- ================================================================

WITH filtered_stations AS (
    -- 1) DC-fast stations opened on or after 2023-01-01
    SELECT
        station_id,
        state_abbrev,
        ev_dc_fast_count,
        ev_connector_types
    FROM
        ev_stations
    WHERE
        open_date >= '2023-01-01'
        AND ev_dc_fast_count > 0
),

station_regions AS (
    -- 2) Map states to Census-style regions
    SELECT
        fs.*,
        CASE
            WHEN fs.state_abbrev IN ('CT','ME','MA','NH','RI','VT','NJ','NY','PA') THEN 'Northeast'
            WHEN fs.state_abbrev IN ('IL','IN','MI','OH','WI','IA','KS','MN','MO','NE','ND','SD') THEN 'Midwest'
            WHEN fs.state_abbrev IN ('DE','FL','GA','MD','NC','SC','VA','DC','WV','AL','KY','MS','TN','AR','LA','OK','TX') THEN 'South'
            WHEN fs.state_abbrev IN ('AZ','CO','ID','MT','NV','NM','UT','WY','AK','CA','HI','OR','WA') THEN 'West'
            ELSE 'Other'
        END AS region
    FROM
        filtered_stations fs
),

region_connector_ports AS (
    -- 3) Sum DC-fast ports by connector type within each region
    SELECT
        region,
        SUM(CASE WHEN ev_connector_types ILIKE '%CCS%' THEN ev_dc_fast_count ELSE 0 END) AS ccs_ports,
        SUM(CASE WHEN ev_connector_types ILIKE '%CHADEMO%' THEN ev_dc_fast_count ELSE 0 END) AS chademo_ports,
        SUM(CASE WHEN ev_connector_types ILIKE '%TESLA%' OR ev_connector_types ILIKE '%NACS%' THEN ev_dc_fast_count ELSE 0 END) AS tesla_ports
    FROM
        station_regions
    GROUP BY
        region
),

connector_ports_long AS (
    -- 4) Unpivot wide table so each row = region + connector_type + ports
    SELECT region, 'CCS' AS connector_type, ccs_ports AS port_count FROM region_connector_ports
    UNION ALL
    SELECT region, 'CHAdeMO' AS connector_type, chademo_ports AS port_count FROM region_connector_ports
    UNION ALL
    SELECT region, 'Tesla/NACS' AS connector_type, tesla_ports AS port_count FROM region_connector_ports
),

ranked_connectors AS (
    -- 5) Rank connector types by ports within each region
    SELECT
        region,
        connector_type,
        port_count,
        ROW_NUMBER() OVER (PARTITION BY region ORDER BY port_count DESC) AS rn
    FROM
        connector_ports_long
)

SELECT
    region,
    connector_type AS top_dc_fast_connector,
    port_count     AS total_dc_fast_ports
FROM
    ranked_connectors
WHERE
    rn = 1                                 -- Only the highest-ranked connector per region
ORDER BY
    region;                                -- Regional alphabetical order

