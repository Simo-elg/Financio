import React, { useState } from 'react';
import { View, Text, TextInput, Button, ViewStyle, StyleProp } from 'react-native';

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
    );
}