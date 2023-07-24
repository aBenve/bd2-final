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
    }: {
      destinationIdentifierType: string;
      destinationIdentifier: string;
      balance: number;
    }) => {
      const data = await axiosClient
        .post("/makeTransaction", {
          originIdentifierType: "cbu",
          originIdentifier: user!.cbu,
          destinationIdentifierType,
          destinationIdentifier,
          balance,
        })
        .then((res) => {
          if (res.status === 200) alert("Transacción realizada con éxito");
          else alert("Error al realizar la transacción");
          return res.data;
        });

      return data;
    }
  );
};
