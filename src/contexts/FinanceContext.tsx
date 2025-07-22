// src/contexts/FinanceContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Section } from '../models/Section';
import { sectionService } from '../services/sectionService';

// 1. Définition du type pour le contexte
interface FinanceContextType {
  sections: Section[];
  refreshSections: () => Promise<void>;
}

// 2. Création du contexte avec valeurs par défaut
export const FinanceContext = createContext<FinanceContextType>({
  sections: [],
  refreshSections: async () => {},
});

// 3. Provider pour envelopper l'application
export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<Section[]>([]);

  // Fonction pour recharger les sections depuis la BDD
  const refreshSections = async () => {
    try {
      const data = await sectionService.getAll();
      setSections(data);
    } catch (err) {
      console.error('Erreur chargement sections :', err);
    }
  };

  // Au montage du provider, on charge les sections
  useEffect(() => {
    refreshSections();
  }, []);

  return (
    <FinanceContext.Provider value={{ sections, refreshSections }}>
      {children}
    </FinanceContext.Provider>
  );
};
