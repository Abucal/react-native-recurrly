import "@/global.css";
import { useSignIn } from "@clerk/expo";
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

export default function SignIn() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showMfaField, setShowMfaField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    code?: string;
    general?: string;
  }>({});

  const validateSignInForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateSignInForm()) return;

    setIsLoading(true);
    try {
      setFormErrors({});
      const res = await signIn!.password({
        emailAddress: email,
        password,
      });

      if (res.error) {
        setFormErrors({
          general: res.error.message || "Invalid email or password",
        });
        return;
      }

      if (signIn!.status === "needs_second_factor") {
        await signIn!.mfa.sendEmailCode();
        setShowMfaField(true);
      } else if (signIn!.status === "complete") {
        await signIn!.finalize();
        router.push("/(tabs)" as Href);
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "Invalid email or password. Please try again.";
      setFormErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    if (!code.trim()) {
      setFormErrors({ code: "Verification code is required" });
      return;
    }

    setIsLoading(true);
    try {
      setFormErrors({});
      const res = await signIn!.mfa.verifyEmailCode({ code });

      if (res.error) {
        setFormErrors({ code: res.error.message || "Verification failed" });
        return;
      }

      if (signIn!.status === "complete") {
        await signIn!.finalize();
        router.push("/(tabs)" as Href);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Verification failed";
      setFormErrors({ code: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const isSignInFormValid =
    email && password && !formErrors.email && !formErrors.password;

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

        {showMfaField ? (
          <>
            <Text className="auth-title">Verify your identity</Text>
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
                  onPress={handleMfaVerify}
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
                  onPress={() => {
                    setShowMfaField(false);
                    setCode("");
                  }}
                >
                  <Text className="auth-link">Back to sign in</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to continue managing your subscriptions
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
                    placeholder="Enter your password"
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

                <Pressable
                  className={`auth-button ${
                    isLoading || !isSignInFormValid ? "auth-button-disabled" : ""
                  }`}
                  onPress={handleSignIn}
                  disabled={isLoading || !isSignInFormValid}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly?</Text>
              <Link href="/(auth)/sign-up">
                <Text className="auth-link">Create an account</Text>
              </Link>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
