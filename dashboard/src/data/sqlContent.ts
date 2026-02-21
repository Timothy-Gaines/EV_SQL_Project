export const SQL_CONTENT: Record<number, string> = {
  1: `-- Query 1: Annual count of new EV charging stations nationwide
SELECT 
    EXTRACT (YEAR FROM open_date) AS Year,
    COUNT(*) AS total_stations
FROM ev_stations
WHERE open_date IS NOT NULL
GROUP BY EXTRACT (YEAR FROM open_date)
ORDER BY Year DESC
LIMIT 100;

-- Query 2: State-level year-over-year station growth
WITH Yearly_Station_Count AS (
  SELECT 
      EXTRACT (YEAR FROM open_date) AS year,
      state_abbrev AS state,
      COUNT(*) AS stations_added
  FROM ev_stations
  WHERE open_date IS NOT NULL
  GROUP BY 1,2
), 
Yearly_state_diff AS (
  SELECT year, state, stations_added,
      stations_added - LAG(stations_added) OVER (
          PARTITION BY state ORDER BY year
      ) AS yoy_increase
  FROM Yearly_Station_Count
)
SELECT year, state, yoy_increase
FROM yearly_state_diff
WHERE yoy_increase IS NOT NULL
  AND year < EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY year DESC, yoy_increase DESC;

-- Query 3: Network growth since 2020 by charger type
SELECT 
    ev_network,
    SUM(CASE WHEN ev_dc_fast_count > 0 THEN 1 ELSE 0 END) AS dc_station,
    SUM(CASE WHEN ev_level2_evse_num > 0 THEN 1 ELSE 0 END) AS level_2_station,
    SUM(CASE WHEN ev_level1_evse_num > 0 THEN 1 ELSE 0 END) AS level_1_station,
    SUM(CASE WHEN ev_dc_fast_count > 0 OR ev_level2_evse_num > 0 
         OR ev_level1_evse_num > 0 THEN 1 ELSE 0 END) AS total_stations_added
FROM ev_stations
WHERE open_date IS NOT NULL
  AND EXTRACT (year FROM open_date) >= 2020
GROUP BY ev_network
ORDER BY total_stations_added DESC;`,

  2: `-- Query 1: Annual growth rate analysis (accelerating or slowing?)
WITH Yearly_Station_Count AS (
  SELECT EXTRACT(Year FROM open_date) AS year,
         COUNT(station_id) AS stations_opened
  FROM ev_stations
  WHERE open_date IS NOT NULL AND open_date < '2025-01-01'
  GROUP BY 1 ORDER BY 1 DESC
),
yoy AS (
  SELECT year, stations_opened,
    stations_opened - LAG(stations_opened) OVER (ORDER BY year) AS yoy_change,
    ROUND(100.0 * (stations_opened - LAG(stations_opened) OVER (ORDER BY year))
      / NULLIF(LAG(stations_opened) OVER (ORDER BY year), 0), 1) AS yoy_pct_change
  FROM Yearly_Station_Count ORDER BY year DESC
),
avg_growth AS (
  SELECT AVG(yoy_pct_change) AS avg_growth_rate FROM yoy WHERE year >= 2013
)
SELECT year::text AS label, stations_opened, yoy_change, yoy_pct_change FROM yoy
UNION ALL
SELECT 'Average since 2013', NULL, NULL, avg_growth_rate FROM avg_growth
ORDER BY label::text DESC;

-- Query 2: Top 3 states by station gain YoY
-- Query 3: Top 3 cities by station gain YoY
-- Query 4: Top network new sites by state
-- Query 5: Average station age and maintenance risk by state
SELECT state_abbrev,
  ROUND(AVG(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM open_date)), 1) AS avg_age,
  SUM(CASE WHEN EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM open_date) > 5
       THEN 1 ELSE 0 END) AS older_than_5_years
FROM ev_stations
WHERE open_date IS NOT NULL AND ev_dc_fast_count > 0
GROUP BY 1 ORDER BY avg_age DESC;`,

  3: `-- Query 1: DC-fast market leader by state
WITH stations_per_state AS (
  SELECT state_abbrev, COUNT(station_id) AS total_stations
  FROM ev_stations WHERE ev_dc_fast_count > 0 GROUP BY state_abbrev
),
network_total_per_state AS (
  SELECT state_abbrev, ev_network, COUNT(station_id) AS network_total
  FROM ev_stations WHERE ev_dc_fast_count > 0 GROUP BY state_abbrev, ev_network
),
state_network_share AS (
  SELECT nt.state_abbrev, nt.ev_network, nt.network_total, sps.total_stations,
    ROUND(100.0 * nt.network_total::numeric / sps.total_stations, 1) AS network_share
  FROM network_total_per_state nt
  JOIN stations_per_state sps ON nt.state_abbrev = sps.state_abbrev
),
ranked AS (
  SELECT state_abbrev, ev_network, ROUND(network_share,2) AS network_share,
    RANK() OVER (PARTITION BY state_abbrev ORDER BY network_share DESC) AS rank
  FROM state_network_share
)
SELECT state_abbrev, ev_network AS top_network, network_share AS market_share_pct
FROM ranked WHERE rank = 1 ORDER BY state_abbrev;

-- Query 2: Biggest builder (total stations, last 12 months)
-- Query 3: Biggest builder (DC-fast stations, last 12 months)
-- Query 4: Free-charging strongholds by state and network`,

  4: `-- Query 1: Statewide DC-fast vs Level-2 port split
WITH dc_fast_ports AS (
  SELECT state_abbrev, COALESCE(SUM(ev_dc_fast_count), 0) AS total_dc_fast_count
  FROM ev_stations GROUP BY state_abbrev
),
level_2_ports AS (
  SELECT state_abbrev, COALESCE(SUM(ev_level2_evse_num), 0) AS total_level_2_count
  FROM ev_stations GROUP BY state_abbrev
),
state_port_totals AS (
  SELECT dcp.state_abbrev, dcp.total_dc_fast_count, l2p.total_level_2_count,
    (dcp.total_dc_fast_count + l2p.total_level_2_count) AS total_ports
  FROM dc_fast_ports dcp JOIN level_2_ports l2p USING (state_abbrev)
)
SELECT state_abbrev, total_dc_fast_count, total_level_2_count,
  ROUND(100 * total_dc_fast_count::NUMERIC / total_ports) AS pct_dc_fast,
  ROUND(100 * total_level_2_count::NUMERIC / total_ports) AS pct_level2
FROM state_port_totals ORDER BY state_abbrev;

-- Query 2: States with ≥80% 24/7 station availability
-- Query 3: Leading DC-fast connector by US region since 2023`,

  5: `-- Query 1: Top/bottom 5 states by total ports per 100K residents
WITH ports_per_state AS (
  SELECT ev_stations.state_abbrev,
    SUM(COALESCE(ev_level1_evse_num,0) + COALESCE(ev_level2_evse_num,0)
      + COALESCE(ev_dc_fast_count,0)) AS total_ports,
    ROUND(SUM(COALESCE(ev_level1_evse_num,0) + COALESCE(ev_level2_evse_num,0)
      + COALESCE(ev_dc_fast_count,0))::numeric * 100000
      / state_population.popestimate2023, 2) AS ports_per_100k
  FROM ev_stations
  LEFT JOIN state_population ON ev_stations.state_abbrev = state_population.state_abbrev
  GROUP BY ev_stations.state_abbrev, state_population.popestimate2023
)
(SELECT 'TOP 5' AS Category, state_abbrev, total_ports, ports_per_100k
 FROM ports_per_state ORDER BY ports_per_100k DESC LIMIT 5)
UNION ALL
(SELECT 'BOTTOM 5', state_abbrev, total_ports, ports_per_100k
 FROM ports_per_state ORDER BY ports_per_100k LIMIT 5);

-- Query 2: DC-fast ports per 100K (top/bottom 5)
-- Query 3: Top 10 ZIP codes by DC-fast station count
-- Query 4: ZIP code station breakdown (DC-fast vs Level-2)
-- Query 5: Large cities (100K+ pop) with <5 stations`,
};
