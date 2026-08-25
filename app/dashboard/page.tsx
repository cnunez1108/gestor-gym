"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CalendarDays,
  CreditCard,
  Dumbbell,
  TrendingUp,
  Users,
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/StatCard";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("stronghub_user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="dashboard-header">
        <div>
          <h1>¡Bienvenido de vuelta, {user.name}!</h1>

          <p>Aquí tienes un resumen general del gimnasio.</p>
        </div>

        <button className="period-button">Esta semana</button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Miembros Activos"
          value="248"
          percentage="+12%"
          icon={<Users size={21} />}
        />

        <StatCard
          title="Entrenamientos Hoy"
          value="36"
          percentage="+8%"
          icon={<Dumbbell size={21} />}
        />

        <StatCard
          title="Ingresos del Mes"
          value="RD$ 128,540"
          percentage="+15%"
          icon={<CreditCard size={21} />}
        />

        <StatCard
          title="Asistencia Promedio"
          value="78%"
          percentage="+5%"
          icon={<TrendingUp size={21} />}
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card attendance-card">
          <div className="card-header">
            <div>
              <h2>Asistencia Semanal</h2>
              <span>Porcentaje de asistencia</span>
            </div>

            <select>
              <option>Esta semana</option>
              <option>Última semana</option>
            </select>
          </div>

          <div className="chart">
            {[
              ["Lun", 74],
              ["Mar", 82],
              ["Mié", 61],
              ["Jue", 72],
              ["Vie", 85],
              ["Sáb", 56],
              ["Dom", 75],
            ].map(([day, value]) => (
              <div className="bar-container" key={day}>
                <div
                  className="bar"
                  style={{
                    height: `${value}%`,
                  }}
                />

                <span>{day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card plan-card">
          <div className="card-header">
            <div>
              <h2>Miembros por Plan</h2>
              <span>Distribución actual</span>
            </div>
          </div>

          <div className="donut-wrapper">
            <div className="donut">
              <div className="donut-center">
                <strong>248</strong>
                <span>Miembros</span>
              </div>
            </div>

            <div className="plan-list">
              <div>
                <i />
                <span>Premium</span>
                <strong>45%</strong>
              </div>

              <div>
                <i />
                <span>Estándar</span>
                <strong>35%</strong>
              </div>

              <div>
                <i />
                <span>Básico</span>
                <strong>15%</strong>
              </div>

              <div>
                <i />
                <span>Trial</span>
                <strong>5%</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card activities-card">
          <div className="card-header">
            <div>
              <h2>Actividades Recientes</h2>
              <span>Últimos movimientos</span>
            </div>
          </div>

          <div className="activity-list">
            <ActivityItem
              icon={<Users size={17} />}
              title="Nuevo miembro registrado"
              name="Juan Pérez"
              time="Hace 10 min"
            />

            <ActivityItem
              icon={<CreditCard size={17} />}
              title="Pago recibido"
              name="RD$ 2,500"
              time="Hace 1 h"
            />

            <ActivityItem
              icon={<CalendarDays size={17} />}
              title="Entrenamiento creado"
              name="Piernas y Glúteos"
              time="Hace 2 h"
            />

            <ActivityItem
              icon={<Dumbbell size={17} />}
              title="Nuevo usuario"
              name="Entrenador Carlos"
              time="Hace 3 h"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ActivityItem({
  icon,
  title,
  name,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  name: string;
  time: string;
}) {
  return (
    <div className="activity-item">
      <div className="activity-icon">{icon}</div>

      <div className="activity-info">
        <strong>{title}</strong>
        <span>{name}</span>
      </div>

      <small>{time}</small>
    </div>
  );
}
