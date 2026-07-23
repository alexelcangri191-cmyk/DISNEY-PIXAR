import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Wrench,
  Info,
  AlertTriangle,
  Hash,
  Wallet,
  QrCode,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RecargaState {
  monto: number;
  metodo: string;
}

function generarNumeroOrden(): string {
  const ts = Date.now().toString();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD${ts}${rand}`;
}

function formatoCOP(monto: number): string {
  return `COP ${monto.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function PaginaQR() {
  const navigate = useNavigate();
  const location = useLocation();
  const { monto, metodo } = (location.state as RecargaState) || {
    monto: 0,
    metodo: '',
  };

  const numeroOrden = useMemo(() => generarNumeroOrden(), []);
  const [referencia, setReferencia] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const puedeEntregar = referencia.trim().length > 0 && !enviando && !exito;

  async function handleEntregar() {
    if (!puedeEntregar) return;
    setErrorMsg(null);
    setEnviando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Debes iniciar sesión para registrar la recarga.');
        setEnviando(false);
        return;
      }

      const { error: insertError } = await supabase.from('recargas').insert({
        user_id: user.id,
        order_number: numeroOrden,
        monto,
        metodo_pago: metodo,
        numero_referencia: referencia.trim(),
        status: 'pendiente',
      });

      if (insertError) {
        setErrorMsg(
          'Error al registrar la transacción: ' + insertError.message
        );
        setEnviando(false);
        return;
      }

      setExito(true);
      setTimeout(() => navigate('/niveles'), 1800);
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setEnviando(false);
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#000000' }}
    >
      {/* Ambient glow - same as Perfil */}
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
            onClick={() => navigate('/recargar')}
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
              Página QR
            </h1>
          </div>
        </header>

        {/* Información y Pasos de Recarga */}
        <div className="w-full max-w-lg mx-auto mb-6">
          {/* Title section */}
          <div className="flex items-center gap-2 mb-1 px-1">
            <Info size={16} style={{ color: '#FFC107' }} />
            <h2
              className="font-black text-lg tracking-tight"
              style={{
                background:
                  'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Información
            </h2>
          </div>
          <p
            className="text-xs font-bold uppercase tracking-wider mb-4 px-1"
            style={{ color: '#888888' }}
          >
            Pasos para tu recarga
          </p>

          {/* Steps card */}
          <div
            className="rounded-2xl overflow-hidden"
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
                {[
                  'Abre tu aplicación de Nequi en tu celular',
                  'Escanea el código QR que está a continuación e introduce el importe indicado',
                  'Una vez completada la transferencia y que sea exitosa, ingresa el código de referencia que te arroja el envío',
                  'Al ingresar el número del voucher de abajo, le das a la opción entregar y espera el tiempo indicado para que tu recarga sea activada en la app.',
                ].map((paso, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs"
                      style={{
                        background: 'rgba(255,193,7,0.12)',
                        border: '1px solid rgba(255,193,7,0.4)',
                        color: '#FFC107',
                      }}
                    >
                      {i + 1}
                    </span>
                    <p
                      className="text-sm leading-relaxed pt-0.5"
                      style={{ color: '#AAAAAA' }}
                    >
                      {paso}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NOTE callout */}
          <div
            className="mt-4 rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: 'rgba(255,193,7,0.06)',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 20px rgba(255,193,7,0.08)',
            }}
          >
            <AlertTriangle size={18} style={{ color: '#FFC107' }} />
            <p
              className="text-xs leading-relaxed"
              style={{ color: '#CCCCCC' }}
            >
              <span className="font-black" style={{ color: '#FFC107' }}>
                NOTA:{' '}
              </span>
              asegúrate de rellenar correctamente la Referencia con los datos emitidos de tu pago del voucher, para evitar demoras y que tu dinero llegue con más rapidez y facilidad a la billetera de tu app.
            </p>
          </div>
        </div>

        {/* ===== Bloque de Pago QR ===== */}
        <div className="w-full max-w-lg mx-auto mb-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Wallet size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Pago
            </span>
          </div>

          {/* Payment card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12)',
            }}
          >
            {/* Order Number */}
            <div
              className="p-5 flex items-center justify-between"
              style={{
                borderBottom: '1px solid rgba(255,193,7,0.15)',
              }}
            >
              <div className="flex items-center gap-2">
                <Hash size={16} style={{ color: '#FFC107' }} />
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#888888' }}
                >
                  Número de orden:
                </span>
              </div>
              <span
                className="font-black text-sm"
                style={{ color: '#FFC107' }}
              >
                {numeroOrden}
              </span>
            </div>

            {/* Amount to Pay */}
            <div
              className="p-5 flex items-center justify-between"
              style={{
                borderBottom: '1px solid rgba(255,193,7,0.15)',
              }}
            >
              <div className="flex items-center gap-2">
                <Wallet size={16} style={{ color: '#FFC107' }} />
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#888888' }}
                >
                  Monto a pagar:
                </span>
              </div>
              <span
                className="font-black text-base"
                style={{ color: '#FFC107' }}
              >
                {formatoCOP(monto)}
              </span>
            </div>

            {/* QR Placeholder Container */}
            <div className="px-5 py-8 flex flex-col items-center">
              <div
                className="w-48 h-48 rounded-2xl flex items-center justify-center"
                style={{
                  background: '#FFFFFF',
                  border: '2px dashed rgba(255,193,7,0.4)',
                  boxShadow: '0 0 24px rgba(255,193,7,0.1)',
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <QrCode size={48} style={{ color: '#CCCCCC' }} />
                  <span
                    className="text-[0.6rem] font-bold uppercase tracking-wider"
                    style={{ color: '#999999' }}
                  >
                    QR próximamente
                  </span>
                </div>
              </div>
              <p
                className="text-xs mt-3 text-center"
                style={{ color: '#888888' }}
              >
                Escanea este código con tu app {metodo || 'de pagos'}
              </p>
            </div>

            {/* Reference Input */}
            <div
              className="px-5 pb-5"
              style={{
                borderTop: '1px solid rgba(255,193,7,0.15)',
              }}
            >
              <label
                className="text-xs font-bold uppercase tracking-wider block mb-2"
                style={{ color: '#FFC107' }}
              >
                * Referencia:
              </label>
              <input
                type="text"
                placeholder="Por favor ingrese una referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                disabled={enviando || exito}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none disabled:opacity-50"
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

            {/* Success message */}
            {exito && (
              <div className="px-5 pb-3">
                <div
                  className="p-3 rounded-xl flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.4)',
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
                  <span
                    className="text-sm font-bold"
                    style={{ color: '#22C55E' }}
                  >
                    Transacción exitosa. Redirigiendo...
                  </span>
                </div>
              </div>
            )}

            {/* Entregar button */}
            <div className="px-5 pb-5">
              <button
                onClick={handleEntregar}
                disabled={!puedeEntregar}
                className="w-full py-4 rounded-2xl font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
                style={{
                  background: puedeEntregar ? '#FFC107' : 'rgba(255,193,7,0.15)',
                  color: puedeEntregar ? '#000000' : '#555555',
                  border: `1px solid ${
                    puedeEntregar
                      ? 'rgba(255,193,7,0.6)'
                      : 'rgba(255,193,7,0.15)'
                  }`,
                  boxShadow: puedeEntregar
                    ? '0 4px 24px rgba(255,193,7,0.35)'
                    : 'none',
                  cursor: puedeEntregar ? 'pointer' : 'not-allowed',
                  opacity: puedeEntregar ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (puedeEntregar) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#FFD700';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 6px 36px rgba(255,193,7,0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (puedeEntregar) {
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
                    Enviando...
                  </>
                ) : exito ? (
                  <>
                    <CheckCircle2 size={18} />
                    Entregado
                  </>
                ) : (
                  'Entregar'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Under Construction placeholder (kept from original page) */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="w-full max-w-lg rounded-3xl p-10 flex flex-col items-center text-center"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              boxShadow:
                '0 0 40px rgba(255,193,7,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'rgba(255,193,7,0.1)',
                border: '2px solid rgba(255,193,7,0.3)',
                boxShadow:
                  '0 0 32px rgba(255,193,7,0.2), inset 0 0 16px rgba(255,193,7,0.05)',
              }}
            >
              <Wrench size={36} style={{ color: '#FFC107' }} />
            </div>

            {/* Title */}
            <h2
              className="font-black text-2xl mb-3"
              style={{
                background:
                  'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              En construcción
            </h2>

            {/* Message */}
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: '#888888' }}
            >
              Estamos trabajando en esta página. Pronto podrás ver aquí tu
              código QR para completar la recarga.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
