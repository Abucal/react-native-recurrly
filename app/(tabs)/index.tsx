import "@/global.css";
import { Link } from "expo-router";
import React from "react";
import { useState } from "react";
import { Image, Text, View, FlatList } from "react-native";
import images from "@/constants/image";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {
  HOME_USER,
  HOME_BALANCE,
  UPCOMING_SUBSCRIPTIONS,
  HOME_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/constants/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/listHeading";
import UpcomingSubCard from "@/components/upcomingSubCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useUser } from "@clerk/expo";



const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const {user} = useUser();
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="flex-1">
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image source={images.avatar} className="home-avatar" />
                  <Text className="home-user-name" >  {user?.primaryEmailAddress?.emailAddress}</Text>
                </View>
                <Image source={icons.add} className="home-add-icon" />
              </View>

              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>
                <View className="home-balance-row">
                  <Text className="home-balance-amount">
                    {formatCurrency(HOME_BALANCE.amount)}
                  </Text>
                  <Text className="home-balance-date">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                  </Text>
                </View>
              </View>

              <View className="mb-5">
                <ListHeading title="Upcoming" />
                {/* important : fast mapping*/}
                <FlatList
                  data={UPCOMING_SUBSCRIPTIONS}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    return <UpcomingSubCard {...item} />;
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text className="home-empty-state">
                      No upcoming Renewals Yet
                    </Text>
                  }
                />
              </View>

              <ListHeading title="All Subscriptions" />
              {/* important : useState toggle*/}
            </>
          )}
          data={HOME_SUBSCRIPTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <SubscriptionCard
                {...item}
                expanded={expandedSubId === item.id}
                onPress={() => {
                  setExpandedSubId((currentId) =>
                    currentId === item.id ? null : item.id,
                  );
                }}
              />
            );
          }}
          extraData={expandedSubId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="home-empty-state">No subscriptions found</Text>
          }

          contentContainerClassName='pb-20'
        />
      </View>
    </SafeAreaView>
  );
}
