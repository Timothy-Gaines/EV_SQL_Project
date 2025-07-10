/*
1.How many EV charging stations have been added each year?
2.Which states experienced the largest annual increases in station numbers?
3.Which charging networks have grown the fastest since 2020?
*/



-- Query 1: Annual count of new EV charging stations nationwide


-- Extract opening year and count stations opened in that year
SELECT 
    EXTRACT (YEAR FROM open_date) AS Year,            -- Calendar year station opened
    COUNT(*) AS total_stations                        -- Total number opened that year
FROM 
    ev_stations
WHERE 
    open_date IS NOT NULL                             -- Exclude rows without an opening date
GROUP BY 
    EXTRACT (YEAR FROM open_date)                     -- Aggregate by year of opening
ORDER BY 
    Year DESC                                         -- Most recent years first
LIMIT 100;                                            -- Safety cap (dataset unlikely to exceed)



-- Query 2: State-level year-over-year station growth


-- CTE Yearly_Station_Count: number of stations added per state/year
WITH Yearly_Station_Count AS (
SELECT 
    EXTRACT (YEAR FROM open_date) AS year,            -- Year of opening
    state_abbrev AS state,                           -- Two-letter state code
    COUNT(*) AS stations_added                       -- Stations opened that year in the state
FROM 
    ev_stations
WHERE
    open_date IS NOT NULL
GROUP BY
    1,2                                              -- Group by year and state
), 

-- CTE Yearly_state_diff: compute YoY increase using window function
Yearly_state_diff AS (
SELECT
    year,
    state,
    stations_added,
    stations_added - LAG(stations_added) OVER (
        PARTITION BY state ORDER BY year              -- Compare to previous year within same state
    ) AS yoy_increase                                 -- Absolute YoY change
FROM 
    Yearly_Station_Count
)

-- Final SELECT: list YoY increase per state per year (exclude NULL and current year)
SELECT  
    year,   
    state,
    yoy_increase
FROM 
    yearly_state_diff
WHERE
    yoy_increase IS NOT NULL                          -- Keep rows where previous year exists
    AND year < EXTRACT(YEAR FROM CURRENT_DATE)        -- Exclude partial current year data
ORDER BY
    year DESC,
    yoy_increase DESC;                                -- Highlight biggest jumps first



-- Query 3: Network growth since 2020 by charger type


SELECT 
    ev_network,                                       -- Charging network/operator
    -- Count of stations featuring each charger level (boolean 0/1 per row summed)
    SUM(CASE WHEN ev_dc_fast_count  > 0 THEN 1 ELSE 0 END) AS dc_station,
    SUM(CASE WHEN ev_level2_evse_num > 0 THEN 1 ELSE 0 END) AS level_2_station,
    SUM(CASE WHEN ev_level1_evse_num > 0 THEN 1 ELSE 0 END) AS level_1_station,
    -- Total sites (at least one of the charger types present)
    SUM(
        CASE WHEN ev_dc_fast_count  > 0 OR
                  ev_level2_evse_num > 0 OR
                  ev_level1_evse_num > 0 THEN 1 ELSE 0 END
    ) AS total_stations_added
FROM 
    ev_stations
WHERE
    open_date IS NOT NULL
    AND EXTRACT (year FROM open_date) >= 2020         -- Focus on recent growth period
GROUP BY
    ev_network
ORDER BY
    total_stations_added DESC,                        -- Rank by total growth first
    dc_station DESC,                                  -- Tie-break on DC-fast, then Level-2, etc.
    level_2_station DESC,
    level_1_station DESC;








