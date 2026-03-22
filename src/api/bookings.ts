import { apiFetch } from "./client";
import type { Booking, CreateBookingRequest } from "../types";

export function getAllBookings(): Promise<Booking[]> {
  return apiFetch<Booking[]>("/api/bookings");
}

export function createBooking(data: CreateBookingRequest): Promise<Booking> {
  return apiFetch<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getBookingById(id: string): Promise<Booking> {
  return apiFetch<Booking>(`/api/bookings/${id}`);
}

export function getMyBookings(): Promise<Booking[]> {
  return apiFetch<Booking[]>("/api/bookings/my");
}

export function confirmBooking(id: string): Promise<Booking> {
  return apiFetch<Booking>(`/api/bookings/${id}/confirm`, { method: "PATCH" });
}

export function completeBooking(id: string): Promise<Booking> {
  return apiFetch<Booking>(`/api/bookings/${id}/complete`, { method: "PATCH" });
}

export function cancelBooking(id: string): Promise<Booking> {
  return apiFetch<Booking>(`/api/bookings/${id}/cancel`, { method: "PATCH" });
}
