import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

import LikeButton from "../../assets/buttons/like.png";
import DislikeButton from "../../assets/buttons/dislike.png";
import StarButton from "../../assets/buttons/star.png";

interface Props {}

export function DecisionButtons({}: Props) {
  return (
    <View style={styles.buttons}>
      <TouchableOpacity style={styles.button}>
        <Image source={DislikeButton} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Image source={LikeButton} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Image source={StarButton} />
      </TouchableOpacity>
    </View>
  );
}
