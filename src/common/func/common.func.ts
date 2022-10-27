import { AscendingEnum } from 'sgnm-neo4j/dist/constant/pagination.enum';

export const fieldSorter =
  (fields: string[], orderBy: AscendingEnum, locale: string) => (a, b) =>
    fields
      .map((o) => {
        if (orderBy === AscendingEnum.ASCENDING) {
          return a[o].localeCompare(b[o], locale);
        } else {
          return b[o].localeCompare(a[o], locale);
        }
      })
      .reduce((p, n) => (p ? p : n), 0);
