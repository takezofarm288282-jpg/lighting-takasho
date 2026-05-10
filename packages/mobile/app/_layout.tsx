import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="#0d1a0d" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#152015" },
            headerTintColor: "#f0ede6",
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: "#0d1a0d" },
          }}
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
