"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  CreditCard,
  DollarSign,
  User,
  XCircle,
} from "lucide-react";

import { api } from "@/lib/api";
import { addDays, today, validDate } from "@/lib/dates";

type MembershipPlan = "Mensual" | "Trimestral" | "Anual";

interface Membership {
  id: number;
  memberName: string;
  identification: string;
  phone: string;
  plan: MembershipPlan;
  startDate: string;
  expirationDate: string;
  amount: number;
  status: "Activa" | "Vencida" | "Pendiente";
}

const initialPlans: Record<
  MembershipPlan,
  {
    amount: number;
    days: number;
  }
> = {
  Mensual: {
    amount: 30,
    days: 30,
  },
  Trimestral: {
    amount: 80,
    days: 90,
  },
  Anual: {
    amount: 300,
    days: 365,
  },
};

export default function MembershipPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [members, setMembers] = useState<{id:number;name:string;identification:string;phone:string}[]>([]);
  const [payNow, setPayNow] = useState(true);
  const requestKey = useRef<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [identification, setIdentification] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<MembershipPlan>("Mensual");
  const [startDate, setStartDate] = useState("");
  const [payment, setPayment] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [memberships, setMemberships] = useState<Membership[]>([]);

  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<Membership[]>('memberships').then(setMemberships).catch(e=>setError(e.message));
    api<{id:number;name:string;identification:string;phone:string}[]>('members').then(setMembers).catch(e=>setError(e.message));
    api<{name:MembershipPlan;price_cents:number;days:number}[]>('plans').then(list=>setPlans(Object.fromEntries(list.map(p=>[p.name,{amount:p.price_cents/100,days:p.days}])) as typeof initialPlans)).catch(e=>setError(e.message));
  }, []);
  const selectedPlan = plans[plan];

  const expirationDate = useMemo(() => {
    if (!startDate) {
      return "";
    }

    return validDate(startDate) ? addDays(startDate, selectedPlan.days) : '';
  }, [startDate, selectedPlan.days]);
  const getTodayString = today;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !memberName.trim() ||
      !identification.trim() ||
      !phone.trim() ||
      !startDate ||
      (payNow && !payment)
    ) {
      setError("Completa todos los campos.");
      return;
    }

    const paymentAmount = Number(payment);

    if (payNow && Number.isNaN(paymentAmount)) {
      setError("El monto ingresado no es válido.");
      return;
    }

    if (payNow && paymentAmount <= 0) {
      setError("El monto del pago debe ser mayor que 0.");
      return;
    }

    if (payNow && paymentAmount !== selectedPlan.amount) {
      setError(
        `El monto para el plan ${plan} debe ser de US$${selectedPlan.amount.toFixed(
          2,
        )}.`,
      );
      return;
    }

    const todayString = getTodayString();

    if (startDate < todayString) {
      setError("La fecha de inicio no puede ser anterior a la fecha actual.");
      return;
    }

    if (!expirationDate) {
      setError("No se pudo calcular la fecha de vencimiento.");
      return;
    }

    if (busy) return;
    setBusy(true);
    requestKey.current ??= crypto.randomUUID();
    try {
      await api('memberships','POST',{
        member:{name:memberName.trim(),identification:identification.trim(),phone:phone.trim()},
        planId: {Mensual:1,Trimestral:2,Anual:3}[plan], startDate,
        amountCents:payNow ? Math.round(paymentAmount*100) : undefined, requestKey:requestKey.current
      });
      setMemberships(await api<Membership[]>('memberships'));
      setSuccess('La membresía fue registrada correctamente.');
      requestKey.current = null;
      setMembers(await api<typeof members>('members'));
      setMemberName(''); setIdentification(''); setPhone(''); setStartDate(''); setPayment('');
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <main className="membership-page">
      {" "}
      <div className="membership-container">
        {" "}
        <div className="membership-header">
          {" "}
          <div>
            {" "}
            <h1>Registro de Membresías</h1>
            <p>
              Registra una nueva membresía para los miembros de StrongHub Gym.
            </p>
          </div>
        </div>
        <div className="membership-card">
          <div className="membership-card-header">
            <div className="membership-card-icon">
              <CreditCard size={22} />
            </div>

            <div>
              <h2>Nueva membresía</h2>

              <p>Completa los datos para registrar la membresía.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="existingMember">Miembro existente (o completa los datos de uno nuevo)</label>
              <select id="existingMember" defaultValue="" onChange={e=>{
                const member=members.find(m=>m.id===Number(e.target.value));
                setMemberName(member?.name ?? '');setIdentification(member?.identification ?? '');setPhone(member?.phone ?? '');
              }}><option value="">Nuevo miembro</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} · {m.identification}</option>)}</select>
            </div>
            <label><input type="checkbox" checked={payNow} onChange={e=>setPayNow(e.target.checked)}/> Registrar pago completo ahora (US$)</label>
            <div className="membership-form-grid">
              <div className="form-group">
                <label htmlFor="memberName">Nombre del miembro</label>

                <div className="input-wrapper">
                  <User size={18} />

                  <input
                    id="memberName"
                    data-cy="member-name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="identification">Cédula</label>

                <div className="input-wrapper">
                  <User size={18} />

                  <input
                    id="identification"
                    data-cy="identification"
                    type="text"
                    placeholder="001-0000000-0"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>

                <div className="input-wrapper">
                  <span>+1</span>

                  <input
                    id="phone"
                    data-cy="phone"
                    type="tel"
                    placeholder="809-000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="plan">Plan de membresía</label>

                <div className="input-wrapper">
                  <CreditCard size={18} />

                  <select
                    id="plan"
                    data-cy="plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as MembershipPlan)}
                  >
                    <option value="Mensual">Mensual - US$30.00</option>

                    <option value="Trimestral">Trimestral - US$80.00</option>

                    <option value="Anual">Anual - US$300.00</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Fecha de inicio</label>

                <div className="input-wrapper">
                  <CalendarDays size={18} />

                  <input
                    id="startDate"
                    data-cy="start-date"
                    type="date"
                    value={startDate}
                    min={getTodayString()}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="expirationDate">Fecha de vencimiento</label>

                <div className="input-wrapper">
                  <CalendarDays size={18} />

                  <input
                    id="expirationDate"
                    data-cy="expiration-date"
                    type="date"
                    value={expirationDate}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="payment">Monto a pagar</label>

                <div className="input-wrapper">
                  <DollarSign size={18} />

                  <input
                    id="payment"
                    disabled={!payNow}
                    data-cy="payment"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="30.00"
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Estado</label>

                <div className="membership-status" data-cy="membership-status">
                  <CheckCircle size={18} />

                  <span>{payNow && startDate === today() ? 'Activa al confirmar el pago' : 'Pendiente'}</span>
                </div>
              </div>
            </div>

            {error && (
              <div
                className="membership-message membership-message-error"
                data-cy="error-message"
              >
                <XCircle size={18} />

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="membership-message membership-message-success"
                data-cy="success-message"
              >
                <CheckCircle size={18} />

                <span>{success}</span>
              </div>
            )}

            <div className="membership-summary">
              <div>
                <span>Plan seleccionado</span>

                <strong>{plan}</strong>
              </div>

              <div>
                <span>Duración</span>

                <strong>{selectedPlan.days} días</strong>
              </div>

              <div>
                <span>Total</span>

                <strong>US${selectedPlan.amount.toFixed(2)}</strong>
              </div>
            </div>

            <button
              type="submit"
              className="membership-button"
              data-cy="register-membership"
              disabled={busy}
            >
              <CreditCard size={18} />
              Registrar membresía
            </button>
          </form>
        </div>
        <div className="membership-card membership-list-card">
          <div className="membership-card-header">
            <div>
              <h2>Membresías registradas</h2>

              <p>Listado persistente de membresías. Moneda: US$ (USD).</p>
            </div>
          </div>

          {memberships.length === 0 ? (
            <div className="membership-empty" data-cy="empty-memberships">
              <CreditCard size={32} />

              <p>No hay membresías registradas.</p>
            </div>
          ) : (
            <div className="membership-table-wrapper">
              <table className="membership-table" data-cy="memberships-table">
                <thead>
                  <tr>
                    <th>Miembro</th>
                    <th>Plan</th>
                    <th>Inicio</th>
                    <th>Vencimiento</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {memberships.map((membership) => (
                    <tr key={membership.id}>
                      <td>
                        <strong>{membership.memberName}</strong>

                        <span>{membership.identification}</span>
                      </td>

                      <td>{membership.plan}</td>

                      <td>{membership.startDate}</td>

                      <td>{membership.expirationDate}</td>

                      <td>US${membership.amount.toFixed(2)}</td>

                      <td>
                        <span className="membership-badge">
                          {membership.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

