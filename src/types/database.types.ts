export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      flights: {
        Row: {
          id: string;
          flight_number: string;
          airline: string;
          origin: string;
          destination: string;
          departure_time: string;
          arrival_time: string;
          duration: number;
          price: number;
          available_seats: number;
          cabin_class: "Economy" | "Premium Economy" | "Business" | "First";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          flight_number: string;
          airline: string;
          origin: string;
          destination: string;
          departure_time: string;
          arrival_time: string;
          duration: number;
          price: number;
          available_seats: number;
          cabin_class: "Economy" | "Premium Economy" | "Business" | "First";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          flight_number?: string;
          airline?: string;
          origin?: string;
          destination?: string;
          departure_time?: string;
          arrival_time?: string;
          duration?: number;
          price?: number;
          available_seats?: number;
          cabin_class?: "Economy" | "Premium Economy" | "Business" | "First";
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone_number: string | null;
          date_of_birth: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone_number?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone_number?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          flight_id: string;
          booking_date: string;
          passenger_count: Json;
          status: "confirmed" | "cancelled" | "pending";
          total_price: number;
          passengers: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flight_id: string;
          booking_date: string;
          passenger_count: Json;
          status?: "confirmed" | "cancelled" | "pending";
          total_price: number;
          passengers: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flight_id?: string;
          booking_date?: string;
          passenger_count?: Json;
          status?: "confirmed" | "cancelled" | "pending";
          total_price?: number;
          passengers?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type Flight = Database['public']['Tables']['flights']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
// };

// type PayPalDetails = {
//   email: string;
// };
