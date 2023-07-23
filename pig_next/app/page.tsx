"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import Card from "../components/Card";
import CardGrid from "../components/CardGrid";
import Header from "../components/Header";
import MakeTransaction from "../components/MakeTransaction";
import RecentTransactions from "../components/RecentTransactions";
import { useUserAuth } from "../store/userStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useUserAuth();
  const router = useRouter();

  if (!user) router.push("/login");

  return (
    <QueryClientProvider client={new QueryClient()}>
      <main className="mx-auto grid h-[100vh] w-full grid-cols-1 grid-rows-[repeat(3,auto)_1fr_auto] gap-8 overflow-hidden bg-stone-950 px-4 py-14 sm:w-[640px]">
        <Header />
        <hr className="h-0.5 w-full rounded-full border-stone-600 bg-stone-600 opacity-50" />
        <CardGrid />
        <RecentTransactions />
        <MakeTransaction />
      </main>
    </QueryClientProvider>
  );
}
