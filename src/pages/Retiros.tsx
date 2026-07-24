import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpFromLine,
  Wallet,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Landmark,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000];

const formatMoney = (amount: number) =>
  `$${amount.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export default function Retiros() {
  const navigate = useNavigate();

  const [saldoIngresos, setSaldoIngresos] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSaldo() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from('user_progress')
          .select('saldo_ingresos')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setSaldoIngresos(Number(data.saldo_ingresos) || 0);
        }
      } catch {
        // Non-fatal
      } finally {
        setLoading(false);
      }
    }
    fetchSaldo();
  }, []);

  const customParsed = Number(customAmount.replace(/\D/g, '')) || 0;
  const selectedAmount =
    selectedPreset !== null ? selectedPreset : customParsed;

  const hasAmount = selectedAmount > 0;
  const hasBankAccount = bankAccount.trim().length > 0;
  const canSubmit = hasAmount && hasBankAccount && !submitting;

  function handlePresetClick(value: number) {
    setSelectedPreset(value);
    setCustomAmount('');
    setErrorMsg(null);
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    setCustomAmount(digits);
    setSelectedPreset(null);
    setErrorMsg(null);
  }

  function handleBankAccountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, '');
    setBankAccount(digits);
    setErrorMsg(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Debes iniciar sesión para continuar.');
        setSubmitting(false);
        return;
      }

      const { data: fresh } = await supabase
        .from('user_progress')
        .select('saldo_ingresos')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentSaldo = Number(fresh?.saldo_ingresos) || 0;

      if (currentSaldo < selectedAmount) {
        setErrorMsg(
          `Saldo insuficiente. Tu billetera de ingresos tiene ${formatMoney(
            currentSaldo
          )}.`
        );
        setSubmitting(false);
        return;
      }

      const newSaldo = currentSaldo - selectedAmount;

      const { error: updateErr } = await supabase
        .from('user_progress')
        .update({ saldo_ingresos: newSaldo })
        .eq('user_id', user.id);

      if (updateErr) {
        setErrorMsg('Error al actualizar el saldo. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }

      const { error: insertErr } = await supabase.from('retiros').insert({
        user_id: user.id,
        amount: selectedAmount,
        bank_account: bankAccount.trim(),
        status: 'pendiente',
      });

      if (insertErr) {
        await supabase
          .from('user_progress')
          .update({ saldo_ingresos: currentSaldo })
          .eq('user_id', user.id);
        setErrorMsg('Error al registrar el retiro. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }

      setSaldoIngresos(newSaldo);
      setSuccess(true);

      setTimeout(() => {
        navigate('/perfil');
      }, 1800);
    } catch {
      setErrorMsg('Error de conexión. Verifica tu internet e intenta de nuevo.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        className="relative min-h-screen overflow-x-hidden flex items-center justify-center"
        style={{ background: '#000000' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#FFC107', animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#FFC107', animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#FFC107', animationDelay: '300ms' }}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-24"
      style={{ background: '#000000' }}
    >
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

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-2 transition-opacity hover:opacity-70 active:scale-95"
            style={{ color: '#FFC107' }}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Regresar al Perfil</span>
          </button>
          <div className="flex items-center gap-2">
            <ArrowUpFromLine size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Retiros
            </span>
            <ArrowUpFromLine size={14} style={{ color: '#FFC107' }} />
          </div>
        </div>

        {/* Income wallet balance */}
        <div className="w-full max-w-lg mx-auto mb-5">
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              boxShadow: '0 0 20px rgba(255,193,7,0.06)',
            }}
          >
            <div className="flex items-center gap-2">
              <Coins size={18} style={{ color: '#FFC107' }} />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#888888' }}
              >
                Billetera de Ingresos
              </span>
            </div>
            <span className="font-black text-lg" style={{ color: '#FFC107' }}>
              {formatMoney(saldoIngresos)}
            </span>
          </div>
        </div>

        {/* Amount selection */}
        <div className="w-full max-w-lg mx-auto mb-5">
          <div
            className="rounded-2xl p-5"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.15)',
              boxShadow: '0 0 30px rgba(255,193,7,0.08)',
            }}
          >
            <label
              className="text-xs font-semibold uppercase tracking-wider block mb-3"
              style={{ color: '#FFC107' }}
            >
              Monto de Retiro
            </label>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {PRESET_AMOUNTS.map((value) => {
                const isActive = selectedPreset === value;
                const tooHigh = value > saldoIngresos;
                return (
                  <button
                    key={value}
                    onClick={() => handlePresetClick(value)}
                    disabled={tooHigh}
                    className="py-3 rounded-xl font-extrabold text-sm transition-all duration-300 active:scale-95"
                    style={{
                      background: isActive
                        ? '#FFC107'
                        : tooHigh
                        ? 'rgba(255,193,7,0.04)'
                        : 'rgba(255,193,7,0.06)',
                      color: isActive
                        ? '#000000'
                        : tooHigh
                        ? '#555555'
                        : '#FFC107',
                      border: `1px solid ${
                        isActive
                          ? '#FFC107'
                          : tooHigh
                          ? 'rgba(255,193,7,0.08)'
                          : 'rgba(255,193,7,0.25)'
                      }`,
                      boxShadow: isActive
                        ? '0 4px 20px rgba(255,193,7,0.35)'
                        : 'none',
                      cursor: tooHigh ? 'not-allowed' : 'pointer',
                      opacity: tooHigh ? 0.5 : 1,
                    }}
                  >
                    {formatMoney(value)}
                  </button>
                );
              })}
            </div>

            <label
              className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: '#FFC107' }}
            >
              O ingresa un monto personalizado
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                style={{ color: '#FFC107' }}
              >
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={customAmount ? Number(customAmount).toLocaleString('es-CO') : ''}
                onChange={handleCustomChange}
                className="w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none"
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

            {hasAmount && (
              <div
                className="mt-3 rounded-xl p-3 flex items-center justify-between"
                style={{
                  background: 'rgba(255,193,7,0.06)',
                  border: '1px solid rgba(255,193,7,0.15)',
                }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#888888' }}
                >
                  Monto seleccionado
                </span>
                <span className="font-black text-sm" style={{ color: '#FFC107' }}>
                  {formatMoney(selectedAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bank account + Enviar block (lower block) */}
        <div className="w-full max-w-lg mx-auto">
          <div
            className="rounded-2xl p-5"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.15)',
              boxShadow: '0 0 30px rgba(255,193,7,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Landmark size={16} style={{ color: '#FFC107' }} />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#FFC107' }}
              >
                Cuenta Bancaria
              </span>
            </div>

            <label
              className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: '#FFC107' }}
            >
              Cuenta Bancaria
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ingresa tu número de cuenta"
              value={bankAccount}
              onChange={handleBankAccountChange}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none"
              style={{
                background: '#0F0F0F',
                border: '1px solid rgba(255,193,7,0.2)',
                letterSpacing: '0.1em',
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

            {errorMsg && (
              <div
                className="mt-4 p-3 rounded-xl flex items-center gap-3"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.4)',
                }}
              >
                <AlertTriangle size={18} style={{ color: '#EF4444' }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: '#EF4444' }}
                >
                  {errorMsg}
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full mt-5 py-4 rounded-2xl font-extrabold text-base tracking-wide transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: canSubmit ? '#FFC107' : 'rgba(255,193,7,0.2)',
                color: canSubmit ? '#000000' : '#777777',
                boxShadow: canSubmit
                  ? '0 4px 24px rgba(255,193,7,0.35)'
                  : 'none',
                opacity: canSubmit ? 1 : 0.6,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (canSubmit) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    '#FFD700';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 6px 36px rgba(255,193,7,0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (canSubmit) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    '#FFC107';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 4px 24px rgba(255,193,7,0.35)';
                }
              }}
            >
              {submitting ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{
                      borderColor: '#000',
                      borderTopColor: 'transparent',
                    }}
                  />
                  Procesando...
                </>
              ) : (
                <>
                  <ArrowUpFromLine size={18} />
                  Enviar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Success notification */}
      {success && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-8 text-center"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(34,197,94,0.4)',
              boxShadow: '0 0 60px rgba(34,197,94,0.2)',
            }}
          >
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)' }}
            >
              <CheckCircle2 size={32} style={{ color: '#22C55E' }} />
            </div>
            <h3
              className="font-black text-xl mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Operación exitosa
            </h3>
            <p className="text-sm" style={{ color: '#888888' }}>
              Tu retiro por {formatMoney(selectedAmount)} ha sido registrado.
              Redirigiendo a tu perfil...
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#FFC107', animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#FFC107', animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#FFC107', animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
