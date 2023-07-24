import { useQuery } from "react-query";
import { axiosClient } from "../lib/axios";
import { useUserAuth } from "../store/userStore";

function useBalance() {
  const { user } = useUserAuth();

  const { data, isLoading, isError, refetch } = useQuery("userBalance", () => {
    return axiosClient
      .get(`/checkFunds?cbu=${user?.cbu}&secret_token=${user?.secret_token}`)
      .then((res) => res.data);
  });
  return { data, isLoading, isError, refetch };
}

export default useBalance;
