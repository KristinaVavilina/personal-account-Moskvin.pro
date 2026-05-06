/** Ответ API DailyReflection (camelCase). */
export interface ApiDailyReflectionResponse {
  id: string;
  userId: string;
  /** DateOnly, обычно "YYYY-MM-DD" */
  date: string;
  stressLevel: number;
  valueLevel: number;
}
