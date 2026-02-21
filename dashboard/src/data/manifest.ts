import type { SQLModule } from '../types/data';

export const SQL_MODULES: SQLModule[] = [
  {
    id: 1,
    title: 'Infrastructure Growth & Market Momentum',
    subtitle: 'SQL 1',
    description:
      'Tracks how many EV stations have been added each year, which states saw the largest annual increases, and which charging networks have grown fastest since 2020.',
    questions: [
      'How many EV charging stations have been added each year?',
      'Which states experienced the largest annual increases in station numbers?',
      'Which charging networks have grown the fastest since 2020?',
    ],
    csvFiles: [
      '1.Infrastructure_Growth_&_market_Momentum_q1.csv',
      '1.Infrastructure_Growth_&_market_Momentum_q2.csv',
      '1.Infrastructure_Growth_&_market_Momentum_q3.csv',
    ],
  },
  {
    id: 2,
    title: 'Infrastructure Growth',
    subtitle: 'SQL 2',
    description:
      'Deep dive into annual growth rates, top-gaining states and cities, leading network expansion, and station age/maintenance risk by state.',
    questions: [
      'Is the annual growth rate accelerating or slowing?',
      'Which states and cities recorded the biggest station gains last year?',
      'Which network added the most sites in the past 12 months?',
      'What is the average station age by state, and how many are older than 5 years?',
    ],
    csvFiles: [
      '2.Infrastructure_growth_q1.csv',
      '2.Infrastructure_growth_q3.csv',
      '2.Infrastructure_growth_q4.csv',
      '2.Infrastructure_growth_q5.csv',
      '2.Infrastructure_growth_q6.csv',
    ],
  },
  {
    id: 3,
    title: 'Market & Network Landscape',
    subtitle: 'SQL 3',
    description:
      'Reveals the dominant DC-fast network per state, the biggest builder in the last year, and which networks provide the most free charging in qualifying states.',
    questions: [
      'Which network operates the largest DC-fast share in each state?',
      'Which network opened the most stations in the past 12 months?',
      'In states where free stations exceed 5%, which networks dominate free charging?',
    ],
    csvFiles: [
      '3.Market_and_network_landscape_q1.csv',
      '3.Market_and_network_landscape_q2.csv',
      '3.Market_and_network_landscape_q3.csv',
      '3.Market_and_network_landscape_q4.csv',
    ],
  },
  {
    id: 4,
    title: 'Charger Technology & Accessibility',
    subtitle: 'SQL 4',
    description:
      'Examines the mix of DC-fast versus Level-2 ports per state, 24/7 availability metrics, and which DC-fast connector dominates each US region since 2023.',
    questions: [
      'What share of each state\'s ports are DC-fast vs Level-2?',
      'Which states have ≥80% of stations open 24 hours daily?',
      'Which DC-fast connector dominates each US region since 2023?',
    ],
    csvFiles: [
      '4.Charger_Technology_and_accessibily_q1.csv',
      '4.Charger_Technology_and_accessibily_q2.csv',
      '4.Charger_Technology_and_accessibily_q3.csv',
    ],
  },
  {
    id: 5,
    title: 'Geographic Coverage & Readiness',
    subtitle: 'SQL 5',
    description:
      'Identifies the most and least served states per capita, DC-fast ZIP-code hotspots, and large cities with significant charging gaps.',
    questions: [
      'Which states have the highest/lowest ports per 100K residents?',
      'Which ZIP codes are DC-fast hotspots?',
      'Which large cities (100K+ pop) have fewer than 5 charging stations?',
    ],
    csvFiles: [
      '5.Geographic_coverage_and_readiness_q1.csv',
      '5.Geographic_coverage_and_readiness_q2.csv',
      '5.Geographic_coverage_and_readiness_q3.csv',
      '5.Geographic_coverage_and_readiness_q4.csv',
      '5.Geographic_coverage_and_readiness_q5.csv',
      '5.Geographic_coverage_and_readiness_q6.csv',
      '5.Geographic_coverage_and_readiness_q7.csv',
    ],
  },
];

export function getCSVPath(filename: string): string {
  return `/data/results/${filename}`;
}

export function getStationsPath(): string {
  return '/data/stations.csv';
}
