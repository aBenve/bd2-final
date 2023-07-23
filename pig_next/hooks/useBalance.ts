import { useQuery } from "react-query";
import { axiosClient } from "../lib/axios";
import { useUserAuth } from "../store/userStore";

function useBalance() {
  const { user } = useUserAuth();

  const { data, isLoading, isError, refetch } = useQuery(
    "userBalance",
    () => {
      return axiosClient
        .get(
          `/api/checkFunds?cbu=${user?.cbu}?secret_token=${user?.secret_token}`
        )
        .then((res) => res.data);
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  return { data, isLoading, isError, refetch };
}

export default useBalance;
