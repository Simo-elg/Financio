

// Import React and necessary hooks/components
import React, { useEffect, useState } from "react";
// Import UI components from React Native
import { SafeAreaView, Text, FlatList, View, ScrollView, TextInput, Button, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from "react-native";
// Import Picker for dropdown selection
import { Picker } from "@react-native-picker/picker";
// Import services for data fetching and updating
import { transactionService } from "../services/transactionService";
// Import models for type definitions
import { Transaction } from "../models/Transaction";
import { Section } from "../models/Section";
import { sectionService } from "../services/sectionService";

// Props type for navigation and route
type SectionDetailProps = {
    sectionId: number;
}

// Main component for Section detail page
export default function SubSectionDetail({ sectionId }: SectionDetailProps) {

    // State for transactions in this section
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // State for all sections (used for transfer dropdown)
    const [allSections, setAllSections] = useState<Section[]>([]);

    // State for current subsection details
    const [section, setSection] = useState<Section | null>(null);

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
            const id = Number(sectionId);

            // 1. Charger la Section (un seul objet)
            const ss = await sectionService.getById(id);
            if (!ss) {
            Alert.alert("Erreur", "Section introuvable");
            return;
            }
            setSection(ss);

            // 2. Ses transactions
            const txs = await transactionService.getBySection(id);
            setTransactions(txs);

            // 3. Ses “frères/sœurs”
            const siblings = await sectionService.getAll();
            setAllSections(siblings);
        };
        load();
    }, [sectionId]);

 

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
            sectionId: Number(sectionId),
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
            await sectionService.updateBalance(Number(sectionId), newAmountNum);
        }else {
            await sectionService.updateBalance(Number(sectionId), -newAmountNum);
        }

        // Refresh Section details 
        const updatedSection = await sectionService.getById(Number(sectionId));
        setSection(updatedSection);

        // Refresh transactions list
        const ss = await sectionService.getById(Number(sectionId));
        const updated = await transactionService.getBySection(sectionId);
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
        if (amount > section!.currentBalance) {
            Alert.alert("Erreur", "Le montant dépasse le solde actuel de la section.");
            return;
        }

        // Update balances for both sections
        await sectionService.updateBalance(section!.id, -amount);
        await sectionService.updateBalance(targetSectionId, amount);

        // Log withdrawal transaction in source section
        await transactionService.create({
            sectionId: section!.id,
            type: "WITHDRAW",
            amount,
            date: new Date().toISOString(),
            note: `Transfert vers ${allSections.find(s => s.id === targetSectionId)!.name}`
        });

        // Log add transaction in target section
        await transactionService.create({
            sectionId: targetSectionId,
            type: "ADD",
            amount,
            date: new Date().toISOString(),
            note: `Transfert depuis ${section!.name}`
        });

        // Refresh section and transactions
        const updatedsection = await sectionService.getById(section!.id);
        setSection(updatedsection);

        const updatedTransactions = await transactionService.getBySection(section!.id);
        setTransactions(updatedTransactions);

        setTransferAmountText("");
        setTargetSectionId(null);
        setisTransferMode(false);

    }

    // Render UI
    return (
        // Main container
        <SafeAreaView style={{ flex: 1, padding: 16, }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // ajuste la valeur selon ton header/navbar
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        {/* Page title */}
                        <Text style={{marginBottom: 20}}>Page de détail - Section #{sectionId}</Text>

                        {/* Show loading if section not loaded yet */}
                        {!section ? (
                            <Text>Loading...</Text>
                            ) : (
                                // Section details and transaction list
                                <View style={{flexDirection: 'column', gap: 10}}>
                                    {/* Section info */}
                                    <Text>Nom : {section?.name}</Text>
                                    <Text>Budget Mensuel : {section?.monthlyBudget}</Text>
                                    <Text>Solde actuel : {section?.currentBalance}</Text>

                                    {/* List of transactions */}
                                    <FlatList
                                        data={transactions}
                                        keyExtractor={t => t.id.toString()}
                                        style={{margin: 20}}
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
                                                    <Picker.Item label="Ajouter" value="ADD"/>
                                                    <Picker.Item label="Retirer" value="WITHDRAW"/>
                                                </Picker>
                                            </View>
                                            {/* Amount and note input */}
                                                    
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
                                                            {allSections
                                                                .filter(s => s.id !== section!.id)
                                                                .map(s => (
                                                                    <Picker.Item key={s.id} label={s.name} value={s.id} />
                                                                ))
                                                            }
                                                    </Picker>
                                                </View>
                                                {/* Transfer amount input */}
                                                    <KeyboardAvoidingView
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
                                </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}