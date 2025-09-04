export type RootStackParamList = {
    Welcome: undefined;
    SignUp: undefined;
    Period: { clientId: number };
    Revenue: { clientId: number };
    Abonnement: { clientId: number };
    Sections: { clientId : number };
    Dashboard: { clientId: number};
    SectionDetail: { sectionId: string, clientId: number };
    SubSectionDetail: { subSectionId: string, clientId: number }; 
}