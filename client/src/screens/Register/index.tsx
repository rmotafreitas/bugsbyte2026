import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
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
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<
    { uri: string; width: number; height: number }[]
  >([]);
  const [gender, setGender] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      aspect: [9, 16] as [number, number],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newPhotos = [...photos];
      newPhotos[index] = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      };
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
      case 5:
        return (
          email.trim().length > 0 &&
          password.trim().length >= 4 &&
          password === confirmPassword
        );
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Final step — submit registration
      setLoading(true);
      try {
        const dateOfBirth = `${birthDay.padStart(2, "0")}/${birthMonth.padStart(2, "0")}/${birthYear}`;
        const success = await register({
          email: email.trim(),
          password: password.trim(),
          username: name.trim().toLowerCase().replace(/\s+/g, "_"),
          name: name.trim(),
          gender,
          dateOfBirth,
          preferences,
          photos: photos.filter(Boolean),
        });
        if (!success) {
          Alert.alert(
            "Registration Failed",
            "Could not create your account. The email may already be in use.",
          );
        }
        // On success, auth state changes and navigation happens automatically
      } catch (error) {
        console.error("Registration error:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
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
                  source={{ uri: photos[index].uri }}
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

  const renderAccountStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Create account</Text>
      <Text style={styles.stepSubtitle}>
        Enter your email and choose a password.
      </Text>
      <View style={styles.accountForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.formInput}
            placeholder="your@email.com"
            placeholderTextColor={THEME.COLORS.CAPTION_400}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Min. 4 characters"
            placeholderTextColor={THEME.COLORS.CAPTION_400}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm password</Text>
          <TextInput
            style={[
              styles.formInput,
              confirmPassword.length > 0 &&
                password !== confirmPassword &&
                styles.formInputError,
            ]}
            placeholder="Re-enter your password"
            placeholderTextColor={THEME.COLORS.CAPTION_400}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <Text style={styles.errorText}>Passwords don't match</Text>
          )}
        </View>
      </View>
    </View>
  );

  const TOTAL_STEPS = 6;

  const steps = [
    renderPhotosStep,
    renderNameStep,
    renderGenderStep,
    renderBirthdayStep,
    renderPreferencesStep,
    renderAccountStep,
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
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
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
              (!canProceed() || loading) && styles.continueButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={THEME.COLORS.WHITE_TEXT} />
            ) : (
              <Text
                style={[
                  styles.continueButtonText,
                  !canProceed() && styles.continueButtonTextDisabled,
                ]}
              >
                {step === TOTAL_STEPS - 1 ? "GET STARTED" : "CONTINUE"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
