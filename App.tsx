// App.tsx
import React, { useEffect, useState } from 'react';
import { initDB } from './src/services/db';
import { SafeAreaView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import "./global.css";

export default function App() {

  const [dbReady, setDbReady] = useState(false);

  // 1️⃣ au démarrage, on crée la table et on insère les sections de base
  useEffect(() => {
    (async () => {
      try {
        await initDB();
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
  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}


const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});