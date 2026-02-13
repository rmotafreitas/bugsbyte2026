import React from "react";
import { View, StyleSheet } from "react-native";
import { THEME } from "../constants/theme";
import { Skeleton } from "./skeleton";

export const PersonalInfoSkeleton = () => (
  <View style={styles.infoCard}>
    <View style={styles.infoHeader}>
      <Skeleton width={24} height={24} style={styles.headerIcon} />
      <Skeleton width={150} height={24} />
    </View>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.infoRow}>
        <Skeleton width={100} height={20} />
        <Skeleton width={120} height={20} />
      </View>
    ))}
  </View>
);

export const EvaluationSkeleton = () => (
  <View style={styles.evaluationCard}>
    <View style={styles.infoHeader}>
      <Skeleton width={24} height={24} style={styles.headerIcon} />
      <Skeleton width={150} height={24} />
    </View>
    <View style={styles.evaluationContent}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          width="100%"
          height={16}
          style={styles.evaluationLine}
        />
      ))}
    </View>
  </View>
);

export const EnneagramSkeleton = () => (
  <View style={styles.enneagramCard}>
    <View style={styles.enneagramContent}>
      <Skeleton width={40} height={40} style={styles.enneagramIcon} />
      <View style={styles.enneagramText}>
        <Skeleton width={120} height={20} />
        <Skeleton width={100} height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  infoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIcon: {
    marginRight: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  evaluationCard: {
    margin: 20,
    padding: 20,
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
  },
  evaluationContent: {
    marginTop: 16,
  },
  evaluationLine: {
    marginBottom: 8,
  },
  enneagramCard: {
    margin: 20,
    padding: 16,
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
  },
  enneagramContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  enneagramIcon: {
    marginRight: 16,
  },
  enneagramText: {
    flex: 1,
  },
});
