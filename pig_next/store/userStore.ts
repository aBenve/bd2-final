import { create } from "zustand";
import { NewUserInfo, User } from "../types";
import { axiosClient } from "../lib/axios";

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

export const useUserAuth = create<useUserAuthStore>((set) => ({
  user: localStorage.getItem("user")
    ? (JSON.parse(localStorage.getItem("user")!) as unknown as User)
    : null,
  login: async ({
    cbu,
    password,
    alias,
  }: {
    cbu: string;
    password: string;
    alias: string;
  }) => {
    const res = await axiosClient.post("/login", {
      cbu,
      password,
      alias,
    });

    if (res.status !== 200) {
      return false;
    }

    const userInfo: NewUserInfo = res.data;
    const user: User = {
      cbu,
      secret_token: userInfo.secretToken,
      email: userInfo.email,
      name: userInfo.name,
      phone: userInfo.phoneNumber,
    };

    localStorage.setItem("user", JSON.stringify(user));

    set({ user });
    return true;
  },
  logout: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
