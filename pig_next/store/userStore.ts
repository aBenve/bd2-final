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

function getLocalStorageUser() {
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
    const loginRes = await axiosClient.post("/login", {
      cbu,
      password,
      alias,
    });

    if (loginRes.status !== 200) {
      return false;
    }

    const userInfo: NewUserInfo = loginRes.data;
    const user: User = {
      cbu,
      secret_token: userInfo.secretToken,
      email: userInfo.email,
      name: userInfo.name,
      phone: userInfo.phone,
      alias,
    };

    const addUserRes = await axiosClient.post("/user", {
      ...user,
      creation_date: new Date(),
    });

    if (addUserRes.status !== 200) {
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
