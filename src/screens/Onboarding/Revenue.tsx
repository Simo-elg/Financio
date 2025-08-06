import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, TextInput, Pressable, Alert, Animated, Easing, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { sectionService } from "../../services/sectionService";
import { Picker } from "@react-native-picker/picker";


type Props = NativeStackScreenProps<RootStackParamList, "Revenue">;


export default function Onboarding({ navigation, route }: Props) {

    const { clientId } = route.params;

    const [salary, setSalary] = useState<string>('');

    const [sub, setSub] = useState<'Oui' | 'Non'>('Oui');

    const handleNext = async () => {

        try {

            await sectionService.createDebitAmount(parseFloat(salary), clientId);
            console.log("Salaire entrée : ", salary)

            navigation.navigate('Abonnement', { clientId: clientId})

        } catch (err) {
            console.log("Salaire pas rentrée, ERROR : ", err)
        }

    }

    return (

        <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-8">
            {/* Titre */}
            <View className="mb-6 items-center">
                <Text className="text-2xl font-bold text-gray-800">
                    Veuillez entrer votre revenu mensuel
                </Text>
                <Text className="text-gray-600 text-sm mt-1">ex : 500</Text>
            </View>

            {/* Input salaire */}
            <View className="mb-10 px-2">
                <TextInput
                    keyboardType="number-pad"
                    value={salary}
                    onChangeText={setSalary}
                    placeholder="ex : 500"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm text-gray-800"
                />
            </View>

            {salary !== "" && (
                <View className="bg-white rounded-2xl p-6 shadow-lg space-y-6 mb-8">
                    {/* Question abonnements */}
                    <Text className="text-lg font-medium text-gray-700">
                        Avez-vous des abonnements obligatoires à payer chaque mois ?
                    </Text>

                    {/* Picker Oui/Non */}
                    <View className="bg-gray-100 rounded-lg overflow-hidden">
                        <Picker
                            selectedValue={sub}
                            onValueChange={setSub}
                            className="h-12 w-full"
                        >
                            <Picker.Item label="Oui" value="Oui" />
                            <Picker.Item label="Non" value="Non" />
                        </Picker>
                    </View>

                    {/* Bouton Suivant */}
                    <Pressable
                        onPress={handleNext}
                        className="mt-6 bg-blue-600 rounded-full py-3 px-8 self-center shadow-md"
                    >
                        <Text className="text-white font-semibold text-base">Suivant</Text>
                    </Pressable>
                </View>
            )}
        </SafeAreaView>


    );

}