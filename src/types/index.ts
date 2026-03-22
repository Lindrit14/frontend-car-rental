// --- Car ---
export type CarType = "ECONOMY" | "COMPACT" | "SUV" | "VAN" | "ELECTRIC" | "LUXURY";

export type Transmission = "AUTOMATIC" | "MANUAL";

export interface CreateCarRequest {
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  dailyRate: number;
  carType: CarType;
  location: string;
  seats: number;
  transmission: Transmission;
  largeLuggageSpace: number;
  smallLuggageSpace: number;
  imageUrl: string;
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
  seats?: number;
  transmission?: string;
  largeLuggageSpace?: number;
  smallLuggageSpace?: number;
  imageUrl?: string;
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
  seats: number;
  transmission: Transmission;
  largeLuggageSpace: number;
  smallLuggageSpace: number;
  imageUrl: string;
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

// --- Booking ---
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface CreateBookingRequest {
  carId: string;
  pickupDateTime: string;
  returnDateTime: string;
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  carId: string;
  carBrand: string;
  carModel: string;
  carLicensePlate: string;
  pickupDateTime: string;
  returnDateTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}
