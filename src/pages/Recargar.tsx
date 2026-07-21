import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronDown, Check, Wallet, Send, Info } from 'lucide-react';

const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

function formatearHora(fecha: Date): string {
  let horas = fecha.getHours();
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  const ampm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12;
  horas = horas ? horas : 12;
  return `${horas}:${minutos} ${ampm}`;
}

const MONTOS = [
  150000, 480000, 1300000,
  4700000, 12800000, 31000000,
  67200000, 135000000, 325000000,
];

const METODOS_PAGO = ['Nequi', 'Bancolombia'];

const formatMoney = (amount: number) =>
  `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function Recargar() {
  const navigate = useNavigate();
  const [horaActual, setHoraActual] = useState(new Date());
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState<string>('');
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [botonHover, setBotonHover] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHoraActual(new Date());
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const diaSemana = DIAS_SEMANA[horaActual.getDay()];
  const horaTexto = formatearHora(horaActual);

  const puedeEnviar = montoSeleccionado !== null && metodoPago !== '';

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#000000' }}
    >
      {/* Ambient glow - same as Welcome */}
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
            Recargar
          </h1>
        </header>

        {/* Schedule Notice Block */}
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
            <div className="flex-1 p-5 flex flex-col gap-3">
              {/* Title */}
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: '#FFC107' }} />
                <h2
                  className="font-bold text-sm tracking-wide"
                  style={{ color: '#FFC107' }}
                >
                  Recargas fuera de horario
                </h2>
              </div>

              {/* Availability text */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#AAAAAA' }}
              >
                Disponible de Lunes a Viernes de 08:00 AM – 12:00 PM y 2:00 PM –
                6:00 PM.
              </p>

              {/* Current time */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(255,193,7,0.06)',
                  border: '1px solid rgba(255,193,7,0.12)',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#FFC107' }}
                />
                <p className="text-xs" style={{ color: '#888888' }}>
                  Hora actual:{' '}
                  <span
                    className="font-semibold"
                    style={{ color: '#CCCCCC' }}
                  >
                    {diaSemana} {horaTexto}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recharge Amount Selection Block */}
        <div className="w-full max-w-lg mx-auto mt-6">
          {/* Section Title: SELECCIONA UN MONTO */}
          <div className="flex items-center gap-2 mb-4 px-1">
            <Wallet size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Selecciona un Monto
            </span>
          </div>

          {/* Amount Grid 3x3 */}
          <div className="grid grid-cols-3 gap-2.5">
            {MONTOS.map((monto) => {
              const seleccionado = montoSeleccionado === monto;
              return (
                <button
                  key={monto}
                  onClick={() => setMontoSeleccionado(monto)}
                  className="rounded-xl py-3 px-1 text-center transition-all duration-300 active:scale-95"
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
                      ? '0 0 20px rgba(255,193,7,0.25), inset 0 1px 0 rgba(255,255,255,0.04)'
                      : '0 0 10px rgba(255,193,7,0.04), inset 0 1px 0 rgba(255,255,255,0.02)',
                  }}
                >
                  <span
                    className="font-bold text-sm"
                    style={{
                      color: seleccionado ? '#FFC107' : '#CCCCCC',
                    }}
                  >
                    {formatMoney(monto)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Deposit Amount Display */}
          <div className="mt-5">
            <span
              className="text-xs font-bold uppercase tracking-wider block mb-2 px-1"
              style={{ color: '#888888' }}
            >
              Monto del Depósito
            </span>
            <div
              className="rounded-2xl px-5 py-4 flex items-center justify-between"
              style={{
                background: montoSeleccionado
                  ? 'rgba(255,193,7,0.08)'
                  : '#141414',
                border: `1px solid ${
                  montoSeleccionado
                    ? 'rgba(255,193,7,0.4)'
                    : 'rgba(255,193,7,0.1)'
                }`,
                boxShadow: montoSeleccionado
                  ? '0 0 24px rgba(255,193,7,0.15)'
                  : 'none',
                opacity: montoSeleccionado ? 1 : 0.6,
              }}
            >
              <span
                className="font-black text-lg"
                style={{
                  color: montoSeleccionado ? '#FFC107' : '#666666',
                }}
              >
                {montoSeleccionado
                  ? formatMoney(montoSeleccionado)
                  : 'Selecciona un monto'}
              </span>
              {montoSeleccionado && (
                <Check size={20} style={{ color: '#FFC107' }} />
              )}
            </div>
          </div>

          {/* Section Title: MÉTODO DE PAGO */}
          <div className="flex items-center gap-2 mt-7 mb-4 px-1">
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Método de Pago
            </span>
          </div>

          {/* Payment Method Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownAbierto(!dropdownAbierto)}
              className="w-full rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
              style={{
                background: metodoPago
                  ? 'rgba(255,193,7,0.08)'
                  : '#1A1A1A',
                border: `1px solid ${
                  dropdownAbierto
                    ? 'rgba(255,193,7,0.5)'
                    : metodoPago
                      ? 'rgba(255,193,7,0.4)'
                      : 'rgba(255,193,7,0.15)'
                }`,
                boxShadow: dropdownAbierto
                  ? '0 0 20px rgba(255,193,7,0.15)'
                  : '0 0 10px rgba(255,193,7,0.04)',
              }}
            >
              <span
                className="font-bold text-sm"
                style={{
                  color: metodoPago ? '#FFC107' : '#666666',
                }}
              >
                {metodoPago || 'Selecciona un método de pago'}
              </span>
              <ChevronDown
                size={18}
                style={{
                  color: dropdownAbierto ? '#FFC107' : '#888888',
                  transform: dropdownAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownAbierto && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20"
                style={{
                  background: '#1A1A1A',
                  border: '1px solid rgba(255,193,7,0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(255,193,7,0.1)',
                }}
              >
                {METODOS_PAGO.map((metodo) => (
                  <button
                    key={metodo}
                    onClick={() => {
                      setMetodoPago(metodo);
                      setDropdownAbierto(false);
                    }}
                    className="w-full px-5 py-3.5 flex items-center justify-between transition-all duration-200"
                    style={{
                      background:
                        metodoPago === metodo
                          ? 'rgba(255,193,7,0.1)'
                          : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (metodoPago !== metodo) {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          'rgba(255,193,7,0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (metodoPago !== metodo) {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          'transparent';
                      }
                    }}
                  >
                    <span
                      className="font-bold text-sm"
                      style={{
                        color: metodoPago === metodo ? '#FFC107' : '#CCCCCC',
                      }}
                    >
                      {metodo}
                    </span>
                    {metodoPago === metodo && (
                      <Check size={16} style={{ color: '#FFC107' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Send Button Block */}
        <div className="w-full max-w-lg mx-auto mt-8 mb-6">
          <button
            onClick={() => navigate('/recargas/qr')}
            disabled={!puedeEnviar}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-base transition-all duration-300 active:scale-[0.98]"
            style={{
              background: puedeEnviar
                ? botonHover
                  ? 'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #B8860B 100%)'
                  : 'linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #B8860B 100%)'
                : '#1A1A1A',
              color: puedeEnviar ? '#000000' : '#555555',
              border: `1px solid ${
                puedeEnviar
                  ? 'rgba(255,193,7,0.6)'
                  : 'rgba(255,193,7,0.1)'
              }`,
              boxShadow: puedeEnviar
                ? botonHover
                  ? '0 0 32px rgba(255,193,7,0.4), 0 4px 16px rgba(255,193,7,0.2)'
                  : '0 0 24px rgba(255,193,7,0.25), 0 4px 12px rgba(0,0,0,0.3)'
                : 'none',
              cursor: puedeEnviar ? 'pointer' : 'not-allowed',
              opacity: puedeEnviar ? 1 : 0.5,
            }}
            onMouseEnter={() => setBotonHover(true)}
            onMouseLeave={() => setBotonHover(false)}
          >
            <Send size={18} />
            <span>Enviar</span>
          </button>
        </div>

        {/* Información de Recargas Block */}
        <div
          className="w-full max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden"
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
                  Información de Recargas
                </h2>
              </div>

              {/* Info points */}
              <ul className="flex flex-col gap-3">
                {[
                  'El pago se procesará exclusivamente por Nequi.',
                  'Seleccione el monto, elija un método de pago y confirme dándole a enviar para continuar con los pasos a seguir con la operación.',
                  'Tu saldo se reflejará en el transcurso de 15 minutos a 30 minutos mientras se realiza la verificación correcta del pago y se reflejará en tu billetera personal.',
                  'Verificar que el monto seleccionado a enviar sea el que usted ha escogido para activar el nivel de su preferencia.',
                ].map((texto, i) => (
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
      </div>
    </div>
  );
}
