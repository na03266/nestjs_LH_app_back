export type DepartmentDto = {
    id: number;
    name: string;
    depth: number;
    isMb: boolean;
    children: DepartmentDto[];
};