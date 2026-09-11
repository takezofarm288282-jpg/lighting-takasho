import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";
import App from "./app.tsx";

// GitHub Pages は「/cases」のような普通のURLを直接開くと404になるため、
// #（ハッシュ）を使ったページ切り替えにしている。
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<Router hook={useHashLocation}>
				<App />
			</Router>
		</QueryClientProvider>
	</StrictMode>,
);
