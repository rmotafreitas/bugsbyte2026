import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { styles } from "./styles";
import DistanceIcon from "../../assets/buttons/distance.png";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import SwipeRightIcon from "../../assets/buttons/swipe_right.png";
import SwipeLeftIcon from "../../assets/buttons/swipe_left.png";

interface Props {
  profile: any;
  index: number;
  onSwipe: (direction: "left" | "right") => void;
}

interface DotProps {
  active: boolean;
}

function Dot({ active }: DotProps) {
  return (
    <View
      style={[
        styles.dot,
        {
          opacity: active ? 1 : 0.5,
        },
      ]}
    />
  );
}

export function Profile({ profile, index, onSwipe }: Props) {
  let position = new Animated.ValueXY();
  let panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      //return true if user is swiping, return false if it's a single click
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onStartShouldSetPanResponder: () => false,
    onPanResponderMove: (evt, gestureState) => {
      // console.log(gestureState);
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (evt, gestureState) => {
      // console.log(gestureState);
      // reset position in a smooth way

      if (gestureState.dx > 120) {
        // Code for swipe right
        Animated.spring(position, {
          toValue: {
            x: Dimensions.get("window").width + 100,
            y: gestureState.dy,
          },
          useNativeDriver: false,
        }).start(() => {
          position.setValue({ x: 0, y: 0 });
          setPicIndex(0);
          onSwipe("right");
        });
      } else if (gestureState.dx < -120) {
        Animated.spring(position, {
          toValue: {
            x: -Dimensions.get("window").width - 100,
            y: gestureState.dy,
          },
          useNativeDriver: false,
        }).start(() => {
          position.setValue({ x: 0, y: 0 });
          setPicIndex(0);
          onSwipe("left");
        });
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });
  let rotate = position.x.interpolate({
    inputRange: [
      -Dimensions.get("window").width / 2,
      0,
      Dimensions.get("window").width / 2,
    ],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });
  let rotateAndTranslate = {
    transform: [
      {
        rotate: rotate,
      },
      ...position.getTranslateTransform(),
    ],
  };
  let ikeOpacity = position.x.interpolate({
    inputRange: [
      -Dimensions.get("window").width / 2,
      0,
      Dimensions.get("window").width / 2,
    ],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [
      -Dimensions.get("window").width / 2,
      0,
      Dimensions.get("window").width / 2,
    ],
    outputRange: [1, 0, 0],
    extrapolate: "clamp",
  });

  const navigation = useNavigation();

  profile.pics = [
    profile.picture.large,
    "https://i.imgur.com/qoJLIvB.png",
    "https://i.imgur.com/7rSuEom.png",
    "https://i.imgur.com/qw8JpFi.png",
    "https://i.imgur.com/m98k8Vr.png",
  ];
  profile.pic = profile.pics[0];
  profile.dob.age = 20;
  const [picIndex, setPicIndex] = useState<number>(0);

  function nextPhoto() {
    if (Boolean(index)) return;
    setPicIndex((prev) => (prev + 1) % profile.pics.length);
  }

  function prevPhoto() {
    if (Boolean(index)) return;
    setPicIndex(
      (prev) => (prev - 1 + profile.pics.length) % profile.pics.length,
    );
  }

  function goToProfile() {
    navigation.navigate(
      "profileDetail" as never,
      {
        ...profile,
      } as never,
    );
  }

  return (
    <Animated.View
      {...(!Boolean(index) ? panResponder.panHandlers : {})}
      style={[
        !Boolean(index) && rotateAndTranslate,
        {
          height: "100%",
          width: "100%",
          position: "absolute",
          backgroundColor: "white",
          borderRadius: 8,
          overflow: "hidden",
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          opacity: ikeOpacity,
          position: "absolute",
          zIndex: 9,
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.15)",
          borderRadius: 8,
        }}
      >
        <View style={styles.decisionIndicator}>
          <Image source={SwipeRightIcon} />
        </View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={{
          opacity: nopeOpacity,
          position: "absolute",
          zIndex: 9,
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderRadius: 8,
        }}
      >
        <View style={styles.decisionIndicator}>
          <Image source={SwipeLeftIcon} />
        </View>
      </Animated.View>
      <ImageBackground
        source={{ uri: profile.pics[picIndex] }}
        imageStyle={styles.profileImage}
        style={styles.profile}
      >
        <View style={styles.touchesphotos}>
          <TouchableOpacity
            style={styles.touchesphotosBtn}
            onPress={prevPhoto}
          />
          <TouchableOpacity
            style={styles.touchesphotosBtn}
            onPress={nextPhoto}
          />
        </View>
        <View style={styles.distance}>
          <View>
            <Image source={DistanceIcon} style={styles.distanceIcon} />
          </View>
          <Text style={styles.distanceText}>7 km</Text>
        </View>
        <View style={styles.dots}>
          {profile.pics.map((pic: string, i: number) => (
            <Dot key={i} active={i === picIndex} />
          ))}
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={goToProfile}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            zIndex: 11,
          }}
        >
          <View style={[styles.blurmask, { position: "relative" }]}>
            <View style={styles.info}>
              <Text style={styles.name}>
                {profile.name.first} {profile.name.last}, {profile.dob.age}
              </Text>
              <Text style={styles.course}>Minimalist</Text>
            </View>
            <ImageBackground
              source={{ uri: profile.pics[picIndex] }}
              blurRadius={8}
              style={styles.profileBlur}
            ></ImageBackground>
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </Animated.View>
  );
}
