import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/AuthStore";

const LogInForm = ({ onSwitchToSignup, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const login = useAuthStore((s) => s.login);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(form);
    if (result.success) onSuccess?.();
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage("");

    const result = await forgotPassword(forgotForm.email);
    if (result.success) {
      setForgotStep("reset");
      setSuccessMessage(result.message || "Reset code sent to your email.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage("");

    const result = await resetPassword(forgotForm);
    if (result.success) {
      setSuccessMessage(result.message || "Password reset successful.");
      setIsForgotMode(false);
      setForgotStep("request");
      setForm((prev) => ({ ...prev, email: forgotForm.email, password: "" }));
      setForgotForm((prev) => ({ ...prev, otp: "", newPassword: "" }));
    }
  };

  const switchToForgot = () => {
    clearError();
    setSuccessMessage("");
    setIsForgotMode(true);
    setForgotStep("request");
    setForgotForm((prev) => ({ ...prev, email: form.email || prev.email }));
  };

  const switchToLogin = () => {
    clearError();
    setSuccessMessage("");
    setIsForgotMode(false);
    setForgotStep("request");
  };

  return (
    <div className="flex h-full flex-col px-6 pb-7 pt-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight text-white">
          {isForgotMode ? "Reset password" : "Welcome back"}
        </h2>
        <p className="mt-1 text-sm text-white/45">
          {isForgotMode
            ? "Request a reset code and set your new password."
            : "Sign in to your StreetGuard AI account."}
        </p>
      </div>

      <form
        onSubmit={
          isForgotMode
            ? forgotStep === "request"
              ? handleForgotRequest
              : handleResetPassword
            : handleSubmit
        }
        className="flex flex-1 flex-col gap-3"
      >
        <div className="group relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-primary/70" />
          <input
            type="email"
            placeholder="Email address"
            required
            value={isForgotMode ? forgotForm.email : form.email}
            onChange={(e) =>
              isForgotMode
                ? setForgotForm({ ...forgotForm, email: e.target.value })
                : setForm({ ...form, email: e.target.value })
            }
            className="w-full border-0 border-b border-white/18 bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/75"
          />
        </div>

        {!isForgotMode && (
          <>
            <div className="group relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-primary/70" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border-0 border-b border-white/18 bg-transparent py-3 pl-10 pr-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/75"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/65"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={switchToForgot}
              className="w-fit text-xs text-primary/75 transition hover:text-primary"
            >
              Forgot password?
            </button>
          </>
        )}

        {isForgotMode && forgotStep === "reset" && (
          <>
            <div className="group relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="6-digit code"
                required
                value={forgotForm.otp}
                onChange={(e) =>
                  setForgotForm({
                    ...forgotForm,
                    otp: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full border-0 border-b border-white/18 bg-transparent py-3 text-sm tracking-[0.2em] text-white placeholder:text-white/30 outline-none transition focus:border-primary/75"
              />
            </div>

            <div className="group relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-primary/70" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                required
                value={forgotForm.newPassword}
                onChange={(e) =>
                  setForgotForm({ ...forgotForm, newPassword: e.target.value })
                }
                className="w-full border-0 border-b border-white/18 bg-transparent py-3 pl-10 pr-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/75"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/65"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </>
        )}

        {successMessage && (
          <p className="text-xs text-emerald-300/85">{successMessage}</p>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-start gap-2"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              <div>
                <p className="text-xs  text-red-400">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/35 disabled:opacity-70"
          >
            {isLoading
              ? isForgotMode
                ? forgotStep === "request"
                  ? "Sending code..."
                  : "Resetting..."
                : "Signing In..."
              : isForgotMode
                ? forgotStep === "request"
                  ? "Send reset code"
                  : "Reset password"
                : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>

          {isForgotMode && (
            <button
              type="button"
              onClick={switchToLogin}
              className="mt-3 w-fit text-xs text-white/55 transition hover:text-white/80"
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>

      {!isForgotMode && (
        <p className="mt-5 text-center text-xs text-white/38">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium text-primary/75 transition hover:text-primary"
          >
            Create one
          </button>
        </p>
      )}
    </div>
  );
};

export default LogInForm;
