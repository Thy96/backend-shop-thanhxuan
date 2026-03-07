import { API_URL } from "@/utils/helps";
import { ChangePasswordPayload, ChangePasswordResponse } from "../types";

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const res = await fetch(`${API_URL}/api/admin/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 🔥 để gửi cookie
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    // backend trả { errors: {...} }
    throw data;
  }

  return data;
}