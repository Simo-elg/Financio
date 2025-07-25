import React, { useState } from 'react';
import { View, Text, TextInput, Button, ViewStyle, StyleProp, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from 'react-native';

interface NewSectionProps {
    style?: StyleProp<ViewStyle>;
    onSubmit: (name: string, isCore: 0, monthlyBudget: string) => void;
    onCancel?: () => void;
}

export default function NewSection({ style, onSubmit, onCancel }: NewSectionProps) {

    const [newSection, setNewSection] = useState<{ name: string, isCore: 0, monthlyBudget: string }>({
            name: "",
            isCore: 0,
            monthlyBudget: "",
        });

    const handleSubmit = () => {
        onSubmit(newSection.name, newSection.isCore, newSection.monthlyBudget);

        setNewSection({ name: "", isCore: 0, monthlyBudget: "" }); // Reset form
    }

    return (
        <View style={style}>
             <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // ajuste la valeur selon ton header/navbar
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{flex: 1}}>
                        <Text>Nouvelle Section</Text>                    
                            <View>
                                <Text>Nom de la Section</Text>
        
                                <TextInput
                                    placeholder="Entrez le nom de la section"
                                    style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginTop: 8 }}
                                    value={newSection.name}
                                    onChangeText={text => setNewSection({ ...newSection, name: text })} >
                                </TextInput>
                                <Text>Budget idéal (mensuel)</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    placeholder="Entrez le budget que vous souhaitez allouer à cette section"
                                    style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginTop: 8 }}
                                    value={newSection.monthlyBudget}
                                    onChangeText={text => setNewSection({ ...newSection, monthlyBudget: text })} >
                                </TextInput>
                                <Button
                                    title="Valider"
                                    onPress={handleSubmit} ></Button>
                            </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
                            
        
                        </View>
    );
}