export interface ShippingData {
  voyage_number: string;
  departure_date: string;
  arrival_date: string;
  season: string;
  description: string | null;
  is_current: boolean;
}
