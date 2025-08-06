import * as React from 'react';
import { FAB, Portal, Provider } from 'react-native-paper';
import { View } from "react-native";

interface Props {
    onPress: () => void;
    onGoHome: () => void;
}

const PlusButt = ({onPress, onGoHome}: Props) => {
    const [open, setOpen] = React.useState<boolean>(false);

    return (
        <View>
                <Portal>
                    <FAB.Group
                        open={open}
                        visible={true}
                        icon={open ? 'close' : 'plus'}
                        actions={[
                            {icon: "plus", label: "Nouvelle Section", onPress: onPress},
                            {icon: "star", label: "Revenir a l'acceuil", onPress: onGoHome},
                        ]} 
                        onStateChange={({open}) => setOpen(open)}
                        />
                </Portal>
        </View>
    );
};

export default PlusButt;