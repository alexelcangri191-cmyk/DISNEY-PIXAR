import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, ChevronDown, Check, Lock } from 'lucide-react';

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

  const puntos = [
    'Los retiros estarán disponible únicamente de lunes a viernes en horario de oficina hora colombiana de 08:00 am a 12:00 pm y de 02:00 pm a 06:00 pm (hora colombiana) fuera de estos días y horas nuestro personal y el sistema no procesara ninguna solicitud.',
    'Debe tener en cuenta que sobre cada retiro se cobrará una comisión del 10% al monto a retirar.',
    'El dinero restante será transferido a su cuenta Nequi o Bancolombia registrada en la app.',
    'Sola mente se puede realizar un retiro x día y una vez realizado la solicitud de retiro el sistema procesara su solicitud y en el lapso no mayor a las siguientes Horas será respectiva mente hecho efectivo su retiro.',
    'Verificar que el monto seleccionado a retirar sea el que usted ha escogido y así evitar demoras en las transacciones.',
  ];

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
      </div>
    </div>
  );
}
