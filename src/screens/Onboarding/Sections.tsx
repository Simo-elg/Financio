import React, { useState } from "react";
import {
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
import { sectionService } from "../../services/sectionService";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Sections'>;

export default function Sections({ navigation, route }: Props) {
    const { clientId } = route.params;

    const [subs, setSubs] = useState<Array<{ id: number; name: string; monthlybudget: string; date: string; scale: Animated.Value; done: boolean }>>([
        {
            id: 1,
            name: '',
            monthlybudget: '',
            date: 'none',
            scale: new Animated.Value(1),
            done: false,
        },
    ]);

    const finishSub = (index: number) => {
        const newSub = subs.map((s, i) => {
            if (i === index && !s.done && s.name && s.monthlybudget) {
                Animated.timing(s.scale, {
                    toValue: 0.8,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
                return { ...s, done: true };
            }
            return s;
        });
        setSubs(newSub);
    };

    const addSec = () => {
        const scaled = subs.map((s) => {
            if (!s.done && s.name && s.monthlybudget) {
                Animated.timing(s.scale, {
                    toValue: 0.8,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
                return { ...s, done: true };
            }
            return s;
        });

        scaled.push({
            id: subs.length + 1,
            name: '',
            monthlybudget: '',
            date: 'none',
            scale: new Animated.Value(1),
            done: false,
        });

        setSubs(scaled);
    };

    const handleSubmit = async () => {
        try {
            for (const s of subs) {
                if (s.name && s.monthlybudget) {
                    await sectionService.create({
                        clientId,
                        name: s.name,
                        isCore: 0,
                        monthlyBudget: parseFloat(s.monthlybudget),
                        currentBalance: parseFloat(s.monthlybudget),
                        paymentD: 'none',
                    });
                }
            }
            navigation.navigate('Dashboard', { clientId });
        } catch (err) {
            console.log('Erreur Sections: ', err);
            Alert.alert('Désolé', 'Impossible de créer les sections.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={{ padding: 16 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text className="text-2xl font-bold text-gray-800 mb-6 self-center">
                            Créer vos sections
                        </Text>
                        {subs.map((s, ind) => (
                            <Animated.View
                                key={s.id}
                                style={[{ transform: [{ scale: s.scale }] }]}
                                className="bg-white rounded-2xl p-6 mb-4 shadow-md"
                            >
                                <Text className="text-lg font-medium text-gray-700 mb-2">
                                    Section {s.id}
                                </Text>
                                <TextInput
                                    value={s.name}
                                    onChangeText={(text) => {
                                        const a = [...subs];
                                        a[ind].name = text;
                                        setSubs(a);
                                    }}
                                    placeholder="Nom (ex : Food)"
                                    className="border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-gray-50"
                                />
                                <TextInput
                                    value={s.monthlybudget}
                                    onChangeText={(num) => {
                                        const a = [...subs];
                                        a[ind].monthlybudget = num;
                                        setSubs(a);
                                    }}
                                    placeholder="Budget mensuel"
                                    keyboardType="numeric"
                                    className="border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-gray-50"
                                />
                                <Pressable
                                    onPress={() => finishSub(ind)}
                                    className="self-end bg-blue-600 rounded-full px-6 py-2 shadow"
                                >
                                    <Text className="text-white font-semibold">Done</Text>
                                </Pressable>
                            </Animated.View>
                        ))}

                        <Pressable
                            onPress={addSec}
                            className="border-2 border-blue-600 rounded-full px-6 py-3 self-center mb-6"
                        >
                            <Text className="text-blue-600 font-bold">Ajouter une section</Text>
                        </Pressable>

                        <View className="items-center mb-8">
                            <Pressable
                                onPress={handleSubmit}
                                className="bg-green-600 rounded-full px-8 py-3 shadow-lg"
                            >
                                <Text className="text-white font-semibold text-base">
                                    Suivant
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
