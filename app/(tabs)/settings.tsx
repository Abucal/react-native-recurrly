import "@/global.css";
import { Text, View, Pressable, ActivityIndicator, Image } from "react-native";
import React, { useState } from "react";
import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/image";
import dayjs from "dayjs";

const SafeAreaView = styled(RNSafeAreaView);

const settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="flex-1 gap-4">
        <Text className="text-2xl font-sans-bold text-primary mb-4">
          Settings
        </Text>

        {user && (
          <>
            <View className="auth-card">
              <View className="account-body">
                <Image source={images.avatar} className="home-avatar" />
                <View>
                  <Text className="upcoming-name">{user?.firstName}</Text>
                  <Text className="upcoming-meta">
                    {user.primaryEmailAddress?.emailAddress}
                  </Text>
                </View>
              </View>
            </View>

            <View className="auth-card gap-4">
              <Text className="upcoming-name">Account</Text>
              <View className="flex-row justify-between">
                <Text className="upcoming-meta">Account ID</Text>
                <Text className="max-w-50" numberOfLines={1} ellipsizeMode="tail">{user?.id}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="upcoming-meta">Joined</Text>
                <Text>{dayjs(user?.createdAt).format("DD.MM.YYYY")}</Text>
              </View>
            </View>
          </>
        )}

        <Pressable
          className={`auth-button bg-destructive ${
            isSigningOut ? "opacity-50" : ""
          }`}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-base font-sans-bold text-white">
              Sign out
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default settings;
