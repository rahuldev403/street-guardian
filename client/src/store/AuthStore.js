import { create } from "zustand";
import { api } from "../lib/api";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: true,
  error: null,
  pendingEmail: "",
  authStep: "login",

  setAuthStep: (step) => set({ authStep: step }),
  clearError: () => set({ error: null }),

  signup: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });

    try {
      const res = await api.post("/auth/signup", { name, email, password });

      set({
        isLoading: false,
        pendingEmail: res.data.data.email,
        authStep: "verify-signup-otp",
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      return { success: false };
    }
  },

  verifySignupOtp: async (otp) => {
    const { pendingEmail } = get();
    set({ isLoading: true, error: null });

    try {
      const res = await api.post("/auth/verify-registration", {
        email: pendingEmail,
        otp,
      });

      set({
        isLoading: false,
        user: res.data.data,
        isAuthenticated: true,
        pendingEmail: "",
        authStep: "authenticated",
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      return { success: false };
    }
  },

  resendSignupOtp: async () => {
    const { pendingEmail } = get();
    set({ isLoading: true, error: null });

    try {
      await api.post("/auth/resend-otp", {
        email: pendingEmail,
        purpose: "signup",
      });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      return { success: false };
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });

    try {
      const res = await api.post("/auth/signin", { email, password });

      set({
        isLoading: false,
        user: res.data.data,
        isAuthenticated: true,
        authStep: "authenticated",
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      return { success: false };
    }
  },

  fetchMe: async () => {
    set({ isBootstrapping: true });

    try {
      const res = await api.get("/auth/me");
      set({
        isBootstrapping: false,
        user: res.data.data,
        isAuthenticated: true,
      });
    } catch {
      set({
        isBootstrapping: false,
        user: null,
        isAuthenticated: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await api.post("/auth/signout");
    } catch (e) {
      console.error("Signout request failed:", e);
    }

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingEmail: "",
      authStep: "login",
    });
  },
}));

// Standalone state reset — imported by api.js interceptor to avoid circular hook usage
export const clearAuthState = () =>
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    pendingEmail: "",
    authStep: "login",
  });
