import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Wallet,
  Coins,
  CheckCircle2,
  Loader2,
  Landmark,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const MONTOS_PREDEFINIDOS = [50000, 100000, 200000, 500000];

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function Retiros() {
  const navigate = useNavigate();

  const [saldoIngresos, setSaldoIngresos] = useState(0);
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(null);
  const [montoCustom, setMontoCustom] = useState('');
  const [cuentaBancaria, setCuentaBancaria] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cargandoSaldo, setCargandoSaldo] = useState(true);

  const montoEfectivo = montoSeleccionado ?? (montoCustom ? Number(montoCustom) : 0);

  useEffect(() => {
    async function cargarSaldo() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCargandoSaldo(false);
        return;
      }
      const { data } = await supabase
        .from('user_progress')
        .select('saldo_ingresos')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setSaldoIngresos(Number(data.saldo_ingresos) || 0);
      setCargandoSaldo(false);
    }
    cargarSaldo();
  }, []);

  const montoValido = montoEfectivo > 0 && montoEfectivo <= saldoIngresos;
  const cuentaValida = cuentaBancaria.trim().length > 0;
  const puedeEnviar = montoValido && cuentaValida && !enviando && !exito;

  function seleccionarMonto(monto: number) {
    setMontoSeleccionado(monto);
    setMontoCustom('');
  }

  function handleMontoCustom(value: string) {
    const limpio = value.replace(/[^0-9]/g, '');
    setMontoCustom(limpio);
    setMontoSeleccionado(null);
  }

  async function handleEnviar() {
    if (!puedeEnviar) return;
    setErrorMsg(null);
    setEnviando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Debes iniciar sesión para realizar el retiro.');
        setEnviando(false);
        return;
      }

      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('saldo_ingresos')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressError) {
        setErrorMsg('Error al consultar el saldo: ' + progressError.message);
        setEnviando(false);
        return;
      }

      const saldoActual = Number(progress?.saldo_ingresos) || 0;
      if (montoEfectivo > saldoActual) {
        setErrorMsg('El monto excede el saldo disponible en tu billetera.');
        setEnviando(false);
        return;
      }

      const { error: insertError } = await supabase.from('retiros').insert({
        user_id: user.id,
        amount: montoEfectivo,
        bank_account: cuentaBancaria.trim(),
        status: 'pendiente',
      });

      if (insertError) {
        setErrorMsg('Error al registrar el retiro: ' + insertError.message);
        setEnviando(false);
        return;
      }

      const nuevoSaldo = saldoActual - montoEfectivo;
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({ saldo_ingresos: nuevoSaldo, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) {
        setErrorMsg('Retiro registrado pero no se pudo actualizar el saldo.');
        setEnviando(false);
        return;
      }

      setExito(true);
      setTimeout(() => navigate('/perfil'), 1800);
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setEnviando(false);
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-24"
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

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-6">
        {/* Header */}
        <header className="w-full max-w-lg mx-auto flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/perfil')}
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
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: '#FFC107' }} />
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
          </div>
        </header>

        {/* Wallet balance card */}
        <div className="w-full max-w-lg mx-auto mb-6">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12)',
            }}
          >
            <div className="p-5 flex items-center gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,193,7,0.1)',
                  border: '1px solid rgba(255,193,7,0.3)',
                }}
              >
                <Coins size={24} style={{ color: '#FFC107' }} />
              </div>
              <div className="flex-1">
                <span
                  className="text-xs font-bold uppercase tracking-wider block mb-1"
                  style={{ color: '#888888' }}
                >
                  Saldo disponible
                </span>
                <p
                  className="text-2xl font-black"
                  style={{ color: '#FFC107' }}
                >
                  {cargandoSaldo ? (
                    <Loader2 size={22} className="animate-spin" style={{ color: '#FFC107' }} />
                  ) : (
                    `${formatMoney(saldoIngresos)} COP`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount selection */}
        <div className="w-full max-w-lg mx-auto mb-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Wallet size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Selecciona el monto
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {MONTOS_PREDEFINIDOS.map((monto) => {
              const seleccionado = montoSeleccionado === monto;
              return (
                <button
                  key={monto}
                  onClick={() => seleccionarMonto(monto)}
                  className="py-4 rounded-2xl font-black text-base transition-all duration-300 active:scale-95"
                  style={{
                    background: seleccionado
                      ? 'rgba(255,193,7,0.15)'
                      : '#1A1A1A',
                    border: `1px solid ${
                      seleccionado
                        ? 'rgba(255,193,7,0.6)'
                        : 'rgba(255,193,7,0.2)'
                    }`,
                    color: seleccionado ? '#FFC107' : '#AAAAAA',
                    boxShadow: seleccionado
                      ? '0 0 24px rgba(255,193,7,0.2)'
                      : 'none',
                  }}
                >
                  {formatMoney(monto)}
                </button>
              );
            })}
          </div>

          {/* Custom amount input */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: '#1A1A1A',
              border: `1px solid ${
                montoCustom
                  ? 'rgba(255,193,7,0.4)'
                  : 'rgba(255,193,7,0.2)'
              }`,
            }}
          >
            <label
              className="text-xs font-bold uppercase tracking-wider block mb-2"
              style={{ color: '#888888' }}
            >
              Monto personalizado
            </label>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg" style={{ color: '#FFC107' }}>
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ingresa un monto"
                value={montoCustom ? formatMoney(Number(montoCustom)) : ''}
                onChange={(e) => handleMontoCustom(e.target.value)}
                disabled={enviando || exito}
                className="flex-1 bg-transparent text-lg font-black text-white placeholder-gray-600 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Insufficient balance warning */}
          {montoEfectivo > 0 && montoEfectivo > saldoIngresos && !cargandoSaldo && (
            <div
              className="mt-3 p-3 rounded-xl flex items-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <AlertTriangle size={16} style={{ color: '#ef4444' }} />
              <p className="text-xs" style={{ color: '#ef4444' }}>
                El monto supera tu saldo disponible.
              </p>
            </div>
          )}
        </div>

        {/* ===== Bloque Inferior: Cuenta Bancaria + Enviar ===== */}
        <div className="w-full max-w-lg mx-auto">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12)',
            }}
          >
            {/* Bank account input */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Landmark size={16} style={{ color: '#FFC107' }} />
                <label
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#FFC107' }}
                >
                  Cuenta bancaria
                </label>
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ingresa tu número de cuenta"
                value={cuentaBancaria}
                onChange={(e) =>
                  setCuentaBancaria(e.target.value.replace(/[^0-9]/g, ''))
                }
                disabled={enviando || exito}
                className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none disabled:opacity-50"
                style={{
                  background: '#0F0F0F',
                  border: '1px solid rgba(255,193,7,0.2)',
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    'rgba(255,193,7,0.6)';
                  (e.target as HTMLInputElement).style.boxShadow =
                    '0 0 16px rgba(255,193,7,0.15)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    'rgba(255,193,7,0.2)';
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="px-5 pb-3">
                <div
                  className="p-3 rounded-xl text-xs text-center"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                  }}
                >
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Enviar button */}
            <div className="px-5 pb-5">
              <button
                onClick={handleEnviar}
                disabled={!puedeEnviar}
                className="w-full py-4 rounded-2xl font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
                style={{
                  background: puedeEnviar ? '#FFC107' : 'rgba(255,193,7,0.15)',
                  color: puedeEnviar ? '#000000' : '#555555',
                  border: `1px solid ${
                    puedeEnviar
                      ? 'rgba(255,193,7,0.6)'
                      : 'rgba(255,193,7,0.15)'
                  }`,
                  boxShadow: puedeEnviar
                    ? '0 4px 24px rgba(255,193,7,0.35)'
                    : 'none',
                  cursor: puedeEnviar ? 'pointer' : 'not-allowed',
                  opacity: puedeEnviar ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (puedeEnviar) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#FFD700';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 6px 36px rgba(255,193,7,0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (puedeEnviar) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#FFC107';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 4px 24px rgba(255,193,7,0.35)';
                  }
                }}
              >
                {enviando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Enviar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Floating success notification ===== */}
      {exito && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="rounded-3xl p-8 flex flex-col items-center text-center max-w-xs w-full"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(34,197,94,0.5)',
              boxShadow: '0 0 60px rgba(34,197,94,0.3)',
              animation: 'popIn 0.3s ease-out',
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid rgba(34,197,94,0.5)',
                boxShadow: '0 0 32px rgba(34,197,94,0.3)',
              }}
            >
              <CheckCircle2 size={32} style={{ color: '#22C55E' }} />
            </div>
            <h2
              className="font-black text-xl mb-2"
              style={{ color: '#22C55E' }}
            >
              Operación exitosa
            </h2>
            <p className="text-sm" style={{ color: '#888888' }}>
              Tu retiro por {formatMoney(montoEfectivo)} COP ha sido registrado.
              Redirigiendo a tu perfil...
            </p>
          </div>
          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
