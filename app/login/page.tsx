"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos.");
      return;
    }

    try {
      await api('auth/login','POST',{email,password,remember});
      router.push('/dashboard');
      router.refresh();
    } catch (error) { setError((error as Error).message); }
  };

  return (
    <main className="login-page">
      <div className="login-overlay" />

      <div className="login-card">
        <div className="login-logo">
          <Image
            src="/stronghub-logo.png"
            alt="StrongHub Gym"
            className="login-logo-image"
            width={200}
            height={200}
            loading="eager"
          />
        </div>

        <div className="login-header">
          <h1>Bienvenido</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>

            <div className={`input-wrapper ${error ? "input-error" : ""}`}>
              <Mail size={18} />

              <input
                type="email"
                placeholder="usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>

            <div className="input-wrapper">
              <LockKeyhole size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="password-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-options">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />

              <span>Recordarme</span>
            </label>


          </div>

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>


      </div>
    </main>
  );
}
