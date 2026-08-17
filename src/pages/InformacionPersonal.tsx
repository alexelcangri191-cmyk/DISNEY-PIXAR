import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  FileText,
  UserCheck,
  Hash,
  Building2,
  Save,
  ChevronDown,
  Check,
  Lock,
  AlertTriangle,
  Loader2,
  CreditCard,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import AnimatedBackground from '../components/AnimatedBackground';
import { supabase } from '../lib/supabase';

interface InstructionItem {
  icon: React.ReactNode;
  text: string;
}

const instructions: InstructionItem[] = [
  { icon: <FileText size={18} />, text: 'Deben llenarse correctamente todos los datos para evitar inconvenientes a la hora de realizar retiros.' },
  { icon: <UserCheck size={18} />, text: 'Verificar correctamente el titular de la cuenta.' },
  { icon: <Hash size={18} />, text: 'Colocar correctamente el número de cuenta a registrarse.' },
  { icon: <Building2 size={18} />, text: 'Realizar correctamente la selección del tipo de banco.' },
  { icon: <Save size={18} />, text: 'Recuerden que al enviar los datos serán guardados para el uso de desembolso y pagos.' },
];

interface CuentaBancaria {
  id: string;
  entidad_bancaria: string;
  numero_cuenta: string;
  titular: string;
}

export default function InformacionPersonal() {
  const navigate = useNavigate();

  const [entidad, setEntidad] = useState<string>('');
  const [numeroCuenta, setNumeroCuenta] = useState<string>('');
  const [titular, setTitular] = useState<string>('');
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  const [cuentaGuardada, setCuentaGuardada] = useState<CuentaBancaria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function cargarCuenta() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setCargando(false);
          return;
        }

        const { data, error } = await supabase
          .from('cuenta_bancaria')
          .select('id, entidad_bancaria, numero_cuenta, titular')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          setErrorMsg('Error al cargar tu cuenta bancaria.');
        } else if (data) {
          const cuenta = data as CuentaBancaria;
          setCuentaGuardada(cuenta);
          setEntidad(cuenta.entidad_bancaria);
          setNumeroCuenta(cuenta.numero_cuenta);
          setTitular(cuenta.titular);
        }
      } catch {
        setErrorMsg('Error de conexión al cargar la cuenta.');
      } finally {
        setCargando(false);
      }
    }
    cargarCuenta();
  }, []);

  const puedeEnviar =
    entidad.trim() !== '' &&
    numeroCuenta.trim() !== '' &&
    titular.trim() !== '' &&
    !enviando &&
    !cuentaGuardada;

  async function handleVincular() {
    if (!puedeEnviar) return;
    setErrorMsg(null);
    setEnviando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Debes iniciar sesión para vincular tu cuenta.');
        setEnviando(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('cuenta_bancaria')
        .insert({
          user_id: user.id,
          entidad_bancaria: entidad.trim(),
          numero_cuenta: numeroCuenta.trim(),
          titular: titular.trim(),
        })
        .select('id, entidad_bancaria, numero_cuenta, titular')
        .single();

      if (insertError) {
        if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
          setErrorMsg('Ya tienes una cuenta bancaria vinculada.');
        } else {
          setErrorMsg('Error al guardar: ' + insertError.message);
        }
        setEnviando(false);
        return;
      }

      setCuentaGuardada(data as CuentaBancaria);
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:opacity-70 active:scale-95"
            style={{
              background: 'rgba(255,193,7,0.1)',
              border: '1px solid rgba(255,193,7,0.3)',
              color: '#FFC107',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="text-lg font-black tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Información Personal
          </h1>
        </div>

        <div className="w-full max-w-lg mx-auto">
          {/* Tarjeta de Instrucciones */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid rgba(255,193,7,0.15)' }}
            >
              <Info size={18} style={{ color: '#FFC107' }} />
              <h2
                className="text-base font-extrabold uppercase tracking-wider"
                style={{ color: '#FFC107' }}
              >
                Información
              </h2>
            </div>

            <div className="p-5">
              <ul className="flex flex-col gap-4">
                {instructions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(255,193,7,0.1)' }}
                    >
                      <span style={{ color: '#FFC107' }}>{item.icon}</span>
                    </div>
                    <p
                      className="text-sm font-medium leading-relaxed"
                      style={{ color: '#CCCCCC', lineHeight: '1.75' }}
                    >
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,193,7,0.15)' }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#FFC107' }}
              />
              <p className="text-xs" style={{ color: '#888888' }}>
                Tenga en cuenta estos puntos antes de continuar.
              </p>
            </div>
          </div>

          {/* Bloque de Cuenta Bancaria */}
          <div
            className="mt-6 rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Cabecera con color de estilo perfil */}
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid rgba(255,193,7,0.15)' }}
            >
              <CreditCard size={18} style={{ color: '#FFC107' }} />
              <h2
                className="text-base font-black tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Información Personal
              </h2>
              {cuentaGuardada && (
                <span
                  className="ml-auto px-3 py-1 rounded-full text-xs font-extrabold tracking-wide flex items-center gap-1"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    color: '#22C55E',
                  }}
                >
                  <Lock size={11} />
                  VINCULADA
                </span>
              )}
            </div>

            {/* Cuerpo del formulario */}
            <div className="p-5 flex flex-col gap-4">
              {cargando ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin" style={{ color: '#FFC107' }} />
                </div>
              ) : (
                <>
                  {/* Campo 1: Entidad Bancaria */}
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#FFC107' }}
                    >
                      Entidad bancaria
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => !cuentaGuardada && setDropdownAbierto(!dropdownAbierto)}
                        disabled={!!cuentaGuardada}
                        className="w-full rounded-xl flex items-center justify-between transition-all duration-300"
                        style={{
                          background: '#0F0F0F',
                          border: `1px solid ${
                            dropdownAbierto
                              ? 'rgba(255,193,7,0.5)'
                              : entidad
                                ? 'rgba(255,193,7,0.4)'
                                : 'rgba(255,193,7,0.2)'
                          }`,
                          boxShadow: dropdownAbierto ? '0 0 16px rgba(255,193,7,0.15)' : 'none',
                          padding: '14px 16px',
                          cursor: cuentaGuardada ? 'not-allowed' : 'pointer',
                          opacity: cuentaGuardada ? 0.7 : 1,
                        }}
                      >
                        <span
                          className="text-sm font-bold"
                          style={{ color: entidad ? '#FFC107' : '#666666' }}
                        >
                          {entidad || 'Selecciona una entidad'}
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

                      {dropdownAbierto && !cuentaGuardada && (
                        <div
                          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-20"
                          style={{
                            background: '#1A1A1A',
                            border: '1px solid rgba(255,193,7,0.25)',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255,193,7,0.1)',
                          }}
                        >
                          {['Nequi', 'Bancolombia'].map((opcion) => {
                            const activo = entidad === opcion;
                            return (
                              <button
                                key={opcion}
                                type="button"
                                onClick={() => {
                                  setEntidad(opcion);
                                  setDropdownAbierto(false);
                                }}
                                className="w-full flex items-center justify-between transition-colors duration-200"
                                style={{
                                  padding: '14px 16px',
                                  background: activo ? 'rgba(255,193,7,0.1)' : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                  if (!activo) {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,193,7,0.06)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!activo) {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                  }
                                }}
                              >
                                <span
                                  className="text-sm font-bold"
                                  style={{ color: activo ? '#FFC107' : '#CCCCCC' }}
                                >
                                  {opcion}
                                </span>
                                {activo && <Check size={16} style={{ color: '#FFC107' }} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campo 2: Número de Cuenta */}
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#FFC107' }}
                    >
                      Número de cuenta
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ingresa el número de cuenta"
                      value={numeroCuenta}
                      onChange={(e) => setNumeroCuenta(e.target.value)}
                      disabled={!!cuentaGuardada}
                      className="w-full rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none disabled:opacity-70"
                      style={{
                        background: '#0F0F0F',
                        border: '1px solid rgba(255,193,7,0.2)',
                        padding: '14px 16px',
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.6)';
                        (e.target as HTMLInputElement).style.boxShadow = '0 0 16px rgba(255,193,7,0.15)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.2)';
                        (e.target as HTMLInputElement).style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Campo 3: Titular */}
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#FFC107' }}
                    >
                      Titular
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del titular de la cuenta"
                      value={titular}
                      onChange={(e) => setTitular(e.target.value)}
                      disabled={!!cuentaGuardada}
                      className="w-full rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none disabled:opacity-70"
                      style={{
                        background: '#0F0F0F',
                        border: '1px solid rgba(255,193,7,0.2)',
                        padding: '14px 16px',
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.6)';
                        (e.target as HTMLInputElement).style.boxShadow = '0 0 16px rgba(255,193,7,0.15)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.2)';
                        (e.target as HTMLInputElement).style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Mensaje de error */}
                  {errorMsg && (
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
                  )}

                  {/* Botón Vincular Cuenta */}
                  <button
                    type="button"
                    onClick={handleVincular}
                    disabled={!puedeEnviar}
                    className="w-full py-4 rounded-2xl font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
                    style={{
                      background: cuentaGuardada
                        ? 'rgba(255,193,7,0.08)'
                        : puedeEnviar
                          ? '#FFC107'
                          : 'rgba(255,193,7,0.15)',
                      color: cuentaGuardada
                        ? '#888888'
                        : puedeEnviar
                          ? '#000000'
                          : '#555555',
                      border: `1px solid ${
                        cuentaGuardada
                          ? 'rgba(255,193,7,0.2)'
                          : puedeEnviar
                            ? 'rgba(255,193,7,0.6)'
                            : 'rgba(255,193,7,0.15)'
                      }`,
                      boxShadow: puedeEnviar ? '0 4px 24px rgba(255,193,7,0.35)' : 'none',
                      cursor: cuentaGuardada || !puedeEnviar ? 'not-allowed' : 'pointer',
                      opacity: cuentaGuardada ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (puedeEnviar) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#FFD700';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 36px rgba(255,193,7,0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (puedeEnviar) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#FFC107';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(255,193,7,0.35)';
                      }
                    }}
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Vinculando...
                      </>
                    ) : cuentaGuardada ? (
                      <>
                        <Lock size={18} />
                        Cuenta Vinculada
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Vincular Cuenta
                      </>
                    )}
                  </button>

                  {/* Aviso de cuenta vinculada */}
                  {cuentaGuardada && (
                    <div
                      className="rounded-2xl p-4 flex items-start gap-3"
                      style={{
                        background: 'rgba(255,193,7,0.06)',
                        border: '1px solid rgba(255,193,7,0.3)',
                        boxShadow: '0 0 20px rgba(255,193,7,0.08)',
                      }}
                    >
                      <AlertTriangle size={18} style={{ color: '#FFC107' }} className="flex-shrink-0 mt-0.5" />
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: '#CCCCCC' }}
                      >
                        Tu cuenta ya se encuentra vinculada a nuestra plataforma. Por favor contacte al personal de soporte para modificaciones o cambios realizados.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
