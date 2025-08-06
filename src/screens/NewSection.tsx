import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ViewStyle, StyleProp, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from 'react-native';

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
        <View className='self-center'>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // ajuste la valeur selon ton header/navbar
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className='self-center m-10'>
                        <Text>Nouvelle Section</Text>                    
                            <View className='m-5'>
                                <Text>Nom de la Section</Text>
        
                                <TextInput
                                    className='my-3 border-2 px-3 py-2 rounded-full'
                                    placeholder="Entrez le nom de la section"
                                    value={newSection.name}
                                    onChangeText={text => setNewSection({ ...newSection, name: text })} >
                                </TextInput>
                                <Text>Budget idéal (mensuel)</Text>
                                <TextInput
                                    className='my-3 border-2 px-3 py-2 rounded-full'
                                    keyboardType="numeric"
                                    placeholder="Entrez le budget que vous souhaitez allouer à cette section"
                                    value={newSection.monthlyBudget}
                                    onChangeText={text => setNewSection({ ...newSection, monthlyBudget: text })} >
                                </TextInput>
                                <Pressable
                                    className='self-center'
                                    onPress={handleSubmit} >
                                    <Text className='rounded-2xl border-2 px-3 py-2'> Valider </Text>
                                </Pressable>
                            </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView> 
        </View>
    );
}