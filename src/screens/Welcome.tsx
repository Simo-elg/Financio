import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function Welcome({ navigation }: Props) {
    return (
        <View style={style.container} >
            <Text>New ?</Text>
            <Button title="Yes" onPress={() => navigation.navigate("Onboarding")}></Button>
            <Button title="No" onPress={() => navigation.navigate("Dashboard")}></Button>
        </View>
    );
}

const style = StyleSheet.create ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})