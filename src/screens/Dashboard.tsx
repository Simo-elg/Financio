import React, { useEffect, useState, useRef } from "react";
import { Text, FlatList, TouchableOpacity, View, StyleSheet, Pressable, Animated, Easing, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Section } from "../models/Section";
import { sectionService } from "../services/sectionService";
import { useFocusEffect } from "@react-navigation/native";
import NewSection from "./NewSection"
import { BlurView } from 'expo-blur';
import ProgressBar from "../components/ProgressBar";    
import PlusButt from "../components/PlusButt";
import { SafeAreaView } from 'react-native-safe-area-context';


type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function Dashboard({ navigation, route }: Props) {

    const { clientId } = route.params;

    const [currentTotalAmount, setCurrentTotalAmount] = useState<number>(0)

    const [sections, setSections] = useState<Section[]>([])

    const [isOpen, setIsOpen] = useState<Boolean>(false);

    const blurAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const totalBalance = await sectionService.getDebitAmount(clientId);
            setCurrentTotalAmount(totalBalance);
        })();
    }, [sections]);
    
    useEffect(() => {
        Animated.timing(blurAnim, {
            toValue: isOpen ? 1 : 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [isOpen]);

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            (async () => {
            const data = await sectionService.getAll(clientId);
            if (isActive) setSections(data);
            })();
            return () => { isActive = false; };
        }, [])
    );

    const createSection = async (name: string, isCore:0 | 1, monthlyBudgetText: string) => {
    
            const newSectionmonthlyBudgetNum = parseFloat(monthlyBudgetText);
    
            if (!name || newSectionmonthlyBudgetNum <= 0) {
                Alert.alert("Erreur", "Veuillez remplir tous les champs correctement.");
                return;
            } 
            
            const netNum = await sectionService.getDebitAmount(clientId);

            let totalBudget = 0; 
    
            for (const sec of sections) {
                totalBudget += sec.monthlyBudget || 0;
            }
    
            if (totalBudget + newSectionmonthlyBudgetNum > netNum) {
                Alert.alert(
                    "Erreur",
                    "Le budget de la nouvelle section dépasse le montant net disponible !" 
                );
                console.error("Le budget de la nouvelle section dépasse le montant net disponible qui est de :", netNum)
                return;
            }
    
            if (newSectionmonthlyBudgetNum > netNum) {
                Alert.alert(
                    "Erreur",
                    "Le budget de la nouvelle section seul dépasse le montant net disponible."
                );
                return;
            }
    
            try {
                const created = await sectionService.create({
                    clientId: clientId,
                    name: name,
                    isCore: 0,
                    monthlyBudget: newSectionmonthlyBudgetNum,
                    currentBalance: newSectionmonthlyBudgetNum,
                    paymentD: 'none'
                });     
                console.log("Section dans Dashboard créée");
                const updated = await sectionService.getAll(clientId);
                setSections(updated);
                const upd = await sectionService.getTotalAmount(clientId);
            } catch (error) {
                console.error("Erreur à l’insertion de la section :", error);
                Alert.alert("Erreur", "Impossible de créer la section.");
                return;
            }
        }

    return (
        <SafeAreaView className="flex-1 bg-white px-4 pt-6 pb-2">

            <View className="rounded-xl mx-4 py-3 shadow-lg">

                <ProgressBar currentTotalAmount={currentTotalAmount} clientId={clientId}></ProgressBar>

            </View>

            <View className="bg-gray-100 z-10 w-full rounded-2xl shadow-md p-4 mt-10">  

                <Text className="text-gray-900 font-bold text-2xl mb-2">Mes sections</Text>
                <FlatList
                    className="my-3 max-h-64"
                    data={sections}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="border border-gray-300 bg-white py-3 px-4 rounded-xl shadow-sm my-2"
                            onPress={() => 
                                navigation.navigate('SectionDetail', { sectionId: item.id.toString(), clientId: clientId})
                            }>
                            <Text className="text-lg font-semibold text-gray-800" >{item.name}</Text>
                            <Text className="text-gray-600">
                                {item.currentBalance} / {item.monthlyBudget}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

            </View>

            <PlusButt onPress={() => setIsOpen(true)} 
                onGoHome={() => navigation.navigate('Welcome')} />

            {isOpen && (
                <View className="absolute inset-0 z-50 flex-1 justify-center items-center">
                    <Pressable
                        style={StyleSheet.absoluteFillObject}
                            onPress={() => setIsOpen(false)}
                        >
                            <Animated.View
                                pointerEvents="none"
                                style={[StyleSheet.absoluteFillObject, { opacity: blurAnim }]}
                            >
                                <BlurView
                                    style={{...StyleSheet.absoluteFillObject, flex: 1}}
                                />
                            </Animated.View>
                    </Pressable>
                    <View className="m-4">
                        <NewSection
                            onSubmit={(name, isCore, monthlyBudget) => {
                            createSection(name, isCore=0, monthlyBudget);
                            setIsOpen(false);}}>
                        </NewSection>
                    </View>
                </View>
            )}

            <View className="bg-black w-full h-12 rounded-t-xl mt-auto shadow-inner">

            </View>

        </SafeAreaView>
    );
}