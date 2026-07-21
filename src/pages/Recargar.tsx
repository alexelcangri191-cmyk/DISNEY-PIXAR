import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Wallet, Smartphone, Building2, Sparkles } from 'lucide-react';

const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const MONTOS_PRESET = [150000, 300000, 500000, 1000000];

const METODOS = [
  { id: 'nequi', label: 'Nequi', Icon: Smartphone },
  { id: 'bancolombia', label: 'Bancolombia', Icon: Building2 },
];

function formatearHora(fecha: Date): string {
  let horas = fecha.getHours();
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  const ampm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12;
  horas = horas ? horas : 12;
  return `${horas}:${minutos} ${ampm}`;
}

function formatCOP(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`;
}

export default function Recargar() {
  const navigate = useNavigate();
  const [horaActual, setHoraActual] = useState(new Date());
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(null);
  const [montoCustom, setMontoCustom] = useState('');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    setHoraActual(new Date());
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const diaSemana = DIAS_SEMANA[horaActual.getDay()];
  const horaTexto = formatearHora(horaActual);

  const montoFinal = montoSeleccionado ?? (montoCustom ? Number(montoCustom) : 0);
  const puedeContinuar = montoFinal >= 1000 && !!metodoSeleccionado;

  function handleContinuar() {
    if (!puedeContinuar) return;
    navigate('/qr', {
      state: {
        amount: montoFinal,
        paymentMethod: metodoSeleccionado,
      },
    });
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

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-6">
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
            Recargar
          </h1>
        </header>

        {/* Schedule Notice Block */}
        <div
          className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden mb-6"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,193,7,0.15)',
            boxShadow: '0 0 30px rgba(255,193,7,0.08)',
          }}
        >
          <div className="flex">
            <div
              className="flex-shrink-0 w-1.5"
              style={{ background: 'linear-gradient(180deg, #FFD700, #FFC107, #B8860B)' }}
            />
            <div className="flex-1 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: '#FFC107' }} />
                <h2 className="font-bold text-sm tracking-wide" style={{ color: '#FFC107' }}>
                  Recargas fuera de horario
                </h2>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#AAAAAA' }}>
                Disponible de Lunes a Viernes de 08:00 AM – 12:00 PM y 2:00 PM – 6:00 PM.
              </p>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(255,193,7,0.06)',
                  border: '1px solid rgba(255,193,7,0.12)',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#FFC107' }} />
                <p className="text-xs" style={{ color: '#888888' }}>
                  Hora actual:{' '}
                  <span className="font-semibold" style={{ color: '#CCCCCC' }}>
                    {diaSemana} {horaTexto}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="w-full max-w-lg mx-auto mb-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Wallet size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Selecciona el Monto
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {MONTOS_PRESET.map((monto) => {
              const active = montoSeleccionado === monto;
              return (
                <button
                  key={monto}
                  onClick={() => {
                    setMontoSeleccionado(monto);
                    setMontoCustom('');
                  }}
                  className="rounded-xl py-4 font-black text-base transition-all duration-300 active:scale-95"
                  style={{
                    background: active ? 'rgba(255,193,7,0.12)' : '#1A1A1A',
                    border: `1px solid ${active ? 'rgba(255,193,7,0.5)' : 'rgba(255,193,7,0.2)'}`,
                    boxShadow: active ? '0 0 20px rgba(255,193,7,0.15)' : 'none',
                    color: active ? '#FFC107' : '#FFFFFF',
                  }}
                >
                  {formatCOP(monto)}
                </button>
              );
            })}
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: '#FFC107' }}
            >
              Monto personalizado (COP)
            </label>
            <input
              type="number"
              placeholder="Ingresa otro monto"
              value={montoCustom}
              onChange={(e) => {
                setMontoCustom(e.target.value);
                setMontoSeleccionado(null);
              }}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none"
              style={{
                background: '#0F0F0F',
                border: `1px solid ${montoCustom ? 'rgba(255,193,7,0.5)' : 'rgba(255,193,7,0.2)'}`,
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.6)';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 16px rgba(255,193,7,0.15)';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = montoCustom
                  ? 'rgba(255,193,7,0.5)'
                  : 'rgba(255,193,7,0.2)';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="w-full max-w-lg mx-auto mb-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Sparkles size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Método de Pago
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {METODOS.map(({ id, label, Icon }) => {
              const active = metodoSeleccionado === id;
              return (
                <button
                  key={id}
                  onClick={() => setMetodoSeleccionado(id)}
                  className="rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 active:scale-95"
                  style={{
                    background: active ? 'rgba(255,193,7,0.12)' : '#1A1A1A',
                    border: `1px solid ${active ? 'rgba(255,193,7,0.5)' : 'rgba(255,193,7,0.2)'}`,
                    boxShadow: active ? '0 0 20px rgba(255,193,7,0.15)' : 'none',
                  }}
                >
                  <Icon
                    size={24}
                    style={{ color: active ? '#FFC107' : '#888888', transition: 'color 0.2s' }}
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: active ? '#FFC107' : '#FFFFFF' }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="w-full max-w-lg mx-auto">
          <button
            onClick={handleContinuar}
            disabled={!puedeContinuar}
            className="w-full py-4 rounded-2xl font-extrabold text-base tracking-wide transition-all duration-300 active:scale-95"
            style={{
              background: puedeContinuar ? '#FFC107' : 'rgba(255,193,7,0.2)',
              color: '#000000',
              boxShadow: puedeContinuar ? '0 4px 24px rgba(255,193,7,0.35)' : 'none',
              opacity: puedeContinuar ? 1 : 0.5,
              cursor: puedeContinuar ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (puedeContinuar) {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFD700';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 36px rgba(255,193,7,0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (puedeContinuar) {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFC107';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(255,193,7,0.35)';
              }
            }}
          >
            {montoFinal > 0 ? `Continuar · ${formatCOP(montoFinal)}` : 'Selecciona monto y método'}
          </button>
        </div>
      </div>
    </div>
  );
}
