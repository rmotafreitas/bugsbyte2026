// screens/wallet/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation";
import { BalanceService } from "../../core/services/balance.service";
import { Transaction } from "../../core/domain/balance";
import { AnimatedBalance } from "../../components/animated-balance";
import { LoadingSpinner } from "../../components/loading-spinner";
import { styles } from "./styles";
import { THEME } from "../../constants/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Wallet">;

export function WalletScreen({ navigation }: Props) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"deposit" | "withdrawal">(
    "deposit",
  );
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadData();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        BalanceService.getBalance(),
        BalanceService.getTransactions(),
      ]);
      setBalance(balanceData.balance);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading wallet data:", error);
      Alert.alert("Error", "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleDeposit = () => {
    setModalType("deposit");
    setAmount("");
    setModalVisible(true);
  };

  const handleWithdrawal = () => {
    setModalType("withdrawal");
    setAmount("");
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (modalType === "withdrawal" && numAmount > balance) {
      Alert.alert("Insufficient Funds", "You don't have enough balance");
      return;
    }

    try {
      setProcessing(true);

      if (modalType === "deposit") {
        await BalanceService.deposit(numAmount);
      } else {
        await BalanceService.withdraw(numAmount);
      }

      await loadData();
      setModalVisible(false);
      setAmount("");

      Alert.alert(
        "Success",
        `${modalType === "deposit" ? "Deposit" : "Withdrawal"} completed successfully`,
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Transaction failed");
    } finally {
      setProcessing(false);
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
      <Text style={styles.headerTitle}>Wallet</Text>
      <TouchableOpacity style={styles.historyButton}>
        <Ionicons
          name="time-outline"
          size={24}
          color={THEME.colors.foreground}
        />
      </TouchableOpacity>
    </View>
  );

  const renderBalanceCard = () => (
    <Animated.View
      style={[
        styles.balanceCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.balanceCardGradient} />
      <Text style={styles.balanceLabel}>Available Balance</Text>
      <AnimatedBalance value={balance} fontSize={56} color="#FFFFFF" />
      <View style={styles.balanceActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: THEME.colors.primary },
            ]}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleWithdrawal}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#FF6B6B" }]}>
            <Ionicons name="remove" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isDeposit = transaction.type === "deposit";
    const icon = isDeposit ? "arrow-down" : "arrow-up";
    const iconColor = isDeposit ? THEME.colors.primary : "#FF6B6B";
    const amountPrefix = isDeposit ? "+" : "-";

    return (
      <View key={transaction.id} style={styles.transactionItem}>
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
      </View>
    );
  };

  const renderTransactions = () => (
    <View style={styles.transactionsSection}>
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="wallet-outline"
            size={48}
            color={THEME.colors.mutedForeground}
          />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Make your first deposit to get started
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

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalType === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons
                name="close"
                size={24}
                color={THEME.colors.foreground}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>€</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={THEME.colors.mutedForeground}
              autoFocus
            />
          </View>

          <View style={styles.quickAmounts}>
            {[10, 50, 100, 500].map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmount(value)}
              >
                <Text style={styles.quickAmountText}>€{value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {modalType === "withdrawal" && (
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceInfoText}>
                Available: €{balance.toFixed(2)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              processing && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={processing}
          >
            {processing ? (
              <LoadingSpinner size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {modalType === "deposit" ? "Deposit" : "Withdraw"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
        {renderBalanceCard()}
        {renderTransactions()}
      </ScrollView>
      {renderModal()}
    </SafeAreaView>
  );
}
