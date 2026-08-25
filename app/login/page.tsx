"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos.");
      return;
    }

    // Login simulado
    if (email === "admin@stronghub.com" && password === "123456") {
      localStorage.setItem(
        "stronghub_user",
        JSON.stringify({
          id: 1,
          name: "Admin",
          email,
          role: "admin",
          remember,
        }),
      );

      router.push("/dashboard");
      return;
    }

    if (email === "entrenador@stronghub.com" && password === "123456") {
      localStorage.setItem(
        "stronghub_user",
        JSON.stringify({
          id: 2,
          name: "Carlos",
          email,
          role: "trainer",
          remember,
        }),
      );

      router.push("/dashboard");
      return;
    }

    if (email === "recepcion@stronghub.com" && password === "123456") {
      localStorage.setItem(
        "stronghub_user",
        JSON.stringify({
          id: 3,
          name: "María",
          email,
          role: "receptionist",
          remember,
        }),
      );

      router.push("/dashboard");
      return;
    }

    setError("Correo o contraseña incorrectos.");
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

            <button type="button" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>

        <div className="demo-users">
          <p>Usuarios de prueba</p>

          <span>admin@stronghub.com / 123456</span>
          <span>entrenador@stronghub.com / 123456</span>
          <span>recepcion@stronghub.com / 123456</span>
        </div>
      </div>
    </main>
  );
}
