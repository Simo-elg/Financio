import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { firstService } from "../services/firstService";  // <— import de ton service
import { sectionService } from "../services/sectionService";

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function Welcome({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSingin = async (email: string, pass: string) => {

        if (!email || !pass) {
            Alert.alert("Erreur", "Tous les champs sont obligatoires.");
            return;
        }
        setLoading(true);
        try {
            const client = await firstService.getByCredendialts(email, pass);
            if (!client) {
                Alert.alert('Client non trouvé !');
                return;
            }
            navigation.navigate('Dashboard', { clientId: client?.id })
        } catch (err) {
            console.log('Error: ', err)
        } finally {
            setLoading(false);
        }
    }

    const handleFirst = async () => {
        
    }

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <Text className="text-3xl font-bold text-center mb-8">Inscription</Text>

            <View className="mb-4">
                <Text className="mb-1 text-gray-700">Email</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Votre email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border border-gray-300 rounded-lg px-4 py-2"
                />
            </View>

            <View className="mb-6">
                <Text className="mb-1 text-gray-700">Mot de passe</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Votre mot de passe"
                    secureTextEntry
                    className="border border-gray-300 rounded-lg px-4 py-2"
                />
            </View>

            <Pressable
                onPress={() => handleSingin(email, password)}
                disabled={loading}
                className="bg-blue-600 rounded-full py-3 mb-4"
            >
                <Text className="text-center text-white font-semibold">
                    {loading ? "Création..." : "S'inscrire"}
                </Text>
            </Pressable>

            <View className="border-2 px-4 py-3 rounded-full self-center">
                <Pressable onPress={() => navigation.navigate('Period', { clientId: 1 })}>
                    <Text>Admin Pass</Text>
                </Pressable>
            </View>

            <View className="border-2 px-4 py-3 rounded-full self-center my-4">
                <Pressable onPress={() => sectionService.deleteAll()}>
                    <Text>Reset</Text>
                </Pressable>
            </View>

            <View className="border-2 px-4 py-3 rounded-full self-center my-4">
                <Pressable onPress={handleFirst}>
                    <Text>First Time Admin</Text>
                </Pressable>
            </View>

        </View>
    );
}
