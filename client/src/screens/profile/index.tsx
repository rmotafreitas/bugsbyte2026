import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { MyStatusBar } from "../../components/my-status-bar";
import ImageView from "react-native-image-viewing";
import { Background } from "../../components/Background";
import { DecisionButtons } from "../../components/DecisionButtons";
import { styles } from "./styles";

import { useState } from "react";
import Checked from "../../assets/buttons/checked.png";
import DirectMessage from "../../assets/buttons/direct_message.png";
import DistanceIcon from "../../assets/buttons/distance_red.png";
import GoBackIcon from "../../assets/buttons/right_white.png";

interface InterestProps {
  name: string;
  checked: boolean;
}

function Intersest({ name, checked }: InterestProps) {
  return (
    <View style={[styles.interest, checked && styles.interestChecked]}>
      {checked && <Image source={Checked} />}
      <Text
        style={[styles.interestText, checked && styles.interestTextChecked]}
      >
        {name}
      </Text>
    </View>
  );
}

interface GalleryPicProps {
  source: string;
  profile: any;
  onPress?: () => void;
}

function GalleryPic({ source, profile, onPress }: GalleryPicProps) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={onPress} style={styles.galleryPic}>
      <Image source={{ uri: source }} style={styles.galleryPic} />
    </TouchableOpacity>
  );
}

export function Profile() {
  const route = useRoute();
  const navigation = useNavigation();

  const profile = route.params as any;

  const [readMoreEnabled, setReadMoreEnabled] = useState<boolean>(false);
  const [imageViewVisible, setImageViewVisible] = useState<number>(-1);

  const viewImage = (index: number) => {
    setImageViewVisible(index);
  };

  profile.about =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit ipsam et quisquam, quis, sequi voluptas distinctio reprehenderit quas adipisci nihil hic accusamus sit praesentium consequatur ad quo exercitationem omnis fugiat.";

  return (
    <Background>
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <View style={{ flex: 1 }}>
        <ImageView
          images={profile.pics.map((pic: string) => ({ uri: pic }))}
          imageIndex={imageViewVisible}
          visible={imageViewVisible >= 0}
          onRequestClose={() => setImageViewVisible(-1)}
        />
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.pic}>
            <Image source={{ uri: profile.pics[0] }} style={styles.pic} />
            <TouchableOpacity
              style={styles.goback}
              onPress={() => navigation.goBack()}
            >
              <Image source={GoBackIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.informationContainer}>
            <View style={styles.infos}>
              <DecisionButtons />
              <View style={styles.nameAndCourseContainer}>
                <View style={styles.nameAndCourse}>
                  <Text style={styles.profilename}>
                    {profile.name.first} {profile.name.last}, {profile.dob.age}
                  </Text>
                  <Text style={styles.text}>Style enthusiast</Text>
                </View>
                <TouchableOpacity style={styles.dmBtn} onPress={() => {}}>
                  <Image source={DirectMessage} />
                </TouchableOpacity>
              </View>
              <View style={styles.locationContainer}>
                <View style={styles.nameAndCourse}>
                  <Text style={styles.label}>Based in</Text>
                  <Text style={styles.text}>Porto, Portugal</Text>
                </View>
                <View style={styles.distance}>
                  <View>
                    <Image source={DistanceIcon} style={styles.distanceIcon} />
                  </View>
                  <Text style={styles.distanceText}>7 km</Text>
                </View>
              </View>
              <View style={styles.simpleContainer}>
                <Text style={styles.label}>About</Text>
                <Text style={styles.text}>
                  {profile.about.length > 100 && !readMoreEnabled
                    ? profile.about.substring(0, 100) + "..."
                    : profile.about}
                </Text>
                {profile.about.length > 100 && (
                  <TouchableOpacity
                    onPress={() => setReadMoreEnabled(!readMoreEnabled)}
                  >
                    <Text style={styles.readMore}>
                      {profile.about.length > 100 && !readMoreEnabled
                        ? "Read more"
                        : "Read less"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.simpleContainer}>
                <Text style={styles.label}>Style</Text>
                <View style={styles.interests}>
                  <Intersest name="Minimalist" checked={true} />
                  <Intersest name="Streetwear" checked={true} />
                  <Intersest name="Casual" checked={false} />
                  <Intersest name="Vintage" checked={false} />
                  <Intersest name="Sporty" checked={false} />
                </View>
              </View>
              <View style={styles.simpleContainer}>
                <Text style={styles.label}>Gallery</Text>
                <View style={styles.gallery}>
                  <View
                    style={[
                      styles.galleryRow,
                      {
                        height: "65%",
                      },
                    ]}
                  >
                    <GalleryPic
                      onPress={() => viewImage(0)}
                      profile={profile}
                      source={profile.pics[0]}
                    />
                    <GalleryPic
                      onPress={() => viewImage(1)}
                      profile={profile}
                      source={profile.pics[1]}
                    />
                  </View>
                  <View
                    style={[
                      styles.galleryRow,
                      {
                        height: "35%",
                      },
                    ]}
                  >
                    <GalleryPic
                      onPress={() => viewImage(2)}
                      profile={profile}
                      source={profile.pics[2]}
                    />

                    <GalleryPic
                      onPress={() => viewImage(3)}
                      profile={profile}
                      source={profile.pics[3]}
                    />

                    <GalleryPic
                      onPress={() => viewImage(4)}
                      profile={profile}
                      source={profile.pics[4]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Background>
  );
}
