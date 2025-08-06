import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, Text, View, TextInput, Button, Alert, Animated, Easing, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { sectionService } from "../services/sectionService";
import { Section } from "../models/Section";
import { transactionService } from "../services/transactionService";
import NewSection from "./NewSection";
import { seedDefaultSections } from "../services/db";
import { BlurView } from 'expo-blur';

type OnboardingProps = {
    navigation: StackNavigationProp<any>;
};

export default function Onboarding({ navigation }: OnboardingProps) {
    
    return (
        <SafeAreaView>
            
        </SafeAreaView>
    );

}