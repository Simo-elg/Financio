import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, View, StyleSheet, Text } from 'react-native'
import * as Progress from 'react-native-progress'
import { sectionService } from '../services/sectionService'

type ProgressCircleProps = {
  size?: number         // diamètre du cercle
  thickness?: number    // épaisseur de la barre
}

export default function ProgressCircle({
  size = 120,
  thickness = 8,
}: ProgressCircleProps) {
  const [currentTotalAmount, setCurrentTotalAmount] = useState<number>(0)

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          const amountNum = await sectionService.getDebitAmount();
          if (isActive) {
            setCurrentTotalAmount(amountNum);
          }
        } catch (err) {
          console.error('Erreur getDebitAmount:', err);
        }
      })();

      // cleanup à la sortie de l’écran
      return () => {
        isActive = false;
      };
    }, [])
  );

  const baseAmount = currentTotalAmount;
  const progress = baseAmount > 0 ? Math.min(currentTotalAmount / baseAmount, 1) : 0
  const barColor = progress <= 0.5 ? 'red' : 'green'

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Progress.Circle
          size={size}
          progress={progress}
          thickness={thickness}
          unfilledColor="#eee"
          color={barColor}
          borderWidth={0}
        />
        {/* overlay du montant au centre */}
        <View style={styles.centered}>
          <Text style={styles.amountText}>{currentTotalAmount}</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
})
