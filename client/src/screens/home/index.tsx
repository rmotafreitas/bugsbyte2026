// screens/home/index.tsx
import React from "react";
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Switch,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./styles";
import { THEME } from "../../constants/theme";
import {
  CompositeScreenProps,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainTabParamList, RootStackParamList } from "../../navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LoadingSpinner } from "../../components/loading-spinner";

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

  const renderHeader = () => (
    <View style={styles.header}>
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={THEME.colors.foreground} />
        </View>
      </View>

      {/* Total Equity */}
      <View style={styles.equityContainer}>
        <Text style={styles.equityLabel}>Total Equity</Text>
        <Text style={styles.equityAmount}>{totalEquity}</Text>
        <View style={styles.changeBadge}>
          <Ionicons name="trending-up" size={14} color={THEME.colors.primary} />
          <Text style={styles.changeText}>
            {dailyChange} ({dailyChangePercent})
          </Text>
        </View>
      </View>

      {/* Background gradient effect */}
      <View style={styles.headerGradient} />
    </View>
  );

  const renderEngineStatus = () => (
    <View style={styles.engineCard}>
      <View style={styles.engineHeader}>
        <Text style={styles.cardTitle}>Arbitrage Engine</Text>
        <Switch
          value={autoTradeEnabled}
          onValueChange={setAutoTradeEnabled}
          trackColor={{ false: "#3A3A3A", true: THEME.colors.primary }}
          thumbColor={"#FFFFFF"}
          ios_backgroundColor="#3A3A3A"
        />
      </View>

      {/* Exchange Connection Visual */}
      <View style={styles.exchangeConnection}>
        {/* Binance */}
        <View style={styles.exchangeIcon}>
          <View style={[styles.exchangeBadge, { backgroundColor: "#F3BA2F" }]}>
            <MaterialCommunityIcons name="bitcoin" size={28} color="#0A0A0A" />
          </View>
          <Text style={styles.exchangeName}>Binance</Text>
        </View>

        {/* Connection Line */}
        <View style={styles.connectionLineContainer}>
          <Animated.View
            style={[
              styles.connectionLine,
              {
                opacity: pulseAnim,
              },
            ]}
          />
          <View style={styles.connectionLineBg} />
          <Ionicons
            name="arrow-forward"
            size={16}
            color={THEME.colors.primary}
            style={styles.connectionArrow}
          />
        </View>

        {/* Uphold */}
        <View style={styles.exchangeIcon}>
          <View style={[styles.exchangeBadge, { backgroundColor: "#27AB6E" }]}>
            <MaterialCommunityIcons name="wallet" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.exchangeName}>Uphold</Text>
        </View>
      </View>

      {/* Status Metrics */}
      <View style={styles.statusMetrics}>
        <View style={styles.metricItem}>
          <View style={styles.statusDot} />
          <Text style={styles.metricLabel}>Status</Text>
          <Text style={styles.metricValue}>{engineStatus}</Text>
        </View>
        <View style={styles.metricItem}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: THEME.colors.primary },
            ]}
          />
          <Text style={styles.metricLabel}>Latency</Text>
          <Text style={styles.metricValue}>{latency}</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="flash" size={12} color={THEME.colors.warning} />
          <Text style={styles.metricLabel}>Spread</Text>
          <Text style={styles.metricValue}>{spread}</Text>
        </View>
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
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {renderEngineStatus()}
            {renderLiveSnipes()}
          </>
        )}
      </ScrollView>

      {renderSafetyFooter()}
    </SafeAreaView>
  );
}
