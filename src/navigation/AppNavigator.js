import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import LogScreen from "../screens/LogScreen";
import BadgesScreen from "../screens/BadgesScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import StatsScreen from "../screens/StatsScreen";
import ExerciseStatsScreen from "../screens/ExerciseStatsScreen";
import TabBar from "../components/TabBar";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />} // Connects custom UI to React Navigation's state
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen name="quests" component={ChallengesScreen} />
      <Tab.Screen name="log" component={LogScreen} />
      <Tab.Screen name="board" component={LeaderboardScreen} />
      <Tab.Screen name="profile" component={ProfileScreen} />
      <Tab.Screen
        name="badges"
        component={BadgesScreen}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="ExerciseStats" component={ExerciseStatsScreen} />
    </Stack.Navigator>
  );
}
