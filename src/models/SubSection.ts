export interface SubSection {
    id: number;
    name: string;
    sectionId: number;
    isCore: 0 | 1;
    monthlyBudget: number;
    currentBalance: number;  
}