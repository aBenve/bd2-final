import { useQuery } from "react-query";
import { axiosClient } from "../lib/axios";
import { useUserAuth } from "../store/userStore";
import { Transaction } from "../types";

function useRecentTransactions() {
  const { user } = useUserAuth();

  const { data, isLoading, isError, refetch } = useQuery<Transaction[]>(
    "userTransactions",
    () => {
      return axiosClient
        .get(
          `/api/transactions?cbu=${user?.cbu}&secretToken=${user?.secret_token}`
        )
        .then((res) => res.data);
    }
  );
  return { data, isLoading, isError, refetch };
}

export default useRecentTransactions;
