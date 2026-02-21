export interface SQL1Q1Row {
  year: number;
  total_stations: number;
}

export interface SQL1Q2Row {
  year: number;
  state: string;
  yoy_increase: number;
}

export interface SQL1Q3Row {
  ev_network: string;
  dc_station: number;
  level_2_station: number;
  level_1_station: number;
  total_stations_added: number;
}

export interface SQL2Q1Row {
  label: string;
  stations_opened: number | null;
  yoy_change: number | null;
  yoy_pct_change: number | null;
}

export interface SQL2Q3Row {
  state_abbrev: string;
  station_gain: number;
}

export interface SQL2Q4Row {
  city_label: string;
  station_gain: number;
}

export interface SQL2Q5Row {
  state_abbrev: string;
  new_sites: number;
}

export interface SQL2Q6Row {
  state_abbrev: string;
  avg_age: number;
  older_than_5_years: number;
}

export interface SQL3Q1Row {
  state_abbrev: string;
  top_network: string;
  market_share_pct: number;
}

export interface SQL3Q2Row {
  ev_network: string;
  new_stations: number;
  latest_date: string;
  first_date: string;
}

export interface SQL3Q4Row {
  state_abbrev: string;
  dominating_network: string;
  network_free_count: number;
  total_free_stations: number;
  pct_share_of_free: number;
}

export interface SQL4Q1Row {
  state_abbrev: string;
  total_dc_fast_count: number;
  total_level_2_count: number;
  pct_dc_fast: number;
  pct_level2: number;
}

export interface SQL4Q2Row {
  state_abbrev: string;
  total_stations: number;
  total_open_24_stations: number;
  pct_open_24: number;
}

export interface SQL4Q3Row {
  region: string;
  top_dc_fast_connector: string;
  total_dc_fast_ports: number;
}

export interface SQL5Q1Row {
  category: string;
  state_abbrev: string;
  total_ports: number;
  ports_per_100k: number;
}

export interface SQL5Q2Row {
  category: string;
  state_abbrev: string;
  dc_fast_ports_per_100k: number;
}

export interface SQL5Q3Row {
  zip: string;
  total_stations: number;
}

export interface SQL5Q4Row {
  zip: string;
  total_stations: number;
  total_dc_fast_stations: number;
  total_level2_stations: number;
  dc_fast_station_percentage: number;
}

export interface SQL5Q5Row {
  city: string;
  state_abbrev: string;
  pop2024: number;
  total_stations: number;
}

export interface SQL5Q6Row {
  state_abbrev: string;
  total_ports: number;
  ports_per_100k: number;
}

export interface SQL5Q7Row {
  state_abbrev: string;
  dc_fast_ports_per_100k: number;
}

export interface StationRow {
  station_name: string;
  city: string;
  state_abbrev: string;
  zip: string;
  ev_network: string;
  ev_level1_evse_num: number;
  ev_level2_evse_num: number;
  ev_dc_fast_count: number;
  latitude: number;
  longitude: number;
  ev_connector_types: string;
  facility_type: string;
  open_date: string;
}

export interface SQLModule {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  questions: string[];
  csvFiles: string[];
}
