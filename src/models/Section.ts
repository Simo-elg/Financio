export interface Section {
    id: number;
    clientId: number;
    name: string;
    isCore: 0 | 1;
    monthlyBudget: number;
    currentBalance: number;
    paymentD: string;
}