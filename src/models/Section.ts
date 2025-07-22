export interface Section {
    id: number;
    name: string;
    isCore: 0 | 1;
    monthlyBudget: number;
    currentBalance: number;
}