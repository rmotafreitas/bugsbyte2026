import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../contexts/auth";
import { MyStatusBar } from "../../components/my-status-bar";
import { CONFIG } from "../../constants/config";
import { CLOTHING_PREFERENCES, GENDERS } from "../../constants/constants";
import { styles } from "./styles";

type PhotoItem = { uri: string; width: number; height: number } | null;

export function Me() {
  const { user, logout, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Editable fields
  const [name, setName] = useState(user?.name || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "");
  const [preferences, setPreferences] = useState<string[]>(
    user?.preferences || [],
  );
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    // Initialize from user images
    if (user?.images && user.images.length > 0) {
      const items: PhotoItem[] = user.images.map((img) => ({
        uri: `${CONFIG.API.BASE_URL}${img.imageUrl}`,
        width: img.width,
        height: img.height,
      }));
      // Pad to 4 slots
      while (items.length < 4) items.push(null);
      return items;
    }
    return [null, null, null, null];
  });
  const [photosChanged, setPhotosChanged] = useState(false);

  const resetForm = useCallback(() => {
    setName(user?.name || "");
    setGender(user?.gender || "");
    setDateOfBirth(user?.dateOfBirth || "");
    setPreferences(user?.preferences || []);
    setPhotos(() => {
      if (user?.images && user.images.length > 0) {
        const items: PhotoItem[] = user.images.map((img) => ({
          uri: `${CONFIG.API.BASE_URL}${img.imageUrl}`,
          width: img.width,
          height: img.height,
        }));
        while (items.length < 4) items.push(null);
        return items;
      }
      return [null, null, null, null];
    });
    setPhotosChanged(false);
    setEditing(false);
  }, [user]);

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
      setPhotosChanged(true);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
    setPhotosChanged(true);
  };

  const togglePreference = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    setLoading(true);
    try {
      const validPhotos = photos.filter(
        (p): p is NonNullable<PhotoItem> => !!p,
      );

      const success = await updateUser({
        name: name.trim(),
        gender,
        dateOfBirth,
        preferences,
        ...(photosChanged && validPhotos.length > 0
          ? { photos: validPhotos }
          : {}),
      });

      if (success) {
        setEditing(false);
        setPhotosChanged(false);
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  if (!user) return null;

  const mainPhoto = photos[0]?.uri ? photos[0].uri : undefined;

  return (
    <View style={styles.container}>
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Avatar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={editing ? () => pickImage(0) : undefined}
            activeOpacity={editing ? 0.7 : 1}
          >
            {mainPhoto ? (
              <Image source={{ uri: mainPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            {editing && (
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditBadgeText}>✎</Text>
              </View>
            )}
          </TouchableOpacity>

          {!editing && (
            <>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {editing ? (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  loading && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>SAVE</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButtonText}>EDIT PROFILE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Photos Grid (edit mode) */}
        {editing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoSlot}
                  onPress={() =>
                    photo ? removePhoto(index) : pickImage(index)
                  }
                >
                  {photo ? (
                    <>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.photoImage}
                      />
                      <View style={styles.photoRemoveBadge}>
                        <Text style={styles.photoRemoveBadgeText}>✕</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoPlaceholderText}>+</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Photos Gallery (view mode) */}
        {!editing && photos.some((p) => p !== null) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosHorizontal}
            >
              {photos
                .filter((p): p is NonNullable<PhotoItem> => !!p)
                .map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo.uri }}
                    style={styles.photoPreview}
                  />
                ))}
            </ScrollView>
          </View>
        )}

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Name</Text>
          {editing ? (
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.sectionValue}>{user.name || "—"}</Text>
          )}
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          {editing ? (
            <View style={styles.optionsList}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.optionButton,
                    gender === g && styles.optionButtonActive,
                  ]}
                  onPress={() => setGender(g)}
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
          ) : (
            <Text style={styles.sectionValue}>{user.gender || "—"}</Text>
          )}
        </View>

        {/* Date of Birth */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date of Birth</Text>
          {editing ? (
            <TextInput
              style={styles.textInput}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.sectionValue}>{user.dateOfBirth || "—"}</Text>
          )}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Preferences</Text>
          {editing ? (
            <View style={styles.preferencesGrid}>
              {CLOTHING_PREFERENCES.map((pref) => (
                <TouchableOpacity
                  key={pref}
                  style={[
                    styles.preferenceChip,
                    preferences.includes(pref) && styles.preferenceChipActive,
                  ]}
                  onPress={() => togglePreference(pref)}
                >
                  <Text
                    style={[
                      styles.preferenceChipText,
                      preferences.includes(pref) &&
                        styles.preferenceChipTextActive,
                    ]}
                  >
                    {pref}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.preferencesGrid}>
              {(user.preferences || []).map((pref) => (
                <View
                  key={pref}
                  style={[styles.preferenceChip, styles.preferenceChipActive]}
                >
                  <Text
                    style={[
                      styles.preferenceChipText,
                      styles.preferenceChipTextActive,
                    ]}
                  >
                    {pref}
                  </Text>
                </View>
              ))}
              {(!user.preferences || user.preferences.length === 0) && (
                <Text style={styles.sectionValue}>—</Text>
              )}
            </View>
          )}
        </View>

        {/* Account Info (read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Email</Text>
            <Text style={styles.accountValue}>{user.email}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Username</Text>
            <Text style={styles.accountValue}>{user.username}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Member since</Text>
            <Text style={styles.accountValue}>
              {user.dateOfCreation
                ? new Date(user.dateOfCreation).toLocaleDateString()
                : "—"}
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>LOG OUT</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
