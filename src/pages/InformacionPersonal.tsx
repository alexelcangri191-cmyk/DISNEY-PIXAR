import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  Sparkles,
  CheckCircle2,
  Landmark,
  Lock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

const INSTRUCTIONS = [
  'Deben llenarse correctamente todos los datos para evitar inconvenientes a la hora de realizar retiros.',
  'Verificar correctamente el titular de la cuenta.',
  'Colocar correctamente el número de cuenta a registrarse.',
  'Realizar correctamente la selección del tipo de banco.',
  'Recuerden que al enviar los datos serán guardados para el uso de desembolso y pagos.',
];

type CuentaBancaria = {
  id: string;
  entidad_bancaria: string;
  numero_cuenta: string;
  titular: string;
};

export default function InformacionPersonal() {
  const navigate = useNavigate();

  const [entidad, setEntidad] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [titular, setTitular] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setCargando(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('cuenta_bancaria')
        .select('id, entidad_bancaria, numero_cuenta, titular')
        .eq('user_id', userId)
        .maybeSingle();
      if (queryError) {
        setError('No se pudo cargar la información bancaria.');
        setCargando(false);
        return;
      }
      if (data) {
        const cuenta = data as CuentaBancaria;
        setEntidad(cuenta.entidad_bancaria);
        setNumeroCuenta(cuenta.numero_cuenta);
        setTitular(cuenta.titular);
        setGuardado(true);
      }
      setCargando(false);
    })();
  }, []);

  const puedeEnviar =
    entidad.trim() !== '' &&
    numeroCuenta.trim() !== '' &&
    titular.trim() !== '' &&
    !enviando &&
    !guardado;

  const handleEnviar = async () => {
    setError(null);
    if (!entidad || !numeroCuenta.trim() || !titular.trim()) {
      setError('Por favor completa todos los campos antes de continuar.');
      return;
    }
    setEnviando(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setError('No se pudo identificar tu sesión. Vuelve a iniciar sesión.');
      setEnviando(false);
      return;
    }
    const { data, error: insertError } = await supabase
      .from('cuenta_bancaria')
      .insert({
        user_id: userId,
        entidad_bancaria: entidad,
        numero_cuenta: numeroCuenta.trim(),
        titular: titular.trim(),
      })
      .select('id, entidad_bancaria, numero_cuenta, titular')
      .maybeSingle();
    if (insertError) {
      setError('Ocurrió un error al guardar tus datos. Intenta nuevamente.');
      setEnviando(false);
      return;
    }
    if (data) {
      const cuenta = data as CuentaBancaria;
      setEntidad(cuenta.entidad_bancaria);
      setNumeroCuenta(cuenta.numero_cuenta);
      setTitular(cuenta.titular);
      setGuardado(true);
    }
    setEnviando(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
          top: '-200px', left: '50%', transform: 'translateX(-50%)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)',
          bottom: '100px', left: '50%', transform: 'translateX(-50%)',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        {/* Encabezado: título + flecha de atrás funcional */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/perfil')}
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
            Información personal
          </h1>
        </div>

        {/* Bloque informativo */}
        <div className="w-full max-w-lg mx-auto mb-8">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1)',
            }}
          >
            <div
              className="h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, #FFD700, #FFC107, #B8860B)' }}
            />

            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,193,7,0.12)' }}
                >
                  <Info size={22} style={{ color: '#FFC107' }} />
                </div>
                <div>
                  <h2
                    className="font-black text-lg tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Información
                  </h2>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles size={10} style={{ color: '#FFC107' }} />
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                      Lee antes de continuar
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="h-px mb-5"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,193,7,0.3), transparent)' }}
              />

              <ul className="flex flex-col gap-3.5">
                {INSTRUCTIONS.map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
                      style={{
                        background: 'rgba(255,193,7,0.1)',
                        border: '1px solid rgba(255,193,7,0.25)',
                      }}
                    >
                      <span className="text-xs font-black" style={{ color: '#FFC107' }}>
                        {idx + 1}
                      </span>
                    </div>
                    <p className="text-sm flex-1" style={{ color: '#CCCCCC', lineHeight: '1.7' }}>
                      {text}
                    </p>
                  </li>
                ))}
              </ul>

              <div
                className="mt-5 rounded-2xl p-4 flex items-start gap-3"
                style={{
                  background: 'rgba(255,193,7,0.06)',
                  border: '1px solid rgba(255,193,7,0.2)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#FFC107' }} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs" style={{ color: '#AAAAAA', lineHeight: '1.6' }}>
                  Tus datos son tratados con cifrado de extremo a extremo y se utilizan
                  únicamente para procesos de desembolso y pagos dentro de la plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bloque de Información Bancaria */}
        <div className="w-full max-w-lg mx-auto">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1)',
            }}
          >
            {/* Cabecera de color */}
            <div
              className="px-6 py-5 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(255,193,7,0.18) 0%, rgba(184,134,11,0.12) 100%)',
                borderBottom: '1px solid rgba(255,193,7,0.25)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,193,7,0.15)' }}
              >
                <Landmark size={22} style={{ color: '#FFC107' }} />
              </div>
              <div>
                <h2
                  className="font-black text-lg tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Información Personal
                </h2>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                  Datos bancarios
                </span>
              </div>
            </div>

            <div className="p-6">
              {cargando ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin" style={{ color: '#FFC107' }} />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {/* Entidad bancaria */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                        Entidad bancaria
                      </label>
                      <select
                        value={entidad}
                        disabled={guardado}
                        onChange={(e) => setEntidad(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 appearance-none cursor-pointer"
                        style={{
                          background: guardado ? '#0D0D0D' : '#0D0D0D',
                          border: '1px solid rgba(255,193,7,0.2)',
                          color: guardado ? '#666666' : '#FFFFFF',
                          opacity: guardado ? 0.7 : 1,
                        }}
                      >
                        <option value="" disabled>
                          Selecciona una entidad
                        </option>
                        <option value="Nequi">Nequi</option>
                        <option value="Bancolombia">Bancolombia</option>
                      </select>
                    </div>

                    {/* Número de cuenta */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                        Número de cuenta
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={numeroCuenta}
                        disabled={guardado}
                        onChange={(e) => setNumeroCuenta(e.target.value)}
                        placeholder="Ingresa el número de cuenta"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300"
                        style={{
                          background: '#0D0D0D',
                          border: '1px solid rgba(255,193,7,0.2)',
                          color: guardado ? '#666666' : '#FFFFFF',
                          opacity: guardado ? 0.7 : 1,
                        }}
                      />
                    </div>

                    {/* Titular */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                        Titular
                      </label>
                      <input
                        type="text"
                        value={titular}
                        disabled={guardado}
                        onChange={(e) => setTitular(e.target.value)}
                        placeholder="Nombre del titular de la cuenta"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300"
                        style={{
                          background: '#0D0D0D',
                          border: '1px solid rgba(255,193,7,0.2)',
                          color: guardado ? '#666666' : '#FFFFFF',
                          opacity: guardado ? 0.7 : 1,
                        }}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      className="mt-4 rounded-xl p-3 flex items-start gap-2"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      <AlertTriangle size={16} style={{ color: '#EF4444' }} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs" style={{ color: '#FCA5A5', lineHeight: '1.5' }}>
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Botón Vincular Cuenta */}
                  <button
                    onClick={handleEnviar}
                    disabled={!puedeEnviar}
                    className="w-full mt-5 rounded-xl py-3.5 font-bold text-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                    style={
                      guardado
                        ? {
                            background: '#2A2A2A',
                            color: '#555555',
                            cursor: 'not-allowed',
                            border: '1px solid rgba(255,193,7,0.1)',
                          }
                        : puedeEnviar
                        ? {
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #B8860B 100%)',
                            color: '#000000',
                            boxShadow: '0 4px 20px rgba(255,193,7,0.3)',
                          }
                        : {
                            background: '#2A2A2A',
                            color: '#555555',
                            cursor: 'not-allowed',
                          }
                    }
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Vinculando...
                      </>
                    ) : guardado ? (
                      <>
                        <Lock size={16} />
                        Cuenta vinculada
                      </>
                    ) : (
                      'Vincular Cuenta'
                    )}
                  </button>

                  {/* Aviso de cuenta vinculada */}
                  {guardado && (
                    <div
                      className="mt-4 rounded-2xl p-4 flex items-start gap-3"
                      style={{
                        background: 'rgba(255,193,7,0.06)',
                        border: '1px solid rgba(255,193,7,0.25)',
                      }}
                    >
                      <AlertTriangle size={18} style={{ color: '#FFC107' }} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs" style={{ color: '#CCCCCC', lineHeight: '1.6' }}>
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
