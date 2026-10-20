import officialRegions from '@/data/geographie/regions.json';
import { activeDepartments, findCompanies } from './network';
export function regionalNetworks() {
  return officialRegions.flatMap((region) => {
    const departments = activeDepartments().filter((d) => d.codeRegion === region.code);
    return departments.length
      ? [
          {
            ...region,
            departments: departments.map((department) => ({
              ...department,
              companies: findCompanies({ departmentCode: department.code }),
            })),
          },
        ]
      : [];
  });
}
