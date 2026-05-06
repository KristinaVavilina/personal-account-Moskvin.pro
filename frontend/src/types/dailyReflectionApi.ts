/** Ответ API DailyReflection (camelCase). */
export interface ApiDailyReflectionResponse {
  id: string;
  userId: string;
  /** DateOnly, обычно "YYYY-MM-DD" */
  date: string;
  stressLevel: number;
  valueLevel: number;
}

/** Тело POST/PUT DailyReflection (как `DailyReflectionRequest` на бэке). */
export interface ApiDailyReflectionWriteRequest {
  userId: string;
  date: string;
  stressLevel: number;
  valueLevel: number;
}
