import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { MyStatusBar } from "../../components/my-status-bar";
import { THEME } from "../../constants/theme";
import { CLOTHING_PREFERENCES, GENDERS } from "../../constants/constants";
import { useAuth } from "../../contexts/auth";
import { styles } from "./styles";

export function Register() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);

  const pickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to continue.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const togglePreference = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return photos.length >= 1;
      case 1:
        return name.trim().length > 0;
      case 2:
        return gender.length > 0;
      case 3:
        return (
          birthDay.length > 0 && birthMonth.length > 0 && birthYear.length === 4
        );
      case 4:
        return preferences.length >= 1;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Registration complete — navigate automatically via auth state change
      // Mock registration for testing
      await login({
        email: "test@example.com",
        password: "password123",
      });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderPhotosStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your photos</Text>
      <Text style={styles.stepSubtitle}>
        Add at least 1 photo to continue. Up to 6.
      </Text>
      <View style={styles.photosGrid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.photoSlot,
              photos[index] ? styles.photoSlotFilled : {},
            ]}
            onPress={() =>
              photos[index] ? removePhoto(index) : pickImage(index)
            }
            activeOpacity={0.7}
          >
            {photos[index] ? (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: photos[index] }}
                  style={styles.photoImage}
                />
                <View style={styles.photoRemove}>
                  <Text style={styles.photoRemoveText}>×</Text>
                </View>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderIcon}>+</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNameStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What's your name?</Text>
      <Text style={styles.stepSubtitle}>
        This is how you'll appear on your profile.
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder="Your name"
        placeholderTextColor={THEME.COLORS.CAPTION_400}
        value={name}
        onChangeText={setName}
        autoFocus
        autoCapitalize="words"
      />
    </View>
  );

  const renderGenderStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>I identify as</Text>
      <Text style={styles.stepSubtitle}>Select your gender identity.</Text>
      <View style={styles.optionsList}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.optionButton,
              gender === g && styles.optionButtonActive,
            ]}
            onPress={() => setGender(g)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                gender === g && styles.optionTextActive,
              ]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBirthdayStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>When were you born?</Text>
      <Text style={styles.stepSubtitle}>
        Your age will be shown on your profile.
      </Text>
      <View style={styles.birthdayRow}>
        <TextInput
          style={[styles.textInput, styles.birthdayInput]}
          placeholder="DD"
          placeholderTextColor={THEME.COLORS.CAPTION_400}
          value={birthDay}
          onChangeText={(t) =>
            setBirthDay(t.replace(/[^0-9]/g, "").slice(0, 2))
          }
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextInput
          style={[styles.textInput, styles.birthdayInput]}
          placeholder="MM"
          placeholderTextColor={THEME.COLORS.CAPTION_400}
          value={birthMonth}
          onChangeText={(t) =>
            setBirthMonth(t.replace(/[^0-9]/g, "").slice(0, 2))
          }
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextInput
          style={[styles.textInput, styles.birthdayInputYear]}
          placeholder="YYYY"
          placeholderTextColor={THEME.COLORS.CAPTION_400}
          value={birthYear}
          onChangeText={(t) =>
            setBirthYear(t.replace(/[^0-9]/g, "").slice(0, 4))
          }
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your style</Text>
      <Text style={styles.stepSubtitle}>
        Select the styles that define you. At least 1.
      </Text>
      <View style={styles.preferencesGrid}>
        {CLOTHING_PREFERENCES.map((pref) => (
          <TouchableOpacity
            key={pref}
            style={[
              styles.preferenceChip,
              preferences.includes(pref) && styles.preferenceChipActive,
            ]}
            onPress={() => togglePreference(pref)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.preferenceChipText,
                preferences.includes(pref) && styles.preferenceChipTextActive,
              ]}
            >
              {pref}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const steps = [
    renderPhotosStep,
    renderNameStep,
    renderGenderStep,
    renderBirthdayStep,
    renderPreferencesStep,
  ];

  return (
    <View style={styles.container}>
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ZARA STYLE</Text>
          <View style={styles.backButton} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Step content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {steps[step]()}
        </ScrollView>

        {/* Continue button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !canProceed() && styles.continueButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.continueButtonText,
                !canProceed() && styles.continueButtonTextDisabled,
              ]}
            >
              {step === 4 ? "GET STARTED" : "CONTINUE"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
