import { apiFetch } from "./client";
import type { Car, CreateCarRequest, UpdateCarRequest } from "../types";

export function getCars(): Promise<Car[]> {
  return apiFetch<Car[]>("/api/car");
}

export function searchCars(pickupDateTime: string, returnDateTime: string, location?: string): Promise<Car[]> {
  const params = new URLSearchParams({ pickupDateTime, returnDateTime });
  if (location) params.set("location", location);
  return apiFetch<Car[]>(`/api/car/search?${params}`);
}

export function getAllCars(): Promise<Car[]> {
  return apiFetch<Car[]>("/api/car/all");
}

export function createCar(data: CreateCarRequest): Promise<string> {
  return apiFetch<string>("/api/car", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCar(carId: string, data: UpdateCarRequest): Promise<string> {
  return apiFetch<string>(`/api/car/${carId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCar(carId: string): Promise<void> {
  return apiFetch<void>(`/api/car/${carId}`, {
    method: "DELETE",
  });
}
