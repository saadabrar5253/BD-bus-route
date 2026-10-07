export type VerificationStatus = 'Verified' | 'Needs Verification' | 'Community Submitted';

export interface StopPoint {
  stop_id: string;
  name: string;
  name_bn?: string;
  lat: number;
  lng: number;
  order: number;
  is_major?: boolean;
}

export interface BusRoute {
  bus_id: string;
  bus_name: string;
  bus_name_bn?: string;
  route_number: string;
  operator: string;
  city: string;
  division: string;
  start_point: string;
  end_point: string;
  direction: 'Both Ways' | 'Up' | 'Down';
  major_stops: string[];
  all_stops: StopPoint[];
  route_geometry: [number, number][]; // [lat, lng] array
  classification: 'city' | 'intercity' | 'suburban';
  operating_area: string;
  service_status: 'Active' | 'Irregular' | 'Suspended';
  last_verified: string;
  source: string;
  verification_status: VerificationStatus;
  notes?: string;
}

export interface BusStop {
  stop_id: string;
  stop_name: string;
  stop_name_bn: string;
  aliases: string[];
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  thana: string;
  served_routes: string[]; // route numbers or names
  source: string;
  verification_status: VerificationStatus;
  last_verified: string;
  description?: string;
}

export type PlaceCategory = 
  | 'emergency'
  | 'hospital'
  | 'police'
  | 'fire'
  | 'ambulance'
  | 'pharmacy'
  | 'restaurant'
  | 'hotel'
  | 'tourist'
  | 'market'
  | 'bank'
  | 'transport'
  | 'blood_bank';

export interface Place {
  place_id: string;
  name: string;
  name_bn: string;
  category: PlaceCategory;
  subcategory: string;
  latitude: number;
  longitude: number;
  address: string;
  division: string;
  district: string;
  upazila?: string;
  thana: string;
  phone?: string;
  emergency_phone?: string;
  website?: string;
  opening_hours?: string;
  rating?: number;
  price_level?: string;
  description?: string;
  source: string;
  verification_status: VerificationStatus;
  last_verified: string;
  google_maps_url: string;
  entry_fee?: string;
  open_24h?: boolean;
  is_government?: boolean;
}

export interface EmergencyHotline {
  id: string;
  name: string;
  name_bn: string;
  number: string;
  category: 'National Emergency' | 'Police' | 'Fire Service' | 'Ambulance' | 'Health' | 'Disaster' | 'Women & Child' | 'Coast Guard';
  description: string;
  is_24_7: boolean;
  is_toll_free: boolean;
  source: string;
  verification_status: VerificationStatus;
}

export interface DirectJourneyOption {
  type: 'direct';
  bus: BusRoute;
  fromStop: StopPoint;
  toStop: StopPoint;
  stopsCount: number;
  intermediateStops: StopPoint[];
  walkToStartMeters?: number;
}

export interface TransferJourneyOption {
  type: 'transfer';
  firstBus: BusRoute;
  firstFromStop: StopPoint;
  firstTransferStop: StopPoint;
  firstIntermediateStops: StopPoint[];
  
  secondBus: BusRoute;
  secondTransferStop: StopPoint;
  secondToStop: StopPoint;
  secondIntermediateStops: StopPoint[];

  transferPointName: string;
  transferLat: number;
  transferLng: number;
}

export interface UserReport {
  id: string;
  report_type: 'wrong_route' | 'wrong_number' | 'wrong_stop' | 'wrong_phone' | 'wrong_location' | 'permanently_closed' | 'wrong_hours' | 'duplicate' | 'other';
  target_id: string;
  target_name: string;
  target_type: 'bus' | 'stop' | 'place';
  details: string;
  reporter_name?: string;
  reporter_contact?: string;
  created_at: string;
  status: 'Pending Review' | 'Verified & Fixed' | 'Dismissed';
}
