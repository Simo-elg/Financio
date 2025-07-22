import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, Text, View, TextInput, Button, Alert, Animated, Easing, StyleSheet, ScrollView, Pressable  } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { sectionService } from "../services/sectionService";
import { Section } from "../models/Section";
import { transactionService } from "../services/transactionService";
import  NewSection from "./NewSection";
import { seedDefaultSections } from "../services/db";
import { BlurView } from '@react-native-community/blur';

type OnboardingProps = {
    navigation: StackNavigationProp<any>;
};

export default function Onboarding({ navigation }: OnboardingProps) {

    const [sections, setSections] = useState<Section[]>([]);

    const [budgets, setBudgets] = useState<Record<number, string>>({});

    const [netAmountText, setNetAmountText] = useState<string>("");
    
    const [currencyText, setCurrencyText] = useState<string>("USD");

    const [isOpen, setIsOpen] = useState<Boolean>(false);

    const [newSection, setNewSection] = useState<{ name: string, isCore: 0, monthlyBudget: string }>({
        name: "",
        isCore: 0,
        monthlyBudget: "",
    });

    const blurAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(blurAnim, {
            toValue: isOpen ? 1 : 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [isOpen]);

    useEffect(() => {
        (async () => {
            try {
                const data = await sectionService.getAll();
                setSections(data);
                const inital = data.reduce((acc, s) => {
                    acc[s.id] = '';
                    return acc;
                }, {} as Record<number, string>);
                setBudgets(inital);
            }catch (error) {
                console.error("Erreur lors du chargement des sections :", error);
            }
        })();
    }, []);

    const handleSubmit = async () => {

        const netNum = parseFloat(netAmountText);
        if (isNaN(netNum) || netNum < 0) {
            Alert.alert("Erreur", "Montant net invalide.");
            return;
        }

        const entries = sections.map(sec => {
            const value = parseFloat(budgets[sec.id]);
            if (isNaN(value) || value < 0) {
                throw new Error(`Budget invalide pour ${sec.name}`)
            }
            return { id: sec.id, value };
        });

        let totalBudget = 0;

        for (const { value } of entries) {
            totalBudget += value;
        }

        if (totalBudget > netNum) {
            Alert.alert("Erreur", "Le total des budgets dépasse le montant net disponible.");
            return;
        }

        for (const { id, value } of entries) {
            await sectionService.updateBudget(id, value);
            await sectionService.updateBalance(id, value);
        }

        await sectionService.createDebitAmount(netNum);

        console.log("Budgets mis à jour avec succès");

        navigation.replace('Dashboard');

    }

    const handleZero = async () => {
        try {
            await transactionService.deleteAll();
            console.log("All transactions deleted");

            await sectionService.deleteAll();
            console.log("All sections deleted");

            await seedDefaultSections();
            console.log("Sections reseeded");

            setBudgets({});
            setNetAmountText("");
            setCurrencyText("USD");
            Alert.alert("Succès", "Toutes les sections ont été réinitialisées.");
        } catch (error) {
            console.error("Erreur lors de la réinitialisation :", error);
            Alert.alert("Erreur", "Impossible de réinitialiser les sections.");
        }

        const updatedSections = await sectionService.getAll();
        setSections(updatedSections);
    }

    const createSection = async () => {

        const newSectionmonthlyBudgetNum = parseFloat(newSection.monthlyBudget);

        if (!newSection.name || newSectionmonthlyBudgetNum <= 0) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs correctement.");
            return;
        }
        
        const netNum = parseFloat(netAmountText);
        
        let totalBudget = 0; 

        for (const sec of sections) {
            totalBudget += parseFloat(budgets[sec.id]) || 0;
        }

        if (totalBudget + newSectionmonthlyBudgetNum > netNum) {
            Alert.alert(
                "Erreur",
                "Le budget de la nouvelle section dépasse le montant net disponible."
            );
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
                name: newSection.name,
                isCore: 0,
                monthlyBudget: newSectionmonthlyBudgetNum,
                currentBalance: newSectionmonthlyBudgetNum,
            });     
            console.log("Section dans Onboarding créée :", newSection);
            setSections(prev => [...prev, created])
            setBudgets(prev => ({ ...prev, [created.id]: newSection.monthlyBudget}));
        } catch (error) {
            console.error("Erreur à l’insertion de la section :", error);
            Alert.alert("Erreur", "Impossible de créer la section.");
            return;
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
                <View style={styles.container}>
                    <Text>Veuillez entrer votre montant net :</Text>
                    <TextInput
                        keyboardType="numeric"
                        placeholder="Entrez le montant net"
                        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginTop: 8 }}
                        value={netAmountText}
                        onChangeText={text => setNetAmountText(text)}
                    />
                    <TextInput
                        keyboardType="default"
                        placeholder="Currency (ex. USD)"
                        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginTop: 8 }}
                        value={currencyText}
                        onChangeText={text => setCurrencyText(text)}/>
                </View>
                    {sections.map(sec => (
                        <View key={sec.id} style={styles.container}>
                            <Text>Budget {sec.name} (mensuel)</Text>
                            <TextInput 
                                keyboardType="numeric"
                                placeholder={`Budget ${sec.name}`} 
                                value={budgets[sec.id]}
                                style={styles.input}
                                onChangeText={text => 
                                    setBudgets(prev => ({ ...prev, [sec.id]: text}))
                                } >

                            </TextInput>
                        </View>
                    ))}
                <View>
                    <Button
                        title="Soumettre"
                        onPress={() => {
                            handleSubmit();
                        }}
                    />
                </View>
                <View>
                    <Button
                        title="Repartir de zéro"
                        onPress={handleZero}
                    />
                </View>
                <View>
                    <Button
                        title="Créer une section "
                        onPress={() => setIsOpen(!isOpen)}>
                    </Button>
                </View>
            </ScrollView >

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
                        setNewSection({ name, isCore, monthlyBudget});
                        createSection();
                        setIsOpen(false);
                    }}></NewSection>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginTop: 8,
    borderRadius: 4,
  },
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
});
