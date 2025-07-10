/*
How many new charging stations were opened each year, and is the annual growth rate accelerating or slowing?

Which three states and three cities recorded the biggest absolute station gains in the most recent calendar year?

Which network added the most sites in the past 12 months, and where are those sites concentrated?

What is the average age of stations in each state, and how many sites are now older than five years? (targets upgrade/maintenance risk)

*/

/*
1.How many new charging stations were opened each year, and is the annual growth rate accelerating or slowing?
*/


-- CTE: Yearly_Station_Count
-- Purpose: Count stations opened per calendar year (pre-2025) to
--          measure yearly growth.


WITH Yearly_Station_Count AS (
-- Select year of opening and count stations that opened that year
SELECT
   EXTRACT (Year FROM open_date) AS year,          -- Calendar year of station opening
   COUNT (station_id) AS stations_opened           -- Total stations opened in that year
FROM
    ev_stations
-- Consider only rows with a valid open_date strictly before 2025-01-01
WHERE
    open_date IS NOT NULL
    AND open_date < '2025-01-01'                  -- Filter to completed years only
GROUP BY
    1                                             -- Group by derived year
ORDER BY
    1 DESC                                         -- Most recent years first (for readability)
),


-- CTE: yoy
-- Purpose: Calculate year-over-year (YoY) absolute and percentage
--          changes using window functions.


yoy AS (
SELECT
    year,
    stations_opened,
    -- Lag returns previous year's count so we can compute YoY change
    stations_opened - LAG(stations_opened) OVER (ORDER BY year) AS yoy_change,
    -- Percentage YoY change, NULLIF avoids divide-by-zero when previous year has 0
    ROUND(100.0 * (stations_opened - LAG(stations_opened) OVER (ORDER BY year)) / NULLIF(LAG(stations_opened) OVER (ORDER BY year), 0), 1) AS yoy_pct_change
FROM
    Yearly_Station_Count
ORDER BY 
    year DESC
),


-- CTE: avg_growth
-- Purpose: Long-term average YoY % change since 2013 to see if
--          growth is accelerating or slowing overall.


avg_growth AS (
SELECT
    AVG(yoy_pct_change) AS avg_growth_rate          -- Mean YoY % across years ≥2013
FROM
    yoy
WHERE
    year >= 2013                                   -- Ignore early years with sparse data
)


-- Final SELECT combines detailed YoY table with a summary row for
-- the multi-year average growth rate.

SELECT
    year::text AS label,          -- Cast to text so it can UNION with summary label
    stations_opened,              -- Yearly station count
    yoy_change,                   -- Absolute YoY change
    yoy_pct_change                -- % YoY change
FROM
    yoy

UNION ALL                       -- Append summary row

SELECT 
    'Average since 2013' AS label,
    NULL,                         -- Not applicable to summary
    NULL,
    avg_growth_rate               -- Average YoY % change
FROM
    avg_growth
ORDER BY
    label::text DESC;             -- Put summary row on top



/*
2.Which three states and three cities recorded the biggest absolute station gains in the most recent calendar year?
*/


-- Helper query: Identify latest year present in data (<2025)

SELECT
    MAX(EXTRACT (Year FROM open_date)) AS year
FROM
    ev_stations
WHERE 
    open_date < '2025-01-01';   -- Stand-alone check (returns latest full year)


-- Part A) Top 3 states by absolute station gain year-over-year
-- -------------------------------------------------------------

WITH per_state_year AS (
    -- Count stations opened per state & year
    SELECT
        state_abbrev,
        EXTRACT (Year FROM open_date) AS year,
        COUNT(*) AS station_count
    FROM
        ev_stations
    WHERE
        open_date IS NOT NULL
        AND open_date < '2025-01-01'
    GROUP BY
        1,2
),
years_bound AS (
    -- Latest year and previous year for comparison
    SELECT
        MAX(year) AS latest_year,
        MAX(year) - 1 AS prev_year
    FROM 
        per_state_year
),
wide AS (
    -- Transform to wide format so we can subtract counts
    SELECT 
        p.state_abbrev,
        MAX(CASE WHEN p.year = y.latest_year THEN p.station_count END) AS cnt_latest,
        MAX(CASE WHEN p.year = y.prev_year  THEN p.station_count END) AS cnt_prev
    FROM 
        per_state_year p
    CROSS JOIN years_bound y           -- Bring year bounds into context
    GROUP BY
        p.state_abbrev
)
SELECT 
    state_abbrev,
    cnt_latest - cnt_prev AS station_gain      -- Absolute gain YoY
FROM 
    wide
ORDER BY
    station_gain DESC                          -- Highest gains first
LIMIT 3;                                        -- Keep top 3 states



-- Part B) Top 3 cities by absolute station gain year-over-year
-- -------------------------------------------------------------

WITH per_city_year AS (
    -- Count stations opened per city & year
    SELECT
        state_abbrev,
        city,
        EXTRACT(year FROM open_date) AS year,
        COUNT(*) AS station_count
    FROM   
        ev_stations
    WHERE  
        open_date IS NOT NULL
        AND open_date < '2025-01-01'
    GROUP  BY
        1,2,3
),
year_bounds AS (
    -- Determine latest and previous years
    SELECT
        MAX(year) AS latest_year,
        MAX(year) - 1 AS prev_year
    FROM 
        per_city_year
),
wide AS (
    -- Pivot to wide so we can compute differences
    SELECT
        p.state_abbrev,
        p.city,
        MAX(CASE WHEN p.year = y.latest_year THEN p.station_count END) AS cnt_latest,
        MAX(CASE WHEN p.year = y.prev_year   THEN p.station_count END) AS cnt_prev
    FROM 
        per_city_year p
    CROSS JOIN year_bounds y
    GROUP BY 
        1,2
)
SELECT
    CONCAT(city, ', ', state_abbrev) AS city_label,            -- Readable city+state label
    COALESCE(cnt_latest, 0) - COALESCE(cnt_prev, 0) AS station_gain
FROM 
    wide
WHERE 
    COALESCE(cnt_latest, 0) - COALESCE(cnt_prev, 0) > 0        -- Keep only positive gains
ORDER BY 
    station_gain DESC
LIMIT 3;                                                       -- Top 3 cities


/*
3.Which network added the most sites in the past 12 months, and where are those sites concentrated?
*/


-- CTE: network_growth
-- Purpose: Define rolling 12-month window ending at latest open_date.
-- =============================
WITH network_growth AS (
    SELECT
        MAX(open_date) AS latest_date,                         -- Latest station opening date
        MAX(open_date) - INTERVAL '12 months' AS first_date    -- Start of 12-month window
    FROM
        ev_stations
    WHERE
        open_date IS NOT NULL
),


-- CTE: top_network
-- Purpose: Identify the single network with the most new sites in
--          that 12-month window.
-- =============================
top_network AS (
    SELECT
        ev_network,                                            -- Network/operator name
        COUNT(*) AS station_count,                             -- New sites count
        ng.latest_date,
        ng.first_date
    FROM
        ev_stations
    CROSS JOIN network_growth ng                               -- Bring window bounds in
    WHERE
        open_date BETWEEN ng.first_date AND ng.latest_date
    GROUP BY
        1,3,4
    ORDER BY
        station_count DESC
    LIMIT 1                                                    -- Keep the top network only
)

-- Final: State distribution of new sites for that network
-- =============================
SELECT 
    e.state_abbrev,
    COUNT(*) AS new_sites                                      -- New sites by state
FROM
    ev_stations e
JOIN
    top_network t
      ON e.ev_network = t.ev_network
      AND e.open_date BETWEEN t.first_date AND t.latest_date   -- Same 12-month window
GROUP BY
    1
ORDER BY
    new_sites DESC                                             -- Concentration of sites
LIMIT 5;                                                       -- Top 5 states


/*
4.What is the average age of stations in each state, and how many sites are now older than five years? (targets upgrade/maintenance risk)
*/

-- No CTEs needed; direct aggregation by state
SELECT
    state_abbrev,
    -- Average age in years, rounded to one decimal
    ROUND(AVG(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM open_date)), 1) AS avg_age,
    -- Count of stations older than 5 years ( >5 full calendar years )
    SUM(
        CASE WHEN EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM open_date) > 5
             THEN 1 ELSE 0 END) AS older_than_5_years
FROM
    ev_stations
WHERE
    open_date IS NOT NULL                 -- Exclude stations without open_date
    AND ev_dc_fast_count > 0              -- Focus on sites with DC-fast hardware (higher maintenance risk)
GROUP BY
    1
ORDER BY
    avg_age DESC;                         -- States with oldest networks first
