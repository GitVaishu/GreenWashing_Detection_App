import React from "react";
import { NavigationContainer } from "@react-navigation/native";
// 1. IMPORT the type from native-stack
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

// Import your new screens
import LandingScreen from "./src/screens/landingpg";
import DetectorScreen from "./src/screens/detectorpg";
import MethodScreen from "./src/screens/methodpg";

// 2. DEFINE and EXPORT your screen list
// This tells TypeScript what screens exist
export type RootStackParamList = {
  Landing: undefined;
  Method: undefined;
  Detector: undefined; // 'Detector' screen takes no parameters
};

// 3. PASS the list to the navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        {/* ADD THIS NEW SCREEN */}
        <Stack.Screen
          name="Method"
          component={MethodScreen}
          options={{ headerShown: false }} // Hides the default header
        />
        <Stack.Screen
          name="Detector"
          component={DetectorScreen}
          options={{ title: "Greenwash Detector" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
