import "@/global.css";
import { useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain a lowercase letter";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain an uppercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain a number";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain a special character (!@#$%^&*)";
  }
  return null;
};

export default function SignUp() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showCodeField, setShowCodeField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    code?: string;
    general?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email";
    }

    const passwordError = validatePassword(password);
    if (!password) {
      errors.password = "Password is required";
    } else if (passwordError) {
      errors.password = passwordError;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      setFormErrors({});
      const res = await signUp!.password({
        emailAddress: email,
        password,
      });

      if (res.error) {
        setFormErrors({ general: res.error.message || "Sign up failed" });
        return;
      }

      if (
        signUp!.unverifiedFields.includes("email_address") ||
        signUp!.missingFields.includes("email_address")
      ) {
        await signUp!.verifications.sendEmailCode();
        setShowCodeField(true);
      } else if (signUp!.status === "complete") {
        await signUp!.finalize();
        router.push("/(tabs)" as Href);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Sign up failed";
      setFormErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!code.trim()) {
      setFormErrors({ code: "Verification code is required" });
      return;
    }

    setIsLoading(true);
    try {
      setFormErrors({});
      const res = await signUp!.verifications.verifyEmailCode({ code });

      if (res.error) {
        setFormErrors({ code: res.error.message || "Verification failed" });
        return;
      }

      if (signUp!.status === "complete") {
        await signUp!.finalize();
        router.push("/(tabs)" as Href);
      } else {
        setFormErrors({
          general: "Verification failed. Please try again.",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Verification failed";
      setFormErrors({ code: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    !formErrors.email &&
    !formErrors.password &&
    !formErrors.confirmPassword;

  return (
    <SafeAreaView className="auth-safe-area">
      <ScrollView className="auth-scroll" contentContainerClassName="auth-content">
        <View className="auth-brand-block">
          <View className="auth-logo-wrap">
            <View className="auth-logo-mark">
              <Text className="auth-logo-mark-text">R</Text>
            </View>
            <View>
              <Text className="auth-wordmark">Recurly</Text>
              <Text className="auth-wordmark-sub">Smart Billing</Text>
            </View>
          </View>
        </View>

        {showCodeField ? (
          <>
            <Text className="auth-title">Verify your email</Text>
            <Text className="auth-subtitle">
              Enter the code we sent to {email}
            </Text>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification Code</Text>
                  <TextInput
                    className={`auth-input ${
                      formErrors.code ? "auth-input-error" : ""
                    }`}
                    placeholder="Enter code"
                    placeholderTextColor="#999"
                    value={code}
                    onChangeText={setCode}
                    editable={!isLoading}
                    keyboardType="number-pad"
                  />
                  {formErrors.code && (
                    <Text className="auth-error">{formErrors.code}</Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${
                    isLoading || !code ? "auth-button-disabled" : ""
                  }`}
                  onPress={handleVerifyEmail}
                  disabled={isLoading || !code}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify</Text>
                  )}
                </Pressable>

                <Pressable
                  disabled={isLoading}
                  onPress={async () => {
                    const res = await signUp!.verifications.sendEmailCode();
                    if (res.error) {
                      setFormErrors({
                        general: res.error.message || "Failed to resend code",
                      });
                    }
                  }}
                >
                  <Text className="auth-link">Resend code</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Join Recurly to manage your subscriptions
            </Text>

            <View className="auth-card">
              <View className="auth-form">
                {formErrors.general && (
                  <Text className="auth-error">{formErrors.general}</Text>
                )}

                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={`auth-input ${
                      formErrors.email ? "auth-input-error" : ""
                    }`}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {formErrors.email && (
                    <Text className="auth-error">{formErrors.email}</Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${
                      formErrors.password ? "auth-input-error" : ""
                    }`}
                    placeholder="Create a password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                    secureTextEntry
                  />
                  {formErrors.password && (
                    <Text className="auth-error">{formErrors.password}</Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Confirm Password</Text>
                  <TextInput
                    className={`auth-input ${
                      formErrors.confirmPassword ? "auth-input-error" : ""
                    }`}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!isLoading}
                    secureTextEntry
                  />
                  {formErrors.confirmPassword && (
                    <Text className="auth-error">
                      {formErrors.confirmPassword}
                    </Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${
                    isLoading || !isFormValid ? "auth-button-disabled" : ""
                  }`}
                  onPress={handleSignUp}
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create Account</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in">
                <Text className="auth-link">Sign in</Text>
              </Link>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
