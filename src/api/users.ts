import { apiFetch } from "./client";
import type { User } from "../types";

export function getUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/user");
}

export function deleteUser(userId: string): Promise<void> {
  return apiFetch<void>(`/api/user/${userId}`, {
    method: "DELETE",
  });
}
