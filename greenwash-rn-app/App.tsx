import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

// Import all your screens
import LandingScreen from "./src/screens/landingpg";
import MethodScreen from "./src/screens/methodpg";
import ImageOptionScreen from "./src/screens/imageoption"; // <-- IMPORT NEW
import DetectorScreen from "./src/screens/detectorpg";

// --- DEFINE YOUR SCREEN LIST ---
export type RootStackParamList = {
  Landing: undefined;
  Method: undefined;
  ImageOption: undefined; // <-- ADD NEW SCREEN

  // This is now a more complex type.
  // The Detector screen can be opened in one of 3 ways:
  Detector:
    | { mode: "text" }
    | { mode: "pdf" }
    | { mode: "image"; imageUri: string }; // <-- ADD IMAGE MODE
};

// --- Create the Navigator ---
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
        <Stack.Screen
          name="Method"
          component={MethodScreen}
          options={{ headerShown: false }}
        />
        {/* --- ADD THE NEW SCREEN TO THE STACK --- */}
        <Stack.Screen
          name="ImageOption"
          component={ImageOptionScreen}
          options={{
            title: "Image Greenwashing Detector",
            headerStyle: { backgroundColor: "#F3FAF7" },
            headerShadowVisible: false,
            headerTitleStyle: {
              color: "#00552E",
              fontSize: 20,
              fontWeight: "600",
            },
          }}
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
