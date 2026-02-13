import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { OCCUPATIONS } from "../../@types/occupation";
import { Role } from "../../@types/role";
import { THEME } from "../../constants/theme";
import { useAuth } from "../../contexts/auth";
import { UserAuthRequest, UserRegisterRequest } from "../../core/domain/user";
import { HttpRequestError } from "../../core/errors/http.error";
import { styles } from "./styles";
import { COUNTRIES } from "../../@types/country";

export function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isRegister, setIsRegister] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const ROLE: Role = "USER";
  const { login, register } = useAuth();
  const [completeName, setCompleteName] = React.useState("");
  const [birthDate, setBirthDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [occupation, setOccupation] = React.useState("");
  const [otherOccupation, setOtherOccupation] = React.useState("");
  const [nationality, setNationality] = React.useState("");
  const [openOccupation, setOpenOccupation] = React.useState(false);
  const [openNationality, setOpenNationality] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setError("");
      setLoading(true);

      if (isRegister) {
        if (!completeName || !birthDate || !occupation || !nationality) {
          throw new Error("Please fill in all fields");
        }

        const data: UserRegisterRequest = {
          email,
          password,
          role: ROLE,
          completeName,
          birthDate,
          occupation: occupation === "Other" ? otherOccupation : occupation,
          nationality,
        };
        const success = await register(data);
        if (success) {
          setIsRegister(false);
        }
      } else {
        const data: UserAuthRequest = {
          email,
          password,
        };
        await login(data);
      }
    } catch (err) {
      if (err instanceof HttpRequestError) {
        setError(err.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRegisterFields = () => {
    if (!isRegister) return null;

    return (
      <>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person"
            size={20}
            color={THEME.colors.mutedForeground}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Complete Name"
            placeholderTextColor={THEME.colors.mutedForeground}
            value={completeName}
            onChangeText={setCompleteName}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={THEME.colors.mutedForeground}
            style={styles.inputIcon}
          />
          <Text style={styles.datePickerText}>
            {birthDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setBirthDate(selectedDate);
            }}
            maximumDate={new Date()}
          />
        )}

        <View style={[styles.dropdownContainer, { zIndex: 2000 }]}>
          <DropDownPicker
            open={openOccupation}
            value={occupation}
            items={[...OCCUPATIONS.map((occ) => ({ label: occ, value: occ }))]}
            setOpen={setOpenOccupation}
            setValue={setOccupation}
            placeholder="Select Occupation"
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            zIndex={2000}
            zIndexInverse={1000}
            listMode="SCROLLVIEW"
          />
        </View>

        {occupation === "Other" && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Specify Occupation"
              placeholderTextColor={THEME.colors.mutedForeground}
              value={otherOccupation}
              onChangeText={setOtherOccupation}
            />
          </View>
        )}

        <View style={[styles.dropdownContainer, { zIndex: 1000 }]}>
          <DropDownPicker
            open={openNationality}
            value={nationality}
            items={COUNTRIES.map((country) => ({
              label: `${country.flag} ${country.name}`,
              value: country.code,
            }))}
            setOpen={setOpenNationality}
            setValue={setNationality}
            placeholder="Select Nationality"
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            zIndex={2000}
            zIndexInverse={3000}
            listMode="SCROLLVIEW"
          />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === "ios"}
        keyboardShouldPersistTaps="handled"
        extraHeight={150}
        scrollEnabled={!openOccupation && !openNationality}
      >
        <View style={styles.header}>
          <Ionicons
            name="person-circle"
            size={80}
            color={THEME.colors.primary}
          />
          <Text style={styles.title}>
            {isRegister ? "Create Account" : "Welcome Back"}
          </Text>
          <Text style={styles.subtitle}>
            {isRegister ? "Sign up to get started" : "Sign in to continue"}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={20}
              color={THEME.colors.destructive}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail"
              size={20}
              color={THEME.colors.mutedForeground}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={THEME.colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color={THEME.colors.mutedForeground}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={THEME.colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={THEME.colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {renderRegisterFields()}

          {!isRegister && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME.colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>
                {isRegister ? "Create Account" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.switchAuth}
          onPress={() => setIsRegister(!isRegister)}
        >
          <Text style={styles.switchAuthText}>
            {isRegister
              ? "Already have an account? "
              : "Don't have an account? "}
            <Text style={styles.switchAuthTextHighlight}>
              {isRegister ? "Sign In" : "Sign Up"}
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
