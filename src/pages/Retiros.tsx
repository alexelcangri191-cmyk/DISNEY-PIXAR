import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  ChevronDown,
  Check,
  Lock,
  CreditCard,
  Send,
  Loader2,
  CheckCircle2,
  X,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const MONTOS = [
  30000, 80000, 210000,
  840000, 2300000, 5600000,
  12000000, 25000000, 62500000,
];

const METODOS = ['Nequi', 'Bancolombia'] as const;

function formatCOP(value: number): string {
  return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function Retiros() {
  const navigate = useNavigate();
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [numeroCuenta, setNumeroCuenta] = useState<string>('');
  const [enviando, setEnviando] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [saldoDisponible, setSaldoDisponible] = useState<number | null>(null);
  const [errorSaldo, setErrorSaldo] = useState<string | null>(null);

  const montoValido = montoSeleccionado !== null && montoSeleccionado > 0;
  const cuentaValida = numeroCuenta.trim() !== '';
  const puedeEnviar = montoValido && cuentaValida && !enviando;

  useEffect(() => {
    async function fetchSaldo() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_progress')
        .select('saldo_ingresos')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setSaldoDisponible(Number(data.saldo_ingresos) || 0);
    }
    fetchSaldo();
  }, []);

  const puntos = [
    'Los retiros estarán disponible únicamente de lunes a viernes en horario de oficina hora colombiana de 08:00 am a 12:00 pm y de 02:00 pm a 06:00 pm (hora colombiana) fuera de estos días y horas nuestro personal y el sistema no procesara ninguna solicitud.',
    'Debe tener en cuenta que sobre cada retiro se cobrará una comisión del 10% al monto a retirar.',
    'El dinero restante será transferido a su cuenta Nequi o Bancolombia registrada en la app.',
    'Sola mente se puede realizar un retiro x día y una vez realizado la solicitud de retiro el sistema procesara su solicitud y en el lapso no mayor a las siguientes Horas será respectiva mente hecho efectivo su retiro.',
    'Verificar que el monto seleccionado a retirar sea el que usted ha escogido y así evitar demoras en las transacciones.',
  ];

  async function handleEnviar() {
    if (!puedeEnviar) return;
    setErrorSaldo(null);
    setEnviando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setEnviando(false);
        return;
      }

      // 0. Verificar saldo disponible ANTES de procesar
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('saldo_ingresos')
        .eq('user_id', user.id)
        .maybeSingle();

      const saldoActual = Number((progressData as { saldo_ingresos: number } | null)?.saldo_ingresos || 0);
      setSaldoDisponible(saldoActual);

      if (saldoActual < (montoSeleccionado as number)) {
        setErrorSaldo('Saldo insuficiente. Tu Billetera de Ingresos no tiene el monto suficiente para este retiro.');
        setEnviando(false);
        return;
      }

      // Obtener nombre de usuario
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const username = (userData as { full_name: string } | null)?.full_name || user.email || 'Usuario';

      const ahora = new Date();
      const fecha = ahora.toISOString().slice(0, 10);
      const hora = ahora.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // 1. Crear registro en retiros
      const { error: retiroError } = await supabase.from('retiros').insert({
        user_id: user.id,
        username,
        amount: montoSeleccionado,
        date: fecha,
        time: hora,
        account_number: numeroCuenta.trim(),
        status: 'pendiente',
      });

      if (retiroError) {
        setEnviando(false);
        return;
      }

      // 2. Descontar el monto de la billetera de ingresos
      const nuevoSaldo = saldoActual - (montoSeleccionado as number);

      await supabase
        .from('user_progress')
        .update({ saldo_ingresos: nuevoSaldo, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      setSaldoDisponible(nuevoSaldo);

      // Mostrar modal de exito
      setModalExito(true);
      setEnviando(false);

      // Limpiar campos
      setNumeroCuenta('');
      setMontoSeleccionado(null);
      setMetodoSeleccionado(null);
    } catch {
      setEnviando(false);
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#000000' }}
    >
      {/* Ambient glow */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-6 pb-24">
        {/* Header */}
        <header className="w-full max-w-lg mx-auto flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 active:scale-90"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              color: '#888888',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'rgba(255,193,7,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#FFC107';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'rgba(255,193,7,0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = '#888888';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="font-black text-xl tracking-tight"
            style={{
              background:
                'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Retiros
          </h1>
        </header>

        {/* Información de Retiros Block */}
        <div
          className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,193,7,0.15)',
            boxShadow: '0 0 30px rgba(255,193,7,0.08)',
          }}
        >
          <div className="flex">
            {/* Left accent bar */}
            <div
              className="flex-shrink-0 w-1.5"
              style={{
                background:
                  'linear-gradient(180deg, #FFD700, #FFC107, #B8860B)',
              }}
            />
            <div className="flex-1 p-5 flex flex-col gap-4">
              {/* Title */}
              <div className="flex items-center gap-2">
                <Info size={16} style={{ color: '#FFC107' }} />
                <h2
                  className="font-bold text-sm tracking-wide"
                  style={{ color: '#FFC107' }}
                >
                  Información de Retiros
                </h2>
              </div>

              {/* Info points */}
              <ul className="flex flex-col gap-3">
                {puntos.map((texto, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: '#FFC107' }}
                    />
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#AAAAAA' }}
                    >
                      {texto}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* SALDO DISPONIBLE */}
        <div className="w-full max-w-lg mx-auto mt-6">
          <div
            className="rounded-2xl flex items-center justify-between"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              boxShadow: '0 0 16px rgba(255,193,7,0.06)',
              padding: '16px 18px',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,193,7,0.1)' }}
              >
                <Wallet size={18} style={{ color: '#FFC107' }} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                Saldo Disponible
              </span>
            </div>
            <span
              className="text-lg font-black"
              style={{ color: '#FFC107' }}
            >
              {saldoDisponible !== null ? formatCOP(saldoDisponible) : '...'}
            </span>
          </div>
        </div>

        {/* AVISO SALDO INSUFICIENTE */}
        {errorSaldo && (
          <div className="w-full max-w-lg mx-auto mt-4">
            <div
              className="rounded-2xl flex items-start gap-3 p-4"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.4)',
                boxShadow: '0 0 20px rgba(239,68,68,0.12)',
              }}
            >
              <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm font-bold leading-relaxed" style={{ color: '#ef4444' }}>
                {errorSaldo}
              </p>
            </div>
          </div>
        )}

        {/* SELECCIONA UN MONTO */}
        <div className="w-full max-w-lg mx-auto mt-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Selecciona un Monto
            </span>
          </div>

          {/* Grid 3x3 */}
          <div className="grid grid-cols-3 gap-2.5">
            {MONTOS.map((monto) => {
              const seleccionado = montoSeleccionado === monto;
              return (
                <button
                  key={monto}
                  onClick={() => setMontoSeleccionado(monto)}
                  className="rounded-xl transition-all duration-300 active:scale-95"
                  style={{
                    background: seleccionado
                      ? 'rgba(255,193,7,0.12)'
                      : '#1A1A1A',
                    border: `1px solid ${
                      seleccionado
                        ? 'rgba(255,193,7,0.6)'
                        : 'rgba(255,193,7,0.15)'
                    }`,
                    boxShadow: seleccionado
                      ? '0 0 20px rgba(255,193,7,0.2), inset 0 1px 0 rgba(255,255,255,0.04)'
                      : '0 0 12px rgba(255,193,7,0.04), inset 0 1px 0 rgba(255,255,255,0.02)',
                    padding: '14px 6px',
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: seleccionado ? '#FFC107' : '#CCCCCC',
                    }}
                  >
                    {formatCOP(monto)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Visualizador de Monto */}
          <div className="mt-4">
            <span
              className="text-xs font-bold uppercase tracking-wider mb-2 block px-1"
              style={{ color: '#888888' }}
            >
              Monto del Retiro
            </span>
            <div
              className="w-full rounded-xl flex items-center justify-between"
              style={{
                background: '#1A1A1A',
                border: `1px solid ${
                  montoSeleccionado !== null
                    ? 'rgba(255,193,7,0.4)'
                    : 'rgba(255,193,7,0.1)'
                }`,
                boxShadow:
                  montoSeleccionado !== null
                    ? '0 0 16px rgba(255,193,7,0.1)'
                    : 'none',
                padding: '16px 18px',
                opacity: montoSeleccionado !== null ? 1 : 0.6,
              }}
            >
              <div className="flex items-center gap-2.5">
                {montoSeleccionado === null && (
                  <Lock size={16} style={{ color: '#666666' }} />
                )}
                <span
                  className="text-base font-black"
                  style={{
                    color: montoSeleccionado !== null ? '#FFC107' : '#666666',
                  }}
                >
                  {montoSeleccionado !== null
                    ? formatCOP(montoSeleccionado)
                    : 'Selecciona un monto'}
                </span>
              </div>
              {montoSeleccionado !== null && (
                <Check size={18} style={{ color: '#FFC107' }} />
              )}
            </div>
          </div>
        </div>

        {/* MÉTODO DE RETIRO */}
        <div className="w-full max-w-lg mx-auto mt-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Método de Retiro
            </span>
          </div>

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownAbierto(!dropdownAbierto)}
              className="w-full rounded-xl flex items-center justify-between transition-all duration-300"
              style={{
                background: '#1A1A1A',
                border: `1px solid ${
                  metodoSeleccionado
                    ? 'rgba(255,193,7,0.4)'
                    : dropdownAbierto
                    ? 'rgba(255,193,7,0.5)'
                    : 'rgba(255,193,7,0.15)'
                }`,
                boxShadow:
                  metodoSeleccionado || dropdownAbierto
                    ? '0 0 16px rgba(255,193,7,0.1)'
                    : '0 0 12px rgba(255,193,7,0.04)',
                padding: '16px 18px',
              }}
            >
              <span
                className="text-sm font-bold"
                style={{
                  color: metodoSeleccionado ? '#FFC107' : '#666666',
                }}
              >
                {metodoSeleccionado ?? 'Selecciona un método de pago'}
              </span>
              <ChevronDown
                size={18}
                style={{
                  color: '#888888',
                  transform: dropdownAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </button>

            {/* Dropdown options */}
            {dropdownAbierto && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-20"
                style={{
                  background: '#1A1A1A',
                  border: '1px solid rgba(255,193,7,0.25)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255,193,7,0.1)',
                }}
              >
                {METODOS.map((metodo) => {
                  const activo = metodoSeleccionado === metodo;
                  return (
                    <button
                      key={metodo}
                      onClick={() => {
                        setMetodoSeleccionado(metodo);
                        setDropdownAbierto(false);
                      }}
                      className="w-full flex items-center justify-between transition-colors duration-200"
                      style={{
                        padding: '14px 18px',
                        background: activo
                          ? 'rgba(255,193,7,0.1)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!activo) {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'rgba(255,193,7,0.06)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!activo) {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            'transparent';
                        }
                      }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: activo ? '#FFC107' : '#CCCCCC',
                        }}
                      >
                        {metodo}
                      </span>
                      {activo && <Check size={16} style={{ color: '#FFC107' }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CUENTA BANCARIA */}
        <div className="w-full max-w-lg mx-auto mt-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Cuenta Bancaria
            </span>
          </div>

          <div className="relative">
            <div
              className="w-full rounded-xl flex items-center transition-all duration-300"
              style={{
                background: '#1A1A1A',
                border: `1px solid ${
                  cuentaValida
                    ? 'rgba(255,193,7,0.4)'
                    : 'rgba(255,193,7,0.15)'
                }`,
                boxShadow: cuentaValida
                  ? '0 0 16px rgba(255,193,7,0.1)'
                  : '0 0 12px rgba(255,193,7,0.04)',
                padding: '0 18px',
                height: '54px',
              }}
            >
              <CreditCard
                size={18}
                style={{
                  color: cuentaValida ? '#FFC107' : '#666666',
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ingresa tu número de cuenta (Manual)"
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{ padding: '16px 14px' }}
              />
            </div>
          </div>
        </div>

        {/* BOTÓN ENVIAR */}
        <div className="w-full max-w-lg mx-auto mt-6">
          <button
            onClick={handleEnviar}
            disabled={!puedeEnviar}
            className="w-full rounded-2xl font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={{
              background: puedeEnviar ? '#FFC107' : '#2A2A2A',
              color: puedeEnviar ? '#000000' : '#555555',
              border: `1px solid ${
                puedeEnviar
                  ? 'rgba(255,193,7,0.6)'
                  : 'rgba(255,255,255,0.05)'
              }`,
              boxShadow: puedeEnviar
                ? '0 4px 24px rgba(255,193,7,0.4)'
                : 'none',
              padding: '16px',
              cursor: puedeEnviar ? 'pointer' : 'not-allowed',
              opacity: puedeEnviar ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (puedeEnviar) {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFD700';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 6px 36px rgba(255,193,7,0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (puedeEnviar) {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFC107';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 4px 24px rgba(255,193,7,0.4)';
              }
            }}
          >
            {enviando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Send size={18} />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAL DE OPERACIÓN EXITOSA */}
      {modalExito && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setModalExito(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.4)',
              boxShadow: '0 0 60px rgba(255,193,7,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalExito(false)}
              className="absolute top-4 right-4 transition-opacity hover:opacity-70"
              style={{ color: '#888888' }}
            >
              <X size={20} />
            </button>

            <div
              className="mb-5 w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(34,197,94,0.12)',
                border: '2px solid rgba(34,197,94,0.5)',
                boxShadow: '0 0 30px rgba(34,197,94,0.2)',
              }}
            >
              <CheckCircle2 size={32} style={{ color: '#22C55E' }} />
            </div>

            <h2
              className="text-xl font-black mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Operación Exitosa
            </h2>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: '#AAAAAA' }}
            >
              Tu solicitud de retiro ha sido registrada correctamente y se encuentra en estado Pendiente.
            </p>

            <button
              onClick={() => setModalExito(false)}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95"
              style={{
                background: '#FFC107',
                color: '#000000',
                boxShadow: '0 4px 20px rgba(255,193,7,0.3)',
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
