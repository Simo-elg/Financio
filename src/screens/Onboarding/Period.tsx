import React, { useState } from "react";
import { SafeAreaView, Text, View, TextInput, Pressable, Alert, Animated, Easing, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { Picker } from "@react-native-picker/picker";
import { sectionService } from "../../services/sectionService";
import { Section } from "../../models/Section";
import { transactionService } from "../../services/transactionService";
import NewSection from "../NewSection";
import { BlurView } from 'expo-blur';
import { firstService } from "../../services/firstService";

type Props = NativeStackScreenProps<RootStackParamList, 'Period'>;

export default function Onboarding({ navigation, route }: Props) {

    const [period, setPeriod] = useState<'Mensuel' | 'Hebdo' | 'Quotidien'>('Mensuel')

    const [next, setNext] = useState<boolean>(false)

    const { clientId } = route.params;

    const handleNext = async () => {
        setNext(prev => !prev);
        navigation.navigate("Revenue", { clientId: clientId})

        if (next) {
            firstService.makeFPeriod(clientId, period)
        }

        console.log('client id: ', clientId);
        console.log('ajout fonctionne : ', period);
    }

    return (
        <SafeAreaView className="flex-1 bg-white px-6">

            <Text className="self-center my-10 font-bold">
                Veuillez choisir la période pour votre budget
            </Text>

            <View className="flex-1 items-center justify-center">

                <View className="w-full">

                    <Picker
                        selectedValue={period}
                        onValueChange={value => setPeriod(value)}>
                        <Picker.Item label="Mensuel" value='Mensuel' />
                        <Picker.Item label="Hebdo" value='Hebdo' />
                        <Picker.Item label="Quotidien" value='Quotidien' />
                    </Picker>

                </View>

            </View>

            <View className="flex-row justify-end m-6 mx-9">

                <Pressable className="self-center border-2 px-4 py-3 rounded-full"
                    onPress={handleNext}>

                    <Text className="font-semibold">
                        Suivant
                    </Text>

                </Pressable>

            </View>

        </SafeAreaView>
    );

}