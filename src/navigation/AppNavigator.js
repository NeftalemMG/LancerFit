import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import LogScreen from "../screens/LogScreen";
import BadgesScreen from "../screens/BadgesScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TabBar from "../components/TabBar";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
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
