# An SQL Analysis of US Electric Vehicle Charging Infrastructure

## Project Overview

**Dataset Source** – U.S. Department of Energy `alt_fuel_stations_(Jun 19 2025)_updated.csv`, augmented with `State_population.csv` and `City_population.csv`.

**Goal** – Use SQL to reveal trends in geographic distribution, infrastructure growth, technology availability, and network-provider dominance for U.S. EV charging stations.

**Key Question** – *What does the current landscape of EV charging infrastructure look like, and where are the biggest opportunities or gaps?*

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `ev_stations` | Master record of every charging site plus technical attributes |
| `state_population` | 2023 population estimates for every state & D.C. |
| `city_population` | 2024 population estimates for U.S. cities |

---

## 2. Analysis – Infrastructure Growth & Momentum

### 2.1  How many new charging stations were opened each year, and is the annual growth rate accelerating?

**Methodology & Rationale** – A CTE (`Yearly_Station_Count`) derives yearly totals. A second CTE uses `LAG()` to compute year-over-year (YoY) change and percentage growth. This keeps the logic compact while exposing long-term acceleration/slow-down patterns.

```sql
-- see `SQL Queries/2.Infrastructure_growth.sql` (first query)
```

**Query Results (preview)**
```text
label,stations_opened,yoy_change,yoy_pct_change
Average since 2013,,,32.7
2024,12718,-53,-0.4
2023,12771,1300,11.3
2022,11471,-4750,-29.3
2021,16221,9064,126.6
-- …remaining years omitted for brevity
```

**Results & Insights**
* Average YoY growth since **2013** sits at **≈ 32.7 %**.
* The **2021** boom (+9 064 sites, **+127 % YoY**) marked the single-largest expansion on record.
* Growth rebounded in **2023** (+11 %), but plateaued in **2024** (-0.4 %), hinting at a maturing build-out.

---

### 2.2  Which three states and three cities recorded the biggest station gains in the most recent calendar year?

**Methodology & Rationale** – Year-over-year counts per state/city were pivoted wide to subtract last year’s values, revealing absolute gains.

```sql
-- see `SQL Queries/2.Infrastructure_growth.sql` (parts A & B of second query)
```

**Query Results (preview)**
```text
-- States
state_abbrev,station_gain
MA,160
FL,141
TX,141

-- Cities
city_label,station_gain
"Cambridge, MA",67
"San Mateo, CA",56
"Atlanta, GA",43
```

**Results & Insights**
* **States:**
  * **Massachusetts** (+160)
  * **Florida** (+141)
  * **Texas** (+141)
* **Cities:**
  * **Cambridge, MA** (+67)
  * **San Mateo, CA** (+56)
  * **Atlanta, GA** (+43)

---

### 2.4  What is the average age of DC-fast stations in each state?

**Methodology & Rationale** – For maintenance risk, only DC-fast sites were considered. Average age and a count of sites older than five years were computed.

```sql
-- see `SQL Queries/2.Infrastructure_growth.sql` (fourth query)
```

**Query Results (preview)**
```text
state_abbrev,avg_age,older_than_5_years
DC,5.4,2
MD,4.3,75
VA,4.0,70
OK,4.0,26
CA,3.8,500
-- …truncated
```

**Results & Insights**
* **Oldest networks:** District of Columbia (5.4 yrs), Maryland (4.3 yrs).
* **California** has the **largest backlog** with **500** DC-fast stations already older than five years, followed by **Florida (98)** and **New York (82)**.

---

## 3. Analysis – Market & Network Landscape

### 3.1  For every state, which network operates the largest share of DC-fast stations?

**Methodology & Rationale** – State totals were joined to per-network counts, then a `RANK()` window isolated the #1 network in each state.

```sql
-- see `SQL Queries/3.Market_and_network_landscape.sql` (first query)
```

**Query Results (preview)**
```text
state_abbrev,top_network,market_share_pct
AK,Non-Networked,39.1
AL,ChargePoint Network,56.7
AZ,Tesla,30.6
CA,ChargePoint Network,25.7
CO,ChargePoint Network,51.3
-- …truncated
```

**Results & Insights**
* **ChargePoint Network** dominates, ranking #1 in **≈ 40 states** including California, Georgia, Colorado, Massachusetts and Washington.
* **Tesla** leads DC-fast share in nine states/territories (e.g., Arizona, Florida, Nevada, Virginia).
* Unique regional leaders include **OpConnect** (Hawaii), **ZEFNET** (Minnesota), **FCN** (Oklahoma) and **CHARGELAB** (Iowa).

---

### 3.2  Which network added the most new stations in the past 12 months?

**Methodology & Rationale** – A rolling 12-month window (max `open_date`) was applied before counting network additions.

```sql
-- see `SQL Queries/3.Market_and_network_landscape.sql` (query 2a)
```

**Query Results (preview)**
```text
ev_network,new_stations,latest_date,first_date
ChargePoint Network,7927,2025-06-19,2024-06-19
```

**Results & Insights**
* **ChargePoint Network** added **7 927** new stations between **Jun 2024 – Jun 2025**, far out-pacing every competitor.

---

### 3.3  In states where free stations make up >5 % of sites, which networks dominate?

**Methodology & Rationale** – States with ≥5 % free sites were flagged, then free-site counts were ranked per network.

```sql
-- see `SQL Queries/3.Market_and_network_landscape.sql` (third query)
```

**Query Results (preview)**
```text
state_abbrev,dominating_network,network_free_count,pct_share_of_free
CA,Tesla Destination,963,53.9
FL,Tesla Destination,459,59.5
OR,Tesla Destination,121,43.5
AK,Non-Networked,29,85.3
HI,Non-Networked,44,73.3
-- …truncated
```

**Results & Insights**
* **Tesla Destination** is the top provider of free charging in large markets such as **CA (54 %)**, **FL (60 %)** and **OR (44 %)**.
* Smaller states often rely on **non-networked** community chargers – e.g., Alaska (85 %) and Hawaii (73 %).

---

## 4. Analysis – Charger Technology & Accessibility

### 4.2  Which states report ≥80 % of stations open 24/7?

```sql
-- see `SQL Queries/4.Charger_Technology_and_accessibily.sql` (second query)
```

**Query Results (preview)**
```text
state_abbrev,pct_open_24
PR,94
NM,86
KS,85
MA,85
NE,85
CO,83
MO,83
NY,80
WA,80
```

**Results & Insights**
* **Puerto Rico leads (94 %)**; mainland stand-outs include **New Mexico (86 %)**, **Kansas/Massachusetts/Nebraska (85 %)**.
* Broad 24/7 access is increasingly common in high-traffic corridors (e.g., Colorado & Washington at ~80 %).

---

### 4.3  Among stations opened since 2023, which DC-fast connector dominates each U.S. region?

```sql
-- see `SQL Queries/4.Charger_Technology_and_accessibily.sql` (third query)
```

**Query Results**
```text
region,top_dc_fast_connector,total_dc_fast_ports
Midwest,Tesla/NACS,1495
Northeast,Tesla/NACS,2069
South,Tesla/NACS,4916
West,Tesla/NACS,6374
```

**Results & Insights**
* **Tesla/NACS** is the clear winner *everywhere*, topping the West (6 374 ports) and South (4 916) as well as the Midwest and Northeast.

---

## 5. Analysis – Geographic Coverage & Readiness

### 5.1  Which five states have the highest and lowest charging-port counts per 100 000 residents?

```sql
-- see `SQL Queries/5.Geographic_coverage_and_readiness.sql` (query 1a)
```

**Query Results (preview)**
```text
category,state_abbrev,ports_per_100k
TOP 5,VT,212.8
TOP 5,DC,207.8
TOP 5,CA,181.5
TOP 5,MA,145.8
TOP 5,CT,132.5
BOTTOM 5,PR,2.9
BOTTOM 5,LA,21.1
BOTTOM 5,MS,22.4
BOTTOM 5,AK,23.2
BOTTOM 5,KY,24.8
```

**Results & Insights**
* **Vermont** and **D.C.** boast >200 ports per 100 k residents; **California** follows at 181.
* Infrastructure remains sparse in **Puerto Rico (2.9)** and several southern states (Louisiana, Mississippi, Kentucky).

---

### 5.2  Which ten ZIP codes are DC-fast charging hotspots?

```sql
-- see `SQL Queries/5.Geographic_coverage_and_readiness.sql` (query 2a)
```

**Query Results (preview)**
```text
zip,total_stations
94025,33
90058,23
94538,22
93101,17
92037,15
-- …truncated
```

**Results & Insights**
* Silicon-Valley and L.A. areas dominate: **94025 (Menlo Park)**, **90058/90012 (Los Angeles)**, **94538 (Fremont)**.
* Outside California, hotspots include **34972 (Okeechobee FL)**, reflecting interstate-corridor builds.

---

### 5.3  Which large cities (>100 k pop.) are potential “charging deserts” (<5 sites)?

```sql
-- see `SQL Queries/5.Geographic_coverage_and_readiness.sql` (third query)
```

**Query Results**
```text
city,state_abbrev,total_stations
Paterson,NJ,1
Rio Rancho,NM,3
Deltona,FL,3
Edinburg,TX,3
Jurupa Valley,CA,4
```

**Results & Insights**
* **Paterson NJ** (160 k residents) has **only one** charging site.
* **Rio Rancho NM**, **Deltona FL**, **Edinburg TX** and **Jurupa Valley CA** each have ≤4 sites, highlighting priority markets for investment.

---

## Final Conclusion

The U.S. EV-charging landscape is expanding rapidly yet unevenly. While nationwide growth averaged **33 % YoY** since 2013 – peaking in 2021 – recent data show signs of plateauing. Market share is consolidating around **ChargePoint (deployment pace) and Tesla/NACS (technology standard)**, but sizeable geographic and maintenance gaps persist, especially in under-served cities and aging DC-fast fleets in California and the Northeast. Continued investment must balance raw expansion with upgrading older assets and filling regional deserts to ensure equitable, reliable access for all EV drivers.
