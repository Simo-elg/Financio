export interface Transaction {
    id: number;
    sectionId: number;
    type: 'ADD' | 'WITHDRAW' ;
    amount: number;
    date: string;
    note?: string;
}