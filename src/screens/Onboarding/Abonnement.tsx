import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    Pressable,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { sectionService } from "../../services/sectionService";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, 'Abonnement'>

export default function Abonnement({ navigation, route }: Props) {

    const { clientId } = route.params;

    const [subs, setSubs] = useState<
        Array<{
            id: number;
            name: string;
            monthlybudget: string;
            date: string;
            scale: Animated.Value;
            done: boolean;
        }>
    >([
        {
            id: 1,
            name: "",
            monthlybudget: "",
            date: "1",
            scale: new Animated.Value(1),
            done: false,
        },
    ]);

    const finishSub = (index: number) => {
        const newSubs = subs.map((s, i) => {
            if (i === index && !s.done) {
                Animated.timing(s.scale, {
                    toValue: 0.8,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
                return { ...s, done: true };
            }
            return s;
        });
        setSubs(newSubs);
    };

    const addAb = () => {
        // scale down pending
        const updated = subs.map(s => {
            if (!s.done) {
                Animated.timing(s.scale, {
                    toValue: 0.8,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
                return { ...s, done: true };
            }
            return s;
        });
        // add new
        updated.push({
            id: subs.length + 1,
            name: "",
            monthlybudget: "",
            date: "1",
            scale: new Animated.Value(1),
            done: false,
        });
        setSubs(updated);
    };

    const handleSubmit = async () => {

        try {

            for (const s of subs) {
                if (s.name && s.monthlybudget) {
                    await sectionService.create({
                        clientId: clientId,
                        name: s.name,
                        isCore: 1,
                        monthlyBudget: parseFloat(s.monthlybudget),
                        currentBalance: parseFloat(s.monthlybudget),
                        paymentD: s.date,
                    })
                }
            }

            navigation.navigate('Sections', {clientId: clientId})

        } catch (err) {
            console.log('Partie abonnement ne fonctionne pas', err)
            Alert.alert('Désolé, mais cela ne fonctionne pas. Veuillez nous contacter au plus vite afin de régler ce problème !')
        }

    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={{ padding: 16 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {subs.map((s, idx) => (
                            <Animated.View
                                key={s.id}
                                style={[{ transform: [{ scale: s.scale }] }]}
                                className="bg-white rounded-2xl p-6 mb-6 shadow"
                            >
                                <Text className="text-lg font-semibold text-gray-800 mb-3">
                                    Nom du {s.id}ᵉ abonnement
                                </Text>
                                <TextInput
                                    placeholder="ex : Spotify"
                                    value={s.name}
                                    onChangeText={t => {
                                        const a = [...subs];
                                        a[idx].name = t;
                                        setSubs(a);
                                    }}
                                    className="border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-gray-50"
                                />

                                <Text className="text-lg font-semibold text-gray-800 mb-3">
                                    Prix par mois
                                </Text>
                                <TextInput
                                    placeholder="ex : 58"
                                    keyboardType="numeric"
                                    value={s.monthlybudget}
                                    onChangeText={t => {
                                        const a = [...subs];
                                        a[idx].monthlybudget = t;
                                        setSubs(a);
                                    }}
                                    className="border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-gray-50"
                                />

                                <Text className="text-lg font-semibold text-gray-800 mb-3">
                                    Jour de paiement
                                </Text>
                                <View className="border border-gray-300 rounded-lg overflow-hidden mb-6 bg-gray-50">
                                    <Picker
                                        selectedValue={s.date}
                                        onValueChange={v => {
                                            const a = [...subs];
                                            a[idx].date = v;
                                            setSubs(a);
                                        }}
                                        className="h-12"
                                    >
                                        {Array.from({ length: 31 }, (_, i) => (
                                            <Picker.Item
                                                key={i + 1}
                                                label={`${i + 1}`}
                                                value={`${i + 1}`}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                <Pressable
                                    onPress={() => finishSub(idx)}
                                    className="self-end bg-blue-600 rounded-full px-5 py-2 shadow"
                                >
                                    <Text className="text-white font-medium">Done</Text>
                                </Pressable>
                            </Animated.View>
                        ))}

                        <Pressable
                            onPress={addAb}
                            className="border-2 border-blue-600 rounded-full px-6 py-3 self-center mb-12"
                        >
                            <Text className="font-bold text-blue-600">Ajouter un abonnement</Text>
                        </Pressable>

                        <View>
                            <Pressable
                                onPress={handleSubmit}>
                                <Text>Suivant</Text>
                            </Pressable>
                        </View>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
