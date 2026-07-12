"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate } from "animejs";
import { createClient } from "@/lib/supabase/client";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { toast } from "@/lib/hooks/useToast";
import { ButtonLoader } from "@/components/ui/Loading";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const reduced = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (reduced || !heroRef.current || !formRef.current) return;

    const heroEls = heroRef.current?.querySelectorAll("[data-animate]");
    if (heroEls) {
      animate(heroEls, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: 100,
        easing: "easeOutExpo",
      });
    }
    if (formRef.current) {
      animate(formRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.97, 1],
        duration: 600,
        delay: 200,
        easing: "easeOutExpo",
      });
    }
  }, [reduced]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] flex relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div
        ref={heroRef}
        className="hidden lg:flex w-1/2 flex-col justify-center px-20 relative z-10"
      >
        <p
          data-animate
          className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--acc)] mb-3"
          style={{ fontFamily: "var(--ff-d)", ...(reduced ? {} : { opacity: 0 }) }}
        >
          KeebForge.in
        </p>
        <h1
          data-animate
          className="text-6xl font-black tracking-tight"
          style={{ fontFamily: "var(--ff-d)", ...(reduced ? {} : { opacity: 0 }) }}
        >
          Admin Control
          <br />
          Center<span className="text-[var(--acc)]">.</span>
        </h1>
        <p
          data-animate
          className="mt-8 max-w-lg text-[var(--t2)] leading-8"
          style={reduced ? {} : { opacity: 0 }}
        >
          Internal administration portal used to manage customer orders,
          production workflow, shipping updates and warranty tracking.
        </p>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 relative z-10">
        <form
          ref={formRef}
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] p-8 shadow-2xl"
          style={reduced ? {} : { opacity: 0 }}
        >
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-[var(--t3)]">
            Authorized personnel only.
          </p>

          <div className="mt-8">
            <label className="text-xs font-bold tracking-wide uppercase text-[var(--t3)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-3 text-[var(--t1)] outline-none transition focus:border-[var(--acc)]/40"
            />
          </div>

          <div className="mt-6">
            <label className="text-xs font-bold tracking-wide uppercase text-[var(--t3)]">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-3 text-[var(--t1)] outline-none transition focus:border-[var(--acc)]/40"
            />
          </div>

          <ButtonLoader
            type="submit"
            variant="primary"
            loading={loading}
            loadingText="Signing In..."
            className="mt-8 w-full justify-center"
          >
            Login
          </ButtonLoader>

          <p className="mt-8 text-center text-xs text-[var(--t3)]">
            Unauthorized access is prohibited.
          </p>
        </form>
      </div>
    </main>
  );
}
