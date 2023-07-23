import { useMutation } from "react-query";
import { useUserAuth } from "../store/userStore";
import { axiosClient } from "../lib/axios";

export const useMakeTransactionMutation = () => {
  const { user } = useUserAuth();
  return useMutation(
    async ({
      destinationIdentifierType,
      destinationIdentifier,
      balance,
      reset,
    }: {
      destinationIdentifierType: string;
      destinationIdentifier: string;
      balance: number;
      reset: () => void;
    }) => {
      const data = await axiosClient
        .post("/api/makeTransaction", {
          originIdentifierType: "cbu",
          originIdentifier: user!.cbu,
          destinationIdentifierType,
          destinationIdentifier,
          balance,
        })
        .then((res) => {
          if (data.status === 200) reset();
          else alert("Error al realizar la transacción");
          return res.data;
        });

      return data;
    }
  );
};
