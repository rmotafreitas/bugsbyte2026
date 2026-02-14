import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Background } from "../../components/Background";
import { MyStatusBar } from "../../components/my-status-bar";
import { useEffect, useState } from "react";

import { Profile } from "../../components/Profile";
import { DecisionButtons } from "../../components/DecisionButtons";

import { useNavigation } from "@react-navigation/native";
import { THEME } from "../../constants/theme";

export function Main() {
  const [profiles, setProfiles] = useState<any[]>([]);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          "https://randomuser.me/api/?gender=female&nat=us,fr&results=11",
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          setProfiles(data.results);
        } else {
          // Fallback mock data when API returns empty results
          const mockProfiles: any[] = Array.from({ length: 11 }, (_, i) => ({
            name: {
              first: [
                "Sophie",
                "Emma",
                "Léa",
                "Chloé",
                "Manon",
                "Camille",
                "Sarah",
                "Julie",
                "Laura",
                "Marie",
                "Clara",
              ][i],
              last: [
                "Martin",
                "Bernard",
                "Dubois",
                "Thomas",
                "Robert",
                "Petit",
                "Richard",
                "Durand",
                "Leroy",
                "Moreau",
                "Simon",
              ][i],
            },
            dob: { age: 19 + (i % 5) },
            picture: {
              large: `https://i.pravatar.cc/400?img=${i + 1}`,
            },
          }));
          setProfiles(mockProfiles);
        }
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      }
    })();
  }, []);

  const onSwipe = (direction: "left" | "right") => {
    console.log(direction);
    // remove the first profile from the array
    if (direction === "right") {
      // navigation.navigate("match", profiles[0]);
    }
    setProfiles((profiles) => profiles.slice(1));
  };

  return (
    <Background>
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingVertical: 20,
            paddingHorizontal: "7%",
            gap: 16,
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            {profiles
              .map((profile, index) => (
                <Profile
                  onSwipe={onSwipe}
                  index={index}
                  key={index}
                  profile={profile}
                />
              ))
              .reverse()}
          </View>
          <View
            style={{
              width: "100%",
              paddingBottom: 8,
            }}
          >
            <DecisionButtons />
          </View>
        </View>
      </SafeAreaView>
    </Background>
  );
}
