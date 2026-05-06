/**
 * UserResponse с бэкенда (Application.DTO.Users.User), camelCase из System.Text.Json.
 * `passwordHash` в UI не показывается, но может приходить в JSON — учитываем в моках как у API.
 */
export interface ApiUserResponse {
  id: string;
  email: string;
  fullName: string;
  photoUrl?: string | null;
  /** domain.enums.UserRole как число */
  role: number;
  positionName?: string | null;
  passwordHash?: string | null;
}
