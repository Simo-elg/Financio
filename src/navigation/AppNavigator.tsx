import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import Period from '../screens/Onboarding/Period';
import Revenue from '../screens/Onboarding/Revenue'
import Abonnement from '../screens/Onboarding/Abonnement'
import Sections from '../screens/Onboarding/Sections'
import Dashboard from '../screens/Dashboard';
import SectionDetail from '../screens/SectionDetail';
import Welcome from '../screens/Welcome';
import SignUp from '../screens/SignUp';
import SubSectionDetail from '../screens/SubSectionDetail'

const stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <stack.Navigator 
                initialRouteName='Welcome'
                screenOptions={{headerShown: false}}>
                <stack.Screen name='Welcome' component={Welcome}/>
                <stack.Screen name='SignUp' component={SignUp}/>
                <stack.Screen name='Period' component={Period}/>
                <stack.Screen name='Revenue' component={Revenue}/>
                <stack.Screen name='Abonnement' component={Abonnement}/>
                <stack.Screen name='Sections' component={Sections}/>
                <stack.Screen name='Dashboard' component={Dashboard}/>
                <stack.Screen name='SectionDetail' component={SectionDetail}/>
                <stack.Screen name='SubSectionDetail' component={SubSectionDetail}/>
            </stack.Navigator>
        </NavigationContainer>
    );
}