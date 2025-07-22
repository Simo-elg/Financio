import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import Onboarding from '../screens/Onboarding';
import Dashboard from '../screens/Dashboard';
import SectionDetail from '../screens/SectionDetail';

const stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <stack.Navigator 
                initialRouteName='Onboarding'
                screenOptions={{headerShown: false}}>
                <stack.Screen name='Onboarding' component={Onboarding}/>
                <stack.Screen name='Dashboard' component={Dashboard}/>
                <stack.Screen name='SectionDetail' component={SectionDetail}/>
            </stack.Navigator>
        </NavigationContainer>
    );
}