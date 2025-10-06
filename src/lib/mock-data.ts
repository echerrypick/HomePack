export interface Address {
  id: string;
  line1: string;
  town: string;
  postcode: string;
}

export interface PropertyData {
  address: string;
  landRegistry: {
    titleNumber: string;
    tenure: string;
    pricePaid: string;
    date: string;
  };
  epc: {
    rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    potentialRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    validUntil: string;
    energyUse: number;
  };
  floodRisk: {
    riverAndSea: string;
    surfaceWater: string;
  };
  planningHistory: {
    application: string;
    decision: string;
    date: string;
  }[];
}

export const MOCK_ADDRESSES: Address[] = [
  { id: '1', line1: '10 Downing Street', town: 'London', postcode: 'SW1A 2AA' },
  { id: '2', line1: 'Buckingham Palace', town: 'London', postcode: 'SW1A 1AA' },
  { id: '3', line1: '221B Baker Street', town: 'London', postcode: 'NW1 6XE' },
];

export const MOCK_PROPERTY_DATA: Record<string, PropertyData> = {
  '1': {
    address: '10 Downing Street, London, SW1A 2AA',
    landRegistry: {
      titleNumber: 'NGL123456',
      tenure: 'Leasehold',
      pricePaid: 'Not available',
      date: '1735-01-01',
    },
    epc: {
      rating: 'E',
      potentialRating: 'C',
      validUntil: '2028-05-10',
      energyUse: 180,
    },
    floodRisk: {
      riverAndSea: 'Very Low',
      surfaceWater: 'Low',
    },
    planningHistory: [
      { application: 'Addition of security gate', decision: 'Approved', date: '1989-11-20' },
    ],
  },
  '2': {
    address: 'Buckingham Palace, London, SW1A 1AA',
    landRegistry: {
      titleNumber: 'NGL654321',
      tenure: 'Freehold (Crown Estate)',
      pricePaid: 'Not applicable',
      date: '1703-01-01',
    },
    epc: {
      rating: 'G',
      potentialRating: 'F',
      validUntil: '2025-01-01',
      energyUse: 450,
    },
    floodRisk: {
      riverAndSea: 'Very Low',
      surfaceWater: 'Very Low',
    },
    planningHistory: [
      { application: 'East Wing facade renovation', decision: 'Approved', date: '2017-03-15' },
      { application: 'Royal Mews extension', decision: 'Approved', date: '1999-08-22' },
    ],
  },
  '3': {
    address: '221B Baker Street, London, NW1 6XE',
    landRegistry: {
      titleNumber: 'NGL789012',
      tenure: 'Freehold',
      pricePaid: '£1,250,000',
      date: '2015-09-01',
    },
    epc: {
      rating: 'D',
      potentialRating: 'B',
      validUntil: '2030-11-22',
      energyUse: 120,
    },
    floodRisk: {
      riverAndSea: 'Very Low',
      surfaceWater: 'Medium',
    },
    planningHistory: [
      { application: 'Loft conversion', decision: 'Approved', date: '2018-02-10' },
    ],
  },
};
