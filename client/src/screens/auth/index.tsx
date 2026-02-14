import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { THEME } from "../../constants/theme";
import { useAuth } from "../../contexts/auth";
import { UserAuthRequest, UserRegisterRequest } from "../../core/domain/user";
import { HttpRequestError } from "../../core/errors/http.error";
import { styles } from "./styles";

export function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [isRegister, setIsRegister] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    try {
      setError("");
      setLoading(true);

      if (isRegister) {
        if (!username || !email || !password) {
          throw new Error("Please fill in all fields");
        }

        const data: UserRegisterRequest = {
          email,
          password,
          username,
        };
        const success = await register(data);
        if (success) {
          setIsRegister(false);
          setError("");
        }
      } else {
        if (!email || !password) {
          throw new Error("Please fill in all fields");
        }

        const data: UserAuthRequest = {
          email,
          password,
        };
        await login(data);
      }
    } catch (err) {
      if (err instanceof HttpRequestError) {
        setError(err.message || "An error occurred");
      } else if (err instanceof Error) {
        setError(err.message);
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
      <View style={styles.inputContainer}>
        <Ionicons
          name="person"
          size={20}
          color={THEME.colors.mutedForeground}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={THEME.colors.mutedForeground}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>
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
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="flash"
              size={60}
              color={THEME.colors.primary}
            />
          </View>
          <Text style={styles.appName}>SPREAD HUNTERS</Text>
          <Text style={styles.title}>
            {isRegister ? "Create Your Account" : "Welcome Back"}
          </Text>
          <Text style={styles.subtitle}>
            {isRegister
              ? "Start hunting for arbitrage opportunities"
              : "Sign in to your trading dashboard"}
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
          {renderRegisterFields()}

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

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME.colors.primaryForeground} />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {isRegister ? "Create Account" : "Sign In"}
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={THEME.colors.primaryForeground}
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>

          {!isRegister && (
            <View style={styles.demoContainer}>
              <Ionicons
                name="information-circle"
                size={16}
                color={THEME.colors.secondary}
              />
              <Text style={styles.demoText}>
                Demo: trader@spreadhunters.com / demo123
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.switchAuth}
          onPress={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
        >
          <Text style={styles.switchAuthText}>
            {isRegister
              ? "Already hunting spreads? "
              : "New to spread hunting? "}
            <Text style={styles.switchAuthTextHighlight}>
              {isRegister ? "Sign In" : "Create Account"}
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={20}
              color={THEME.colors.primary}
            />
            <Text style={styles.featureText}>Real-time Arbitrage</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={THEME.colors.primary}
            />
            <Text style={styles.featureText}>Secure Trading</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="clock-fast"
              size={20}
              color={THEME.colors.primary}
            />
            <Text style={styles.featureText}>45ms Latency</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
