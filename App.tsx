// App.tsx
import React, { useEffect, useState } from 'react';
import { initDB, seedDefaultSections } from './src/services/db';
import { SafeAreaView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {

  const [dbReady, setDbReady] = useState(false);

  // 1️⃣ au démarrage, on crée la table et on insère les sections de base
  useEffect(() => {
    (async () => {
      try {
        await initDB();
        await seedDefaultSections();
        setDbReady(true);
      } catch (err) {
        console.error('Erreur init BDD', err);
        // éventuellement afficher un message ou un écran d’erreur  
      }
    })();
  }, []);

 if (!dbReady) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text>Initialisation de la base de données...</Text>
      </SafeAreaView>
    );
  }

  // 3️⃣ Une fois prêt, on lance la navigation
  return <AppNavigator />;
}


const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});