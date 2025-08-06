// Import React and necessary hooks/components
import React, { useEffect, useState, useRef } from "react";
// Import UI components from React Native
import { Text, StyleSheet, FlatList, View, Button, Pressable, TouchableOpacity, Animated, Easing, Alert, SafeAreaView } from "react-native";
// Import navigation types for type safety
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
// Import models for type definitions
import { SubSection } from "../models/SubSection";
import { subSectionService } from "../services/subSectionService";
import { sectionService } from "../services/sectionService";
import { BlurView } from 'expo-blur';
import NewSection from "./NewSection"
import Details from "../models/Details"


// Props type for navigation and route
type SectionDetailProps = NativeStackScreenProps<RootStackParamList, 'SectionDetail'>;

// Main component for Section detail page
export default function SectionDetail({ route, navigation }: SectionDetailProps) {

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

    const [subSections, setSubSections] = useState<SubSection[]>([]);

    const { sectionId } = route.params;

    const { clientId } = route.params;

    useEffect(() => {
        const fetchData = async () => {
            const subs = await subSectionService.getAllBySection(Number(sectionId))
            setSubSections(subs);
        };
        fetchData();
    }, [sectionId]);

    const createSubSection = async (name: string, isCore: 0 | 1, monthlyBudgetText: string) => {

        const newSubSectionmonthlyBudgetNum = Number(monthlyBudgetText);

        if (!name || newSubSectionmonthlyBudgetNum <= 0) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs correctement.");
            return;
        }

        const all = await sectionService.getById(Number(sectionId), clientId);

        const netNum = all.currentBalance;

        let totalB = 0;

        for (const subSec of subSections) {
            totalB += subSec.monthlyBudget || 0;
        }

        if (totalB + newSubSectionmonthlyBudgetNum > netNum) {
            Alert.alert("Erreur", "Le budget dépasse ce que vous avez !");
            return;
        }

        if (newSubSectionmonthlyBudgetNum > netNum) {
            Alert.alert("Erreur", "Votre budget dépasse votre solde actuelle pour cette Section !");
            return;
        }

        try {
            const created = await subSectionService.create({
                name: name,
                sectionId: Number(sectionId),
                isCore: 0,
                monthlyBudget: newSubSectionmonthlyBudgetNum,
                currentBalance: newSubSectionmonthlyBudgetNum,
            });
            console.log("Sous-Section dans SectionDetail creéée :", created);
            const update = await subSectionService.getAllBySection(Number(sectionId));
            setSubSections(update);
        } catch (error) {
            console.error("Erreur à la création d'une nouvelle sous-section !");
            Alert.alert("Erreur", "Impossible de créer la Sous-Section");
            return;
        }
    }

    return (
        <SafeAreaView style={styles.container} >

            {subSections.length === 0 ? (
                <Details sectionId={Number(sectionId)}></Details>
            ) : (
                <View>
                    {subSections.length === 0 ? (
                        <Text>Aucune Sous-Section pour le moment</Text>
                    ) : (
                        <>
                            <Text style={{ marginTop: 20, fontSize: 18 }}>Mes sous-sections</Text>
                            <FlatList
                                data={subSections}
                                keyExtractor={ss => ss.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate("SubSectionDetail", {
                                                subSectionId: item.id.toString(),
                                            })
                                        }>
                                        <Text>{item.name}</Text>
                                        <Text>
                                            {item.currentBalance} / {item.monthlyBudget}
                                        </Text>
                                    </TouchableOpacity>
                                )}>
                            </FlatList>
                        </>
                    )}
                </View>
            )}


            <Pressable onPress={() => setIsOpen(true)} className="rounded-lg">
                <Text className="text-white text-lg font-bold">Créer une Sous-Section</Text>
            </Pressable>

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
                            style={StyleSheet.absoluteFillObject}
                        />
                    </Animated.View>
                </Pressable>
            )}

            {isOpen && (
                <NewSection
                    style={styles.modalContainer}
                    onSubmit={(name, isCore, monthlyBudget) => {
                        createSubSection(name, isCore = 0, monthlyBudget);
                        setIsOpen(false);
                    }}></NewSection>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20,
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

    first: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 150
    },
})