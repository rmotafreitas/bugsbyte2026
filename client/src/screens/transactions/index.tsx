// screens/transactions/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation";
import { BalanceService } from "../../core/services/balance.service";
import { Transaction } from "../../core/domain/balance";
import { LoadingSpinner } from "../../components/loading-spinner";
import { styles } from "./styles";
import { THEME } from "../../constants/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Transactions">;

interface AccountStats {
  totalDeposited: number;
  totalWithdrawn: number;
  netChange: number;
  transactionCount: number;
}

export function TransactionsScreen({ navigation }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<AccountStats>({
    totalDeposited: 0,
    totalWithdrawn: 0,
    netChange: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const transactionsData = await BalanceService.getTransactions();
      setTransactions(transactionsData);

      // Calculate stats
      const totalDeposited = transactionsData
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawn = transactionsData
        .filter((t) => t.type === "withdrawal")
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalDeposited,
        totalWithdrawn,
        netChange: totalDeposited - totalWithdrawn,
        transactionCount: transactionsData.length,
      });
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={THEME.colors.foreground} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Transaction History</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderStats = () => (
    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
      <Text style={styles.statsTitle}>Account Summary</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="arrow-down" size={20} color={THEME.colors.primary} />
          <Text style={styles.statLabel}>Total Deposited</Text>
          <Text style={styles.statValue}>
            €{stats.totalDeposited.toFixed(2)}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="arrow-up" size={20} color="#FF6B6B" />
          <Text style={styles.statLabel}>Total Withdrawn</Text>
          <Text style={styles.statValue}>
            €{stats.totalWithdrawn.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.statCard, styles.statCardWide]}>
          <Ionicons
            name={stats.netChange >= 0 ? "trending-up" : "trending-down"}
            size={20}
            color={stats.netChange >= 0 ? THEME.colors.primary : "#FF6B6B"}
          />
          <Text style={styles.statLabel}>Net Change</Text>
          <Text
            style={[
              styles.statValue,
              {
                color: stats.netChange >= 0 ? THEME.colors.primary : "#FF6B6B",
              },
            ]}
          >
            {stats.netChange >= 0 ? "+" : ""}€{stats.netChange.toFixed(2)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isDeposit = transaction.type === "deposit";
    const icon = isDeposit ? "arrow-down" : "arrow-up";
    const iconColor = isDeposit ? THEME.colors.primary : "#FF6B6B";
    const amountPrefix = isDeposit ? "+" : "-";

    return (
      <Animated.View
        key={transaction.id}
        style={[
          styles.transactionItem,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: `${iconColor}20` },
          ]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {isDeposit ? "Deposit" : "Withdrawal"}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(transaction.timestamp).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: iconColor }]}>
          {amountPrefix}€{transaction.amount.toFixed(2)}
        </Text>
      </Animated.View>
    );
  };

  const renderTransactions = () => (
    <View style={styles.transactionsSection}>
      <Text style={styles.sectionTitle}>
        All Transactions ({transactions.length})
      </Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="receipt-outline"
            size={48}
            color={THEME.colors.mutedForeground}
          />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Your transaction history will appear here
          </Text>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {transactions.map((transaction, index) =>
            renderTransaction(transaction, index),
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStats()}
        {renderTransactions()}
      </ScrollView>
    </SafeAreaView>
  );
}
