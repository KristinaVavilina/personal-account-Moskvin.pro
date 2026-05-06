/** Разбор ФИО в порядке «Фамилия Имя Отчество» (как в типичном `fullName` с бэка). */
export function splitFullNameRu(fullName: string): {
  lastName: string;
  firstName: string;
  patronymic: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    return {
      lastName: parts[0] ?? '',
      firstName: parts[1] ?? '',
      patronymic: parts.slice(2).join(' '),
    };
  }
  if (parts.length === 2) {
    return { lastName: parts[0] ?? '', firstName: parts[1] ?? '', patronymic: '' };
  }
  if (parts.length === 1) {
    return { lastName: '', firstName: parts[0] ?? '', patronymic: '' };
  }
  return { lastName: '', firstName: '', patronymic: '' };
}
