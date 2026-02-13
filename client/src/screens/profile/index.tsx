// import React, { useState } from "react";
// import {
//   Text,
//   View,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   Dimensions,
// } from "react-native";
// import { RadarChart } from "@salmonco/react-native-radar-chart";
// import Modal from "react-native-modal";
// import { Ionicons } from "@expo/vector-icons";
// import { useAuth } from "../../contexts/auth";
// import { styles } from "./styles";
// import { THEME } from "../../constants/theme";
// import { COUNTRIES } from "../../@types/country";
// import { useFocusEffect } from "@react-navigation/native";
// import { authService } from "../../core/services/auth.service";
// import { UserProfile } from "../../core/domain/user";
// import { LoadingSpinner } from "../../components/loading-spinner";
// import {
//   EnneagramSkeleton,
//   EvaluationSkeleton,
// } from "../../components/profile-skeletons";
// import * as WebBrowser from "expo-web-browser";
// import { chatService } from "../../core/services/chat.service";

// export function ProfileScreen() {
//   const { user, logout } = useAuth();
//   const [selectedTrait, setSelectedTrait] = useState<any>(null);
//   const [showEnneagramModal, setShowEnneagramModal] = useState(false);
//   const screenWidth = Dimensions.get("window").width;

//   if (!user) return null;

//   const getCountryFlag = (code: string) => {
//     const country = COUNTRIES.find((c) => c.code === code);
//     return country ? country.flag : "🌍";
//   };

//   const formatBirthDate = (date: Date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const calculateAge = (birthDate: Date) => {
//     const today = new Date();
//     const birth = new Date(birthDate);
//     let age = today.getFullYear() - birth.getFullYear();
//     const monthDiff = today.getMonth() - birth.getMonth();
//     if (
//       monthDiff < 0 ||
//       (monthDiff === 0 && today.getDate() < birth.getDate())
//     ) {
//       age--;
//     }
//     return age;
//   };

//   const [isFetching, setIsFetching] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [numberOfSessions, setNumberOfSessions] = useState(0);
//   const [numberOfEntriedInJournal, setNumberOfEntriesInJournal] = useState(0);
//   const [howOld, setHowOld] = useState(0);

//   const fetchProfile = async () => {
//     try {
//       setError(null);
//       setIsFetching(true);
//       const res = await authService.getProfile();
//       if (res) setProfile(res);
//       const allSessions = await chatService.getHistory();
//       if (allSessions) setNumberOfSessions(allSessions.length);
//       const allentries = await chatService.getCalendarEntries();
//       if (allentries) setNumberOfEntriesInJournal(allentries.length);
//       const dateOfBirth = user.dateOfCreation;
//       const today = new Date();
//       const diff = today.getTime() - dateOfBirth.getTime();
//       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//       const months = Math.floor(days / 30);
//       const years = Math.floor(months / 12);
//       setHowOld(years);
//     } catch (error) {
//       setError("Failed to load profile data");
//       console.error("Failed to fetch profile:", error);
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   // Add error handling UI
//   {
//     error && (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
//           <Text style={styles.retryText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   useFocusEffect(
//     React.useCallback(() => {
//       console.log("Fetching profile...");
//       fetchProfile();
//     }, [])
//   );

//   console.log(profile);

//   const handleTraitPress = (trait: any) => {
//     setSelectedTrait(trait);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView style={styles.scrollView}>
//         {/* USER HEADER */}
//         <View style={styles.header}>
//           <View style={styles.avatarContainer}>
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>
//                 {user.completeName.charAt(0).toUpperCase()}
//               </Text>
//             </View>
//             <View style={styles.nationalityBadge}>
//               <Text style={styles.nationalityText}>
//                 {getCountryFlag(user.nationality)}
//               </Text>
//             </View>
//           </View>
//           <Text style={styles.name}>{user.completeName}</Text>
//           <Text style={styles.email}>{user.email}</Text>
//         </View>

//         {/* PERSONAL INFO CARD */}
//         <View style={styles.infoCard}>
//           <View style={styles.infoSection}>
//             <View style={styles.infoHeader}>
//               <Ionicons name="person" size={24} color={THEME.colors.primary} />
//               <Text style={styles.infoTitle}>Personal Information</Text>
//             </View>

//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Age</Text>
//               <Text style={styles.infoValue}>
//                 {calculateAge(user.birthDate)} years old
//               </Text>
//             </View>

//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Birth Date</Text>
//               <Text style={styles.infoValue}>
//                 {formatBirthDate(user.birthDate)}
//               </Text>
//             </View>

//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Occupation</Text>
//               <Text style={styles.infoValue}>{user.occupation}</Text>
//             </View>

//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Nationality</Text>
//               <Text style={styles.infoValue}>
//                 {getCountryFlag(user.nationality)}{" "}
//                 {COUNTRIES.find((c) => c.code === user.nationality)?.name}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {isFetching ? (
//           <EvaluationSkeleton />
//         ) : (
//           <View style={styles.evaluationCard}>
//             <View style={styles.evaluationHeader}>
//               <Ionicons name="medal" size={24} color={THEME.colors.primary} />
//               <Text style={styles.evaluationTitle}>Global Evaluation</Text>
//             </View>
//             <Text style={styles.evaluationText}>{profile?.evaluation}</Text>
//           </View>
//         )}

//         {/* ENNEAGRAM SECTION */}
//         {!isFetching ? (
//           <TouchableOpacity
//             style={styles.enneagramCard}
//             onPress={() => setShowEnneagramModal(true)}
//           >
//             <View style={styles.enneagramContent}>
//               <View style={styles.enneagramTextContainer}>
//                 <Text style={styles.enneagramTitle}>
//                   Type {profile?.eneagrama.type}
//                 </Text>
//                 <Text style={styles.enneagramSub}>
//                   Tap for more information
//                 </Text>
//               </View>
//               <Ionicons
//                 name="chevron-forward"
//                 size={20}
//                 color={THEME.colors.mutedForeground}
//               />
//             </View>
//           </TouchableOpacity>
//         ) : (
//           <EnneagramSkeleton />
//         )}

//         {/* USER STATS */}
//         <View style={styles.statsContainer}>
//           <View style={styles.statCard}>
//             <Ionicons
//               name="chatbubble"
//               size={24}
//               color={THEME.colors.primary}
//             />
//             <Text style={styles.statNumber}>{numberOfSessions}</Text>
//             <Text style={styles.statLabel}>Sessions</Text>
//           </View>

//           <View style={styles.statCard}>
//             <Ionicons name="star" size={24} color={THEME.colors.primary} />
//             <Text style={styles.statNumber}>{numberOfEntriedInJournal}</Text>
//             <Text style={styles.statLabel}>Entries</Text>
//           </View>
//         </View>

//         {/* BIG FIVE RADAR CHART */}
//         {isFetching ? (
//           <LoadingSpinner />
//         ) : (
//           <View style={styles.personalityCard}>
//             <View style={styles.infoHeader}>
//               <Ionicons
//                 name="analytics"
//                 size={24}
//                 color={THEME.colors.primary}
//               />
//               <Text style={styles.infoTitle}>Personality Insights</Text>
//             </View>

//             <View style={styles.chartContainer}>
//               <RadarChart
//                 data={
//                   profile?.ocean
//                     ? Object.values(profile.ocean).map((trait) => ({
//                         label: trait.label,
//                         value: trait.value,
//                       }))
//                     : []
//                 }
//                 size={screenWidth - 80}
//                 maxValue={100}
//                 scale={0.9}
//                 fillColor={THEME.colors.background}
//                 gradientColor={{
//                   startColor: THEME.colors.primary,
//                   endColor: THEME.colors.background,
//                   count: 5,
//                 }}
//                 stroke={[
//                   THEME.colors.border,
//                   THEME.colors.border,
//                   THEME.colors.border,
//                   THEME.colors.border,
//                   THEME.colors.primary,
//                 ]}
//                 strokeWidth={[0.5, 0.5, 0.5, 0.5, 1.5]}
//                 strokeOpacity={[0.3, 0.3, 0.3, 0.3, 0.2]}
//                 labelSize={14}
//                 labelColor={THEME.colors.mutedForeground}
//                 labelDistance={1.2}
//                 dataFillColor={THEME.colors.primary}
//                 dataFillOpacity={0.15}
//                 dataStroke={THEME.colors.primary}
//                 dataStrokeWidth={2}
//                 dataStrokeOpacity={0.8}
//                 divisionStroke={THEME.colors.border}
//                 divisionStrokeWidth={1}
//                 divisionStrokeOpacity={0.3}
//                 isCircle
//               />
//             </View>

//             <Text style={styles.chartHelper}>
//               Tap on any trait to learn more about your personality profile
//             </Text>

//             <View style={styles.traitsLegend}>
//               {profile ? (
//                 Object.values(profile.ocean).map((trait, index) => (
//                   <TouchableOpacity
//                     key={trait.label}
//                     style={styles.traitItem}
//                     onPress={() => handleTraitPress(trait)}
//                   >
//                     <View style={styles.traitScore}>
//                       <Text style={styles.traitScoreText}>{trait.value}%</Text>
//                     </View>
//                     <Text style={styles.traitLabel}>{trait.label}</Text>
//                   </TouchableOpacity>
//                 ))
//               ) : (
//                 <LoadingSpinner />
//               )}
//             </View>
//           </View>
//         )}
//         {/* ACTION BUTTONS */}
//         <View style={styles.actionButtons}>
//           <TouchableOpacity
//             onPress={async () => {
//               const url = await authService.getPdfCompleteUrl();
//               await WebBrowser.openBrowserAsync(url);
//             }}
//             style={styles.downloadButton}
//           >
//             <Ionicons
//               name="document-text"
//               size={20}
//               color={THEME.colors.primaryForeground}
//             />
//             <Text style={styles.downloadText}>Download Medical Record</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.logoutButton} onPress={logout}>
//             <Ionicons
//               name="log-out"
//               size={20}
//               color={THEME.colors.destructiveForeground}
//             />
//             <Text style={styles.logoutText}>Logout</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Big Five Trait Modal */}
//         <Modal
//           isVisible={selectedTrait !== null}
//           onBackdropPress={() => setSelectedTrait(null)}
//           backdropOpacity={0.4}
//           animationIn="fadeIn"
//           animationOut="fadeOut"
//           style={styles.modal}
//         >
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{selectedTrait?.label}</Text>
//               <TouchableOpacity
//                 onPress={() => setSelectedTrait(null)}
//                 style={styles.modalClose}
//               >
//                 <Ionicons
//                   name="close"
//                   size={24}
//                   color={THEME.colors.mutedForeground}
//                 />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.modalScoreContainer}>
//               <Text style={styles.modalScoreLabel}>Score</Text>
//               <Text style={styles.modalScoreValue}>
//                 {selectedTrait?.value}%
//               </Text>
//             </View>
//             <Text style={styles.modalDescription}>
//               {selectedTrait?.description}
//             </Text>
//           </View>
//         </Modal>

//         {/* Enneagram Modal */}
//         <Modal
//           isVisible={showEnneagramModal}
//           onBackdropPress={() => setShowEnneagramModal(false)}
//           backdropOpacity={0.4}
//           animationIn="fadeIn"
//           animationOut="fadeOut"
//           style={styles.modal}
//         >
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 Enneagram Type {profile?.eneagrama.type}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => setShowEnneagramModal(false)}
//                 style={styles.modalClose}
//               >
//                 <Ionicons
//                   name="close"
//                   size={24}
//                   color={THEME.colors.mutedForeground}
//                 />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.modalScoreContainer}>
//               <Text style={styles.modalScoreLabel}>Details</Text>
//             </View>
//             <Text style={styles.modalDescription}>
//               {profile?.eneagrama.description}
//             </Text>
//           </View>
//         </Modal>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
