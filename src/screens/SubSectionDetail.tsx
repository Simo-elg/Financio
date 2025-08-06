// Import React and necessary hooks/components
import React, { useEffect, useState } from "react";
// Import UI components from React Native
import { SafeAreaView, Text, FlatList, View, ScrollView, TextInput, Button, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from "react-native";
// Import Picker for dropdown selection
import { Picker } from "@react-native-picker/picker";
// Import navigation types for type safety
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
// Import services for data fetching and updating
import { transactionService } from "../services/transactionService";
// Import models for type definitions
import { Transaction } from "../models/Transaction";
import { SubSection } from "../models/SubSection";
import { subSectionService } from "../services/subSectionService";


// Props type for navigation and route
type SectionDetailProps = NativeStackScreenProps<RootStackParamList, 'SubSectionDetail'>;

// Main component for Section detail page
export default function SubSectionDetail({ route, navigation }: SectionDetailProps) {

    // State for transactions in this section
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // State for all sections (used for transfer dropdown)
    const [allSubSections, setAllSubSections] = useState<SubSection[]>([]);

    // Get sectionId from navigation params
    const { subSectionId } = route.params;

    // State for current subsection details
    const [subSection, setSubSection] = useState<SubSection | null>(null);

    // State for new transaction amount input
    const [newAmountText, setNewAmountText] = useState<string>("");

    // State for transaction type (add/withdraw)
    const [newType, setNewType] = useState<'ADD' | 'WITHDRAW'>('ADD');

    // State for optional note input
    const [newNoteText, setNewNoteText] = useState<string>('');

    // State to toggle between simple and transfer mode
    const [isTransferMode, setisTransferMode] = useState<boolean>(false);

    // State for selected target section in transfer mode
    const [targetSectionId, setTargetSectionId] = useState<number | null>(null);

    // State for transfer amount input
    const [transferAmountText, setTransferAmountText] = useState<string>("");


    // Fetch section, transactions, and all sections on mount or when sectionId changes
    useEffect(() => {
        const load = async () => {
            const id = Number(subSectionId);

            // 1. Charger la sous-section (un seul objet)
            const ss = await subSectionService.getById(id);
            if (!ss) {
                Alert.alert("Erreur", "Sous-section introuvable");
                navigation.goBack();
                return;
            }
            setSubSection(ss);

            // 2. Ses transactions
            const txs = await transactionService.getBySection(id);
            setTransactions(txs);

            // 3. Ses “frères/sœurs”
            const siblings = await subSectionService.getAllBySection(ss.sectionId);
            setAllSubSections(siblings);
        };
        load();
    }, [subSectionId]);



    // Handler for adding a new transaction (add/withdraw)
    const handleAddTransaction = async () => {
        // Parse and validate amount
        const newAmountNum = parseFloat(newAmountText);
        if (isNaN(newAmountNum) || newAmountNum <= 0) {
            alert("Montant invalide");
            return;
        }

        console.log("Adding transaction");

        // Create new transaction object
        const newTx = {
            sectionId: Number(subSectionId),
            type: newType,
            amount: newAmountNum,
            date: new Date().toISOString(),
            note: newNoteText
        };

        console.log("Transaction Successfully created");
        console.log("New transaction:", newTx);

        // Save transaction
        await transactionService.create(newTx);

        // Add or withdraw amount from section balance
        if (newType === 'ADD') {
            await subSectionService.updateBalance(Number(subSectionId), newAmountNum);
        } else {
            await subSectionService.updateBalance(Number(subSectionId), -newAmountNum);
        }

        // Refresh Section details 
        const updatedSection = await subSectionService.getById(Number(subSectionId));
        setSubSection(updatedSection);

        // Refresh transactions list
        const ss = await subSectionService.getById(Number(subSectionId));
        const updated = await transactionService.getBySection(ss.sectionId);
        setTransactions(updated);
        console.log("The new updated transaction", updated);

        // Reset input fields
        setNewAmountText('');
        setNewNoteText('');
        setNewType('ADD');
    }

    // Handler for transferring amount between sections
    const handleTransfertAmount = async () => {
        // Parse and validate transfer amount
        const amount = parseFloat(transferAmountText);
        if (isNaN(amount) || amount <= 0) {
            alert("Montant invalide");
            return;
        }

        // Ensure a target section is selected
        if (!targetSectionId) {
            Alert.alert("Erreur", "Veuillez sélectionner une section cible.");
            return;
        }

        // Check if transfer amount exceeds current balance
        if (amount > subSection!.currentBalance) {
            Alert.alert("Erreur", "Le montant dépasse le solde actuel de la section.");
            return;
        }

        // Update balances for both sections
        await subSectionService.updateBalance(subSection!.id, -amount);
        await subSectionService.updateBalance(targetSectionId, amount);

        // Log withdrawal transaction in source section
        await transactionService.create({
            sectionId: subSection!.id,
            type: "WITHDRAW",
            amount,
            date: new Date().toISOString(),
            note: `Transfert vers ${allSubSections.find(s => s.id === targetSectionId)!.name}`
        });

        // Log add transaction in target section
        await transactionService.create({
            sectionId: targetSectionId,
            type: "ADD",
            amount,
            date: new Date().toISOString(),
            note: `Transfert depuis ${subSection!.name}`
        });

        // Refresh section and transactions
        const updatedsection = await subSectionService.getById(subSection!.id);
        setSubSection(updatedsection);

        const updatedTransactions = await transactionService.getBySection(subSection!.id);
        setTransactions(updatedTransactions);

        setTransferAmountText("");
        setTargetSectionId(null);
        setisTransferMode(false);

    }

    // Render UI
    return (
        // Main container
        <SafeAreaView style={{ flex: 1, padding: 50 }}>
            {/* Page title */}
            <Text style={{ marginBottom: 20 }}>Page de détail - Section #{subSectionId}</Text>

            {/* Show loading if section not loaded yet */}
            {!subSection ? (
                <Text>Loading...</Text>
            ) : (
                // Section details and transaction list
                <View style={{ flexDirection: 'column', gap: 10 }}>
                    {/* Section info */}
                    <Text>Nom : {subSection?.name}</Text>
                    <Text>Budget Mensuel : {subSection?.monthlyBudget}</Text>
                    <Text>Solde actuel : {subSection?.currentBalance}</Text>

                    {/* List of transactions */}
                    <FlatList
                        data={transactions}
                        keyExtractor={t => t.id.toString()}
                        renderItem={({ item }) => (
                            <View>
                                {/* Transaction details */}
                                <Text>Type : {item.type} </Text>
                                <Text>Amount : {item.amount} </Text>
                                <Text>Date : {new Date(item.date).toLocaleDateString()} </Text>
                                <Text>{item.note ? `Note : ("${item.note}")` : ""} </Text>
                            </View>
                        )}>
                    </FlatList>

                    {/* Toggle between simple and transfer mode */}
                    <Button title={isTransferMode ? "Mode Simple" : "Mode Transfer"}
                        onPress={() => setisTransferMode(prev => !prev)} ></Button>

                    {/* Simple transaction mode UI */}
                    {!isTransferMode && (
                        <>
                            {/* Transaction type picker */}
                            <View>
                                <Picker
                                    selectedValue={newType}
                                    onValueChange={value => setNewType(value)}>
                                    <Picker.Item label="Ajouter" value="ADD" />
                                    <Picker.Item label="Retirer" value="WITHDRAW" />
                                </Picker>
                            </View>
                            {/* Amount and note input */}
                            <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // ajuste la valeur selon ton header/navbar
                            >
                                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                    <View>
                                        <TextInput
                                            placeholder="Montant"
                                            keyboardType="numeric"
                                            style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginTop: 8 }}
                                            value={newAmountText}
                                            onChangeText={text => setNewAmountText(text)} >
                                        </TextInput>
                                        <TextInput
                                            placeholder="Note (optionnel)"
                                            keyboardType="default"
                                            style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginTop: 8 }}
                                            value={newNoteText}
                                            onChangeText={text => setNewNoteText(text)} >
                                        </TextInput>
                                        <Button title={newType === 'ADD' ? "Ajouter" : "Retirer"} onPress={handleAddTransaction}></Button>
                                    </View>
                                </TouchableWithoutFeedback>
                            </KeyboardAvoidingView>
                        </>
                    )}

                    {/* Transfer mode UI */}
                    {isTransferMode && (
                        <>
                            {/* Target section picker for transfer */}
                            <View>
                                <Picker
                                    selectedValue={targetSectionId}
                                    onValueChange={val => setTargetSectionId(val)}>
                                    {allSubSections
                                        .filter(s => s.id !== subSection!.id)
                                        .map(s => (
                                            <Picker.Item key={s.id} label={s.name} value={s.id} />
                                        ))
                                    }
                                </Picker>
                            </View>
                            {/* Transfer amount input */}
                            <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // ajuste la valeur selon ton header/navbar
                            >
                                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                    <View>
                                        <TextInput
                                            placeholder="Montant à transférer"
                                            keyboardType="numeric"
                                            style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginTop: 8 }}
                                            value={transferAmountText}
                                            onChangeText={Number => setTransferAmountText(Number)} >
                                        </TextInput>
                                        <Button title="Transférer" onPress={handleTransfertAmount}></Button>
                                    </View>
                                </TouchableWithoutFeedback>
                            </KeyboardAvoidingView>
                        </>
                    )}

                </View>
            )}
        </SafeAreaView>
    );
}