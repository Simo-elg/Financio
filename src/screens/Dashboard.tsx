import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, StyleSheet, Text, FlatList, TouchableOpacity, View, Button, Pressable, Animated, Easing, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Section } from "../models/Section";
import { sectionService } from "../services/sectionService";
import { useFocusEffect } from "@react-navigation/native";
import NewSection from "./NewSection"
import { BlurView } from '@react-native-community/blur';
import ProgressBar from "../components/ProgressBar";    

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function Dashboard({ navigation }: Props) {

    const [sections, setSections] = useState<Section[]>([])

    const [isOpen, setIsOpen] = useState<Boolean>(false);

    const blurAnim = useRef(new Animated.Value(0)).current;
    
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
            const data = await sectionService.getAll();
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
            
            const netNum = await sectionService.getDebitAmount();

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
                    name: name,
                    isCore: 0,
                    monthlyBudget: newSectionmonthlyBudgetNum,
                    currentBalance: newSectionmonthlyBudgetNum,
                });     
                console.log("Section dans Dashboard créée");
                const updated = await sectionService.getAll();
                setSections(updated);
            } catch (error) {
                console.error("Erreur à l’insertion de la section :", error);
                Alert.alert("Erreur", "Impossible de créer la section.");
                return;
            }
        }

    return (
        <SafeAreaView style={Style.container} >

            <ProgressBar></ProgressBar>

            <Text>Mes sections</Text>
            <FlatList
                data={sections}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{ padding: 12, borderWidth: 1, borderColor: 'blue'}}
                        onPress={() => 
                            navigation.navigate('SectionDetail', { sectionId: item.id.toString()})
                        }>
                        <Text style={{fontSize: 18}} >{item.name}</Text>
                        <Text>
                            {item.currentBalance} / {item.monthlyBudget}
                        </Text>
                    </TouchableOpacity>
                )}
            />
            <View>
                <Button
                    title="Revenir à l'accueil"
                    onPress={() => navigation.navigate('Onboarding')}>

                </Button>
            </View>

            <View>
                <Button
                    title="Créer une Section"
                    onPress={() => setIsOpen(true)}></Button>
            </View>

            {/* Overlay flou animé */}
            {isOpen && (
                <Pressable
                    style={StyleSheet.absoluteFillObject}
                    onPress={() => setIsOpen(false)}
                >
                    <Animated.View
                    pointerEvents="none"
                    style={[StyleSheet.absoluteFillObject, { opacity: blurAnim }]}
                    >
                    <BlurView
                        blurType="light"
                        blurAmount={10}
                        style={StyleSheet.absoluteFillObject}
                    />
                    </Animated.View>
                </Pressable>
                )}

            {isOpen && (
                <NewSection
                    style={styles.modalContainer}
                    onSubmit={(name, isCore, monthlyBudget) => {
                        createSection(name, isCore=0, monthlyBudget);
                        setIsOpen(false);}}></NewSection>
            )}

        </SafeAreaView>
    );
}

const Style = StyleSheet.create({
    container : {
        flex: 1,
        padding: 20,
    }
})

const styles = StyleSheet.create({
    modalContainer: {
        position: "absolute",
        top: "20%",
        left: "5%",
        right: "5%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 8,
        // Ombre iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        // Élèvement Android
        elevation: 5,
    },
})