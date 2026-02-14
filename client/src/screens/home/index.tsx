// screens/home/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedBalance } from "../../components/animated-balance";
import { LoadingSpinner } from "../../components/loading-spinner";
import { THEME } from "../../constants/theme";
import { BalanceService } from "../../core/services/balance.service";
import { MainTabParamList, RootStackParamList } from "../../navigation";
import { styles } from "./styles";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

interface ArbitrageSnipe {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  profit: number;
  time: string;
  type: string;
}

export function HomeScreen({ navigation }: Props) {
  const [autoTradeEnabled, setAutoTradeEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [balance, setBalance] = React.useState(0);
  const [tradingValue, setTradingValue] = React.useState(0);
  const [tradingChange, setTradingChange] = React.useState(0);
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  // Mock data for demonstration
  const totalEquity = "€10,245.80";
  const dailyChange = "+€145.20";
  const dailyChangePercent = "+1.42%";
  const engineStatus = "Scanning...";
  const latency = "45ms";
  const spread = "0.15%";

  const recentSnipes: ArbitrageSnipe[] = [
    {
      id: "1",
      pair: "BTC/USDT",
      buyExchange: "Binance",
      sellExchange: "Uphold",
      profit: 12.5,
      time: "10:42:05",
      type: "Atomic",
    },
    {
      id: "2",
      pair: "ETH/USDT",
      buyExchange: "Binance",
      sellExchange: "Uphold",
      profit: 8.3,
      time: "10:41:22",
      type: "Snipe",
    },
    {
      id: "3",
      pair: "SOL/USDT",
      buyExchange: "Uphold",
      sellExchange: "Binance",
      profit: 15.8,
      time: "10:40:45",
      type: "Limit",
    },
    {
      id: "4",
      pair: "BTC/USDT",
      buyExchange: "Binance",
      sellExchange: "Uphold",
      profit: 9.2,
      time: "10:39:18",
      type: "Atomic",
    },
  ];

  React.useEffect(() => {
    // Pulsing animation for the connection line
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleDeposit = () => {
    navigation.navigate("Wallet");
  };

  const handleWithdraw = () => {
    navigation.navigate("Wallet");
  };

  const handleExchange = () => {
    // TODO: Implement exchange feature
    navigation.navigate("Wallet");
  };

  const handleDetails = () => {
    navigation.navigate("Transactions");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Background gradient effect - MUST be first so it renders behind everything */}
      <View style={styles.headerGradient} />

      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person" size={20} color={THEME.colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Wallet Balance */}
      <View style={styles.equityContainer}>
        <Text style={styles.equityLabel}>Main Account</Text>
        <AnimatedBalance
          value={balance}
          fontSize={48}
          color={THEME.colors.foreground}
        />
        {/* Trading Value */}
        <View style={styles.tradingValueContainer}>
          <Text style={styles.tradingLabel}>Trading: </Text>
          <Text style={styles.tradingValue}>€{tradingValue.toFixed(2)}</Text>
          <Text style={styles.tradingLabel}>
            {tradingChange >= 0 ? "+" : "-"}
          </Text>
          <Text
            style={[
              styles.tradingChange,
              { color: tradingChange >= 0 ? THEME.colors.primary : "#FF6B6B" },
            ]}
          >
            €{Math.abs(tradingChange).toFixed(2)}
          </Text>
          <Text style={styles.tradingLabel}> = </Text>
          <Text style={styles.tradingResult}>
            €{(tradingValue + tradingChange).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDeposit}>
          <View style={styles.actionBtnIcon}>
            <Ionicons name="add" size={20} color={THEME.colors.primary} />
          </View>
          <Text style={styles.actionBtnText}>Deposit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleWithdraw}>
          <View style={styles.actionBtnIcon}>
            <Ionicons name="wallet" size={20} color="#FF6B6B" />
          </View>
          <Text style={styles.actionBtnText}>Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleExchange}>
          <View style={styles.actionBtnIcon}>
            <Ionicons
              name="swap-horizontal"
              size={20}
              color={THEME.colors.primary}
            />
          </View>
          <Text style={styles.actionBtnText}>Exchange</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleDetails}>
          <View style={styles.actionBtnIcon}>
            <Ionicons
              name="receipt-outline"
              size={20}
              color={THEME.colors.primary}
            />
          </View>
          <Text style={styles.actionBtnText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSnipeCard = (snipe: ArbitrageSnipe, index: number) => (
    <View
      key={snipe.id}
      style={[styles.snipeCard, index === 0 && styles.snipeCardActive]}
    >
      <View style={styles.snipeHeader}>
        <View style={styles.snipeLeft}>
          <Text style={styles.snipePair}>{snipe.pair}</Text>
          <View style={styles.snipePath}>
            <Text style={styles.snipeExchange}>{snipe.buyExchange}</Text>
            <Ionicons
              name="arrow-forward"
              size={12}
              color={THEME.colors.mutedForeground}
              style={{ marginHorizontal: 4 }}
            />
            <Text style={styles.snipeExchange}>{snipe.sellExchange}</Text>
          </View>
        </View>
        <View style={styles.snipeRight}>
          <Text style={styles.snipeTime}>{snipe.time}</Text>
          <View style={styles.snipeTypeBadge}>
            <Text style={styles.snipeTypeText}>{snipe.type}</Text>
          </View>
        </View>
      </View>
      <View style={styles.snipeProfit}>
        <Text style={styles.snipeProfitAmount}>
          +€{snipe.profit.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderLiveSnipes = () => (
    <View style={styles.snipesSection}>
      <View style={styles.snipesHeader}>
        <Text style={styles.cardTitle}>Live Opportunities</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveIndicator} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      {recentSnipes.map((snipe, index) => renderSnipeCard(snipe, index))}
    </View>
  );

  const renderSafetyFooter = () => (
    <View style={styles.safetyFooter}>
      <View style={styles.safetyItem}>
        <Ionicons name="lock-closed" size={14} color={THEME.colors.primary} />
        <Text style={styles.safetyText}>Liquidity Pool: Locked (€100)</Text>
      </View>
      <View style={styles.safetyItem}>
        <Ionicons
          name="shield-checkmark"
          size={14}
          color={THEME.colors.primary}
        />
        <Text style={styles.safetyText}>Slippage Protection: ON (0.5%)</Text>
      </View>
    </View>
  );

  useFocusEffect(
    React.useCallback(() => {
      // Simulate data fetching
      setLoading(false);

      // Load balance
      loadBalance();
    }, []),
  );

  const loadBalance = async () => {
    try {
      const balanceData = await BalanceService.getBalance();
      setBalance(balanceData.balance);

      // Mock trading value (this would come from actual trading data)
      setTradingValue(balanceData.balance * 0.05); // 5% of balance in trading
      setTradingChange(Math.random() * 20 - 10); // Random change for demo
    } catch (error) {
      console.error("Error loading balance:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        {loading ? <LoadingSpinner /> : <>{renderLiveSnipes()}</>}
      </ScrollView>

      {renderSafetyFooter()}
    </SafeAreaView>
  );
}
