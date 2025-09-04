// ExportDbButton.tsx
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Button, Alert } from 'react-native';

export default function ExportDbButton() {
  const handleExport = async () => {
    try {
      // (Optionnel, mais conseillé) fusionner le WAL pour un fichier cohérent
      const db = await SQLite.openDatabaseAsync('doneWithIt.db');
      await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');

      const src = FileSystem.documentDirectory + 'SQLite/doneWithIt.db';
      const tmp = FileSystem.cacheDirectory + 'doneWithIt.db';

      // Copie la DB vers un endroit lisible
      await FileSystem.copyAsync({ from: src, to: tmp });

      if (Platform.OS === 'android') {
        // Proposer un dossier (ex. Download) via le SAF
        const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (perm.granted) {
          const base64 = await FileSystem.readAsStringAsync(tmp, { encoding: FileSystem.EncodingType.Base64 });
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            perm.directoryUri, 'doneWithIt.db', 'application/octet-stream'
          );
          await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
          Alert.alert('Export', 'Base exportée 👍');
          return;
        }
      }
      // Sinon feuille de partage (AirDrop, Fichiers, etc.)
      await Sharing.shareAsync(tmp);
    } catch (e) {
      Alert.alert('Export', 'Erreur: ' + String(e));
    }
  };

  return <Button title="Exporter la base SQLite" onPress={handleExport} />;
}
