import { create } from "zustand";
import { NewUserInfo, User } from "../types";
import { axiosClient } from "../lib/axios";
import { useAlertHandler } from "./useAlertHandler";
interface useUserAuthStore {
  user: User | null;
  login: ({
    cbu,
    password,
    alias,
  }: {
    cbu: string;
    password: string;
    alias: string;
  }) => Promise<Boolean>;
  logout: () => void;
}

export function getLocalStorageUser() {
  const user =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  if (user) {
    return JSON.parse(user) as User;
  }
  return null;
}

export const useUserAuth = create<useUserAuthStore>((set) => ({
  user: getLocalStorageUser(),
  login: async ({
    cbu,
    password,
    alias,
  }: {
    cbu: string;
    password: string;
    alias: string;
  }) => {
    const loginRes = await axiosClient
      .post("/login", {
        cbu,
        password,
      })
      .then((res) => res.data)
      .catch((err) => {
        useAlertHandler.getState().setAlert({
          message:
            "There was an error while logging in. Check your credentials.",
          isError: true,
        });
        return false;
      });

    if (!loginRes) {
      return false;
    }

    const userInfo: NewUserInfo = loginRes;
    const user: User = {
      cbu,
      secret_token: userInfo.secretToken,
      email: userInfo.email,
      name: userInfo.name,
      phone: userInfo.phone,
      alias: alias ? alias : userInfo.name + ".alias",
    };

    const addUserRes = await axiosClient
      .post("/user", {
        ...user,
        creation_date: new Date(),
      })
      .then((res) => res.data)
      .catch((err) => {
        useAlertHandler.getState().setAlert({
          message:
            "There was an error while logging in. The user already exists",
          isError: true,
        });
        return false;
      });

    if (!addUserRes) {
      return false;
    }

    localStorage.setItem("user", JSON.stringify(user));

    set({ user });
    return true;
  },
  logout: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
