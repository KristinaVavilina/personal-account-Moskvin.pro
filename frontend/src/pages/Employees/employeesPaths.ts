import { ROUTE } from '../../constants';

export function employeeStatisticsPath(userId: string): string {
  return `${ROUTE.EMPLOYEES}/${encodeURIComponent(userId)}`;
}
