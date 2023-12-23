import { useMutation } from "react-query";
import { useUserAuth } from "../store/userStore";
import { axiosClient } from "../lib/axios";
import { useAlertHandler } from "../store/useAlertHandler";
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
          if (res.status === 200)
            useAlertHandler.getState().setAlert({
              message: "The transaction was successful!",
            });
          else if (res.status === 400)
            useAlertHandler.getState().setAlert({
              message: "There was an error while making the transaction.",
              isError: true,
            });
          else if (res.status === 401)
            useAlertHandler.getState().setAlert({
              message: "You are not authorized to make this transaction.",
              isError: true,
            });
          else if (res.status === 404)
            useAlertHandler.getState().setAlert({
              message: "The destination account does not exist.",
              isError: true,
            });
          else if (res.status === 500)
            useAlertHandler.getState().setAlert({
              message: "There was an error while making the transaction.",
              isError: true,
            });
          return res.data;
        })
        .catch((err) => {
          useAlertHandler.getState().setAlert({
            message: "There was an error while making the transaction.",
            isError: true,
          });
          return err;
        });

      return data;
    }
  );
};
