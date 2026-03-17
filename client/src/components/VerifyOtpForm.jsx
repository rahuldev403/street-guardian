import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/AuthStore";

const RESEND_COOLDOWN = 30;

const VerifyOtpForm = ({ onSuccess, onBackToLogin }) => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef(null);

  const verifySignupOtp = useAuthStore((s) => s.verifySignupOtp);
  const resendSignupOtp = useAuthStore((s) => s.resendSignupOtp);
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    clearInterval(timerRef.current);
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await verifySignupOtp(otp);
    if (result.success) onSuccess?.();
  };

  const handleResend = async () => {
    clearError();
    const result = await resendSignupOtp();
    if (result.success) startCountdown();
  };

  return (
    <div className="flex h-full flex-col px-6 pb-7 pt-5">
      <div className="mb-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary/80" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Verify your email
        </h2>
        <p className="mt-1 text-sm text-white/45">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-white/70">{pendingEmail}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="group relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full border-0 border-b border-white/18 bg-transparent py-3 text-center text-2xl font-bold tracking-[0.5em] text-white placeholder:text-base placeholder:font-normal placeholder:tracking-widest placeholder:text-white/18 outline-none transition focus:border-primary/75"
          />
        </div>

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

        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading || countdown > 0}
          className="flex items-center gap-1.5 text-xs text-white/38 transition hover:text-white/68 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3 w-3" />
          {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
        </button>

        <div className="mt-auto">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || otp.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/35 disabled:opacity-70"
          >
            {isLoading ? "Verifying..." : "Verify & Continue"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </form>

      <p className="mt-5 text-center text-xs text-white/38">
        Wrong email?{" "}
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-medium text-primary/75 transition hover:text-primary"
        >
          Go back to login
        </button>
      </p>
    </div>
  );
};

export default VerifyOtpForm;
