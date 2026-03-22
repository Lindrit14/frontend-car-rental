// --- Car ---
export type CarType = "ECONOMY" | "COMPACT" | "MIDSIZE" | "FULLSIZE" | "SUV" | "LUXURY";

export interface CreateCarRequest {
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  dailyRate: number;
  carType: CarType;
  location: string;
}

export interface UpdateCarRequest {
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  carType?: string;
  dailyRate?: number;
  location?: string;
  available?: boolean;
}

// The GET endpoint returns ["string"] per the spec — likely CarResponse objects.
// We'll type it based on what CreateCar + id + available would look like.
export interface Car {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  dailyRate: number;
  carType: CarType;
  location: string;
  available: boolean;
}

// --- Auth ---
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

// --- User ---
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
