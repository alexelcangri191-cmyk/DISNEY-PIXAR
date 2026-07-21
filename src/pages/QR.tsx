import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, QrCode, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

interface QRLocationState {
  amount: number;
  paymentMethod: string;
}

function formatCOP(amount: number): string {
  return `COP ${amount.toLocaleString('es-CO')}`;
}

function generarOrdenNumero(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

export default function QR() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, paymentMethod } = (location.state as QRLocationState) || {
    amount: 0,
    paymentMethod: '',
  };

  const [orderNumber] = useState(() => generarOrdenNumero());
  const [referencia, setReferencia] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const metodoLabel = useMemo(() => {
    if (paymentMethod === 'nequi') return 'Nequi';
    if (paymentMethod === 'bancolombia') return 'Bancolombia';
    return paymentMethod || '—';
  }, [paymentMethod]);

  const referenciaValida = referencia.trim().length > 0;

  async function handleEntregar() {
    if (!referenciaValida || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('No hay sesión activa. Inicia sesión de nuevo.');
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('recargas').insert({
        user_id: user.id,
        order_number: orderNumber,
        amount,
        payment_method: paymentMethod,
        reference_number: referencia.trim(),
        status: 'pendiente',
      });

      if (insertError) {
        setErrorMsg('Error al registrar la recarga: ' + insertError.message);
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/niveles'), 1800);
    } catch {
      setErrorMsg('Error de conexión. Verifica tu internet e intenta de nuevo.');
      setSubmitting(false);
    }
  }

  if (!amount || !paymentMethod) {
    return (
      <div
        className="relative min-h-screen overflow-x-hidden pb-20 flex items-center justify-center"
        style={{ background: '#000000' }}
      >
        <div className="text-center px-4">
          <AlertTriangle size={32} style={{ color: '#FFC107' }} className="mx-auto mb-4" />
          <p className="text-sm mb-6" style={{ color: '#888888' }}>
            No se recibió información de la recarga. Selecciona un monto y método primero.
          </p>
          <button
            onClick={() => navigate('/recargar')}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: '#FFC107', color: '#000000' }}
          >
            Ir a Recargar
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-20"
      style={{ background: '#000000' }}
    >
      {/* Ambient glow */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

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
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,193,7,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#FFC107';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,193,7,0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = '#888888';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="font-black text-xl tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Pago QR
          </h1>
        </header>

        {/* Payment Card */}
        <div className="w-full max-w-lg mx-auto">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Order Number */}
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#888888' }}
                >
                  Número de orden:
                </span>
                <span
                  className="text-sm font-black tracking-wide"
                  style={{ color: '#FFC107' }}
                >
                  {orderNumber}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              className="mx-5 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,193,7,0.3), transparent)',
              }}
            />

            {/* Amount + Method */}
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#888888' }}
                >
                  Monto a pagar:
                </span>
                <span
                  className="text-lg font-black"
                  style={{ color: '#FFC107' }}
                >
                  {formatCOP(amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#888888' }}
                >
                  Método:
                </span>
                <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                  {metodoLabel}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              className="mx-5 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,193,7,0.3), transparent)',
              }}
            />

            {/* QR Placeholder */}
            <div className="p-5 flex flex-col items-center">
              <div
                className="w-56 h-56 rounded-2xl flex items-center justify-center"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(255,193,7,0.3)',
                  boxShadow: '0 0 24px rgba(255,193,7,0.1)',
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <QrCode size={80} style={{ color: '#1A1A1A' }} />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#888888' }}
                  >
                    Código QR
                  </span>
                </div>
              </div>
              <p className="text-xs mt-3 text-center" style={{ color: '#888888' }}>
                Escanea el código QR con {metodoLabel} para completar el pago
              </p>
            </div>

            {/* Divider */}
            <div
              className="mx-5 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,193,7,0.3), transparent)',
              }}
            />

            {/* Reference Input */}
            <div className="p-5">
              <label
                className="text-xs font-semibold uppercase tracking-wider block mb-2"
                style={{ color: '#FFC107' }}
              >
                * Referencia:
              </label>
              <input
                type="text"
                placeholder="Por favor ingrese una referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                disabled={submitting || success}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none"
                style={{
                  background: '#0F0F0F',
                  border: `1px solid ${referenciaValida ? 'rgba(255,193,7,0.5)' : 'rgba(255,193,7,0.2)'}`,
                  opacity: submitting || success ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.6)';
                  (e.target as HTMLInputElement).style.boxShadow = '0 0 16px rgba(255,193,7,0.15)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = referenciaValida
                    ? 'rgba(255,193,7,0.5)'
                    : 'rgba(255,193,7,0.2)';
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="px-5 pb-3">
                <div
                  className="p-3 rounded-xl flex items-center gap-3"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                  }}
                >
                  <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                  <span className="text-xs font-bold" style={{ color: '#EF4444' }}>
                    {errorMsg}
                  </span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="px-5 pb-3">
                <div
                  className="p-4 rounded-xl flex items-center gap-3"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.4)',
                  }}
                >
                  <CheckCircle2 size={20} style={{ color: '#22C55E' }} />
                  <span className="text-sm font-bold" style={{ color: '#22C55E' }}>
                    Transacción exitosa. Redirigiendo a niveles...
                  </span>
                </div>
              </div>
            )}

            {/* Entregar Button */}
            <div className="p-5 pt-2">
              <button
                onClick={handleEntregar}
                disabled={!referenciaValida || submitting || success}
                className="w-full py-4 rounded-2xl font-extrabold text-base tracking-wide transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: referenciaValida && !submitting && !success ? '#FFC107' : 'rgba(255,193,7,0.2)',
                  color: '#000000',
                  boxShadow: referenciaValida && !submitting && !success ? '0 4px 24px rgba(255,193,7,0.35)' : 'none',
                  opacity: referenciaValida && !submitting && !success ? 1 : 0.5,
                  cursor: referenciaValida && !submitting && !success ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) => {
                  if (referenciaValida && !submitting && !success) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#FFD700';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 36px rgba(255,193,7,0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (referenciaValida && !submitting && !success) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#FFC107';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(255,193,7,0.35)';
                  }
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando...
                  </>
                ) : success ? (
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
      </div>

      <BottomNav />
    </div>
  );
}
