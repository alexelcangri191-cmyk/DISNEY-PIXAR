import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Sparkles, Play, CheckCircle2, Lock, Wallet, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

interface LevelData {
  id: string;
  name: string;
  hierarchy: string;
  monthly_income: number;
  daily_income: number;
  task_payment: number;
  daily_tasks: number;
  is_free: boolean;
  sort_order: number;
  investment_amount: number;
  annual_income: number;
  commitment_days: number;
}

interface ProgressData {
  nivel_activo: string;
  pasantia_bloqueada: boolean;
  pasantia_completada: boolean;
  videos_vistos_hoy: number;
  videos_fecha: string;
  saldo_personal: number;
}

const formatMoney = (amount: number) =>
  `$${amount.toLocaleString('es-CO')}`;

export default function Niveles() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch levels first (works for anon + authenticated)
        const { data: levelsData, error: levelsErr } = await supabase
          .from('levels')
          .select('*')
          .order('sort_order');

        if (levelsErr) {
          setErrorMsg('Error al cargar niveles: ' + levelsErr.message);
        } else if (levelsData) {
          setLevels(levelsData as LevelData[]);
        }

        // Try to fetch user progress (requires auth + existing row)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: progressData, error: progressErr } = await supabase
            .from('user_progress')
            .select('nivel_activo, pasantia_bloqueada, pasantia_completada, videos_vistos_hoy, videos_fecha, saldo_personal')
            .eq('user_id', user.id)
            .maybeSingle();

          if (progressErr) {
            // Non-fatal: page still shows levels
          } else if (progressData) {
            setProgress(progressData as ProgressData);
          }
          // If no progress row exists yet, that's OK — default values apply
        }
      } catch (err) {
        setErrorMsg('Error de conexión. Intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const pasantia = levels.find(l => l.id === 'pasantia');
  const j1 = levels.find(l => l.id === 'j1');

  const nivelActivo = progress?.nivel_activo || 'pasantia';
  const isPasantiaActive = nivelActivo === 'pasantia';
  const isJ1Active = nivelActivo === 'j1';
  const isPasantiaBlocked = progress?.pasantia_bloqueada ?? false;
  const isPasantiaCompleted = progress?.pasantia_completada ?? false;
  const isSameDay = progress?.videos_fecha === today;
  const videosVistosHoy = isSameDay ? (progress?.videos_vistos_hoy ?? 0) : 0;
  const tareasCompletadas = pasantia ? videosVistosHoy >= pasantia.daily_tasks : false;
  const saldoPersonal = Number(progress?.saldo_personal) || 0;

  function dismissAlerts() {
    setAlertMsg(null);
    setSuccessMsg(null);
  }

  async function handlePasantiaStart() {
    if (tareasCompletadas) return;
    navigate('/videos');
  }

  async function handleJ1Activate() {
    if (!j1 || activating) return;
    const investment = Number(j1.investment_amount);

    if (saldoPersonal < investment) {
      setAlertMsg('Saldo insuficiente en billetera personal, por favor recarga');
      setTimeout(() => { navigate('/recargar'); }, 2000);
      return;
    }

    setActivating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setActivating(false); return; }

      const { data: freshProg } = await supabase
        .from('user_progress')
        .select('saldo_personal, nivel_activo')
        .eq('user_id', user.id)
        .single();

      const currentSaldo = Number((freshProg as { saldo_personal: number } | null)?.saldo_personal) || 0;
      if (currentSaldo < investment) {
        setAlertMsg('Saldo insuficiente en billetera personal, por favor recarga');
        setActivating(false);
        setTimeout(() => { navigate('/recargar'); }, 2000);
        return;
      }

      const newSaldo = currentSaldo - investment;
      const { error } = await supabase
        .from('user_progress')
        .update({ saldo_personal: newSaldo, nivel_activo: 'j1' })
        .eq('user_id', user.id);

      if (error) {
        setAlertMsg('Error al activar el nivel. Intenta de nuevo.');
        setActivating(false);
        return;
      }

      setProgress(prev => prev ? { ...prev, saldo_personal: newSaldo, nivel_activo: 'j1' } : prev);
      setSuccessMsg('Nivel Activado Exitosamente');
      setTimeout(dismissAlerts, 3000);
    } catch {
      setAlertMsg('Error de conexión al activar el nivel.');
    } finally {
      setActivating(false);
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden pb-20 flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '300ms' }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
      <div className="fixed pointer-events-none z-0" style={{ width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.05) 0%, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.03) 0%, transparent 70%)', bottom: '100px', left: '50%', transform: 'translateX(-50%)' }} />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/perfil')} className="flex items-center gap-2 transition-opacity hover:opacity-70 active:scale-95" style={{ color: '#FFC107' }}>
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Regresar al Perfil</span>
          </button>
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>Niveles</span>
            <Zap size={14} style={{ color: '#FFC107' }} />
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
              <span className="text-sm font-bold" style={{ color: '#EF4444' }}>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Alert / Success messages */}
        {alertMsg && (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }} onClick={dismissAlerts}>
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
              <span className="text-sm font-bold" style={{ color: '#EF4444' }}>{alertMsg}</span>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)' }} onClick={dismissAlerts}>
              <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
              <span className="text-sm font-bold" style={{ color: '#22C55E' }}>{successMsg}</span>
            </div>
          </div>
        )}

        {/* Level cards */}
        <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
          {pasantia && (
            <PasantiaCard
              level={pasantia}
              isActive={isPasantiaActive && !isPasantiaCompleted}
              isBlocked={isPasantiaBlocked || isPasantiaCompleted}
              isCompleted={isPasantiaCompleted}
              tareasCompletadas={tareasCompletadas}
              videosVistosHoy={videosVistosHoy}
              onStart={handlePasantiaStart}
            />
          )}
          {j1 && (
            <J1Card
              level={j1}
              isActive={isJ1Active}
              canActivate={!isJ1Active && isPasantiaCompleted}
              saldoPersonal={saldoPersonal}
              onActivate={handleJ1Activate}
              activating={activating}
            />
          )}
          {levels.length === 0 && !errorMsg && (
            <div className="text-center py-12">
              <Lock size={32} style={{ color: '#888888' }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: '#888888' }}>No se encontraron niveles disponibles</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function PasantiaCard({ level, isActive, isBlocked, isCompleted, tareasCompletadas, videosVistosHoy, onStart }: {
  level: LevelData; isActive: boolean; isBlocked: boolean; isCompleted: boolean; tareasCompletadas: boolean; videosVistosHoy: number; onStart: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const gridItems = [
    { label: 'Ingresos Mensuales', value: formatMoney(Number(level.monthly_income)) },
    { label: 'Ingresos Diarios', value: formatMoney(Number(level.daily_income)) },
    { label: 'Pago por Tarea', value: formatMoney(Number(level.task_payment)) },
    { label: 'Tareas Diarias', value: String(level.daily_tasks) },
  ];

  return (
    <div className="rounded-[20px] overflow-hidden transition-all duration-300" style={{
      background: '#1A1A1A',
      border: `1px solid ${isCompleted ? 'rgba(255,193,7,0.4)' : isActive ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)'}`,
      boxShadow: isCompleted ? '0 0 40px rgba(255,193,7,0.12)' : isActive ? '0 0 40px rgba(34,197,94,0.15)' : '0 0 20px rgba(34,197,94,0.06)',
    }}>
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <Sparkles size={20} style={{ color: '#22C55E' }} />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-wide" style={{ color: '#FFFFFF' }}>{level.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: '#888888' }}>Jerarquía: {level.hierarchy}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E' }}>GRATIS</span>
        </div>
      </div>
      <div className="mx-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)' }} />
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {gridItems.map(item => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
              <p className="text-[0.6rem] font-bold uppercase tracking-wider mb-1" style={{ color: '#888888' }}>{item.label}</p>
              <p className="font-black text-sm" style={{ color: '#FFFFFF' }}>{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>Inversión</span>
          <span className="font-black text-sm" style={{ color: '#22C55E' }}>¡GRATIS!</span>
        </div>
        {isActive && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: '#888888' }}>Tareas completadas hoy</span>
              <span className="text-xs font-black" style={{ color: tareasCompletadas ? '#22C55E' : '#FFC107' }}>{videosVistosHoy} / {level.daily_tasks}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(videosVistosHoy / level.daily_tasks) * 100}%`, background: tareasCompletadas ? 'linear-gradient(90deg, #22C55E, #4ADE80)' : 'linear-gradient(90deg, #22C55E, #86EFAC)' }} />
            </div>
            {tareasCompletadas && (
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>Has completado todas las tareas diarias</span>
              </div>
            )}
          </div>
        )}
      </div>
      {isActive && !isBlocked && (
        <div className="px-5 pb-5">
          <button onClick={tareasCompletadas ? undefined : onStart} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={tareasCompletadas ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: 'rgba(34,197,94,0.5)', cursor: 'not-allowed' } : { background: hovered ? '#4ADE80' : '#22C55E', color: '#000000', boxShadow: hovered ? '0 6px 30px rgba(34,197,94,0.5)' : '0 4px 20px rgba(34,197,94,0.3)' }}>
            {tareasCompletadas ? <><CheckCircle2 size={16} />Tareas completadas hoy</> : <><Play size={16} />Iniciar ahora</>}
          </button>
        </div>
      )}
      {(isBlocked || isCompleted) && (
        <div className="px-5 pb-5">
          <div className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2" style={{ background: isCompleted ? 'rgba(255,193,7,0.08)' : 'rgba(255,193,7,0.08)', border: isCompleted ? '1px solid rgba(255,193,7,0.3)' : '1px solid rgba(255,193,7,0.2)', color: '#FFC107' }}>
            {isCompleted ? <><CheckCircle2 size={16} /><span className="font-bold text-sm">Nivel completado</span></> : <><Lock size={16} /><span className="font-bold text-sm">Nivel bloqueado</span></>}
          </div>
        </div>
      )}
    </div>
  );
}

function J1Card({ level, isActive, canActivate, saldoPersonal, onActivate, activating }: {
  level: LevelData; isActive: boolean; canActivate: boolean; saldoPersonal: number; onActivate: () => void; activating: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const canAfford = saldoPersonal >= Number(level.investment_amount);

  const gridItems = [
    { label: 'Ingresos Mensuales', value: formatMoney(Number(level.monthly_income)) },
    { label: 'Ingresos Diarios', value: formatMoney(Number(level.daily_income)) },
    { label: 'Ingresos Anuales', value: formatMoney(Number(level.annual_income)) },
    { label: 'Tareas Diarias', value: String(level.daily_tasks) },
  ];

  return (
    <div className="rounded-[20px] overflow-hidden transition-all duration-300" style={{
      background: '#1A1A1A',
      border: `1px solid ${isActive ? 'rgba(255,193,7,0.5)' : 'rgba(255,193,7,0.2)'}`,
      boxShadow: isActive ? '0 0 40px rgba(255,193,7,0.15)' : '0 0 20px rgba(255,193,7,0.06)',
    }}>
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,193,7,0.12)' }}>
              <Zap size={20} style={{ color: '#FFC107' }} />
            </div>
            <h2 className="font-black text-xl tracking-wide" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{level.name}</h2>
          </div>
          <p className="text-xs text-right" style={{ color: '#888888' }}>Tiempo de compromiso:<br /><span className="font-bold" style={{ color: '#FFC107' }}>{level.commitment_days} días</span></p>
        </div>
      </div>
      <div className="mx-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,193,7,0.3), transparent)' }} />
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {gridItems.map(item => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: 'rgba(255,193,7,0.04)', border: '1px solid rgba(255,193,7,0.1)' }}>
              <p className="text-[0.6rem] font-bold uppercase tracking-wider mb-1" style={{ color: '#888888' }}>{item.label}</p>
              <p className="font-black text-sm" style={{ color: '#FFFFFF' }}>{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(255,193,7,0.06)', border: '1px solid rgba(255,193,7,0.15)' }}>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>Monto de inversión</span>
          <span className="font-black text-sm" style={{ color: '#FFC107' }}>{formatMoney(Number(level.investment_amount))}</span>
        </div>
        {canActivate && !isActive && (
          <div className="mt-3 rounded-xl p-3" style={{ background: canAfford ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)', border: `1px solid ${canAfford ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: '#888888' }}>Tu Billetera Personal</span>
              <span className="text-xs font-black" style={{ color: canAfford ? '#22C55E' : '#EF4444' }}>{formatMoney(saldoPersonal)}</span>
            </div>
          </div>
        )}
      </div>
      {isActive && (
        <div className="px-5 pb-5">
          <div className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2" style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.3)', color: '#FFC107' }}>
            <CheckCircle2 size={16} /><span className="font-bold text-sm">Nivel Activo</span>
          </div>
        </div>
      )}
      {canActivate && !isActive && (
        <div className="px-5 pb-5">
          <button onClick={onActivate} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} disabled={activating}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={{ background: activating ? 'rgba(255,193,7,0.3)' : hovered ? '#FFD700' : '#FFC107', color: '#000000', boxShadow: activating ? 'none' : hovered ? '0 6px 30px rgba(255,193,7,0.5)' : '0 4px 20px rgba(255,193,7,0.3)', opacity: activating ? 0.7 : 1 }}>
            {activating ? <><div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#000', borderTopColor: 'transparent' }} />Activando...</> : <><Wallet size={16} />Activar</>}
          </button>
        </div>
      )}
      {!canActivate && !isActive && (
        <div className="px-5 pb-5">
          <div className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2" style={{ background: 'rgba(255,193,7,0.05)', border: '1px solid rgba(255,193,7,0.15)', color: '#888888' }}>
            <Lock size={16} /><span className="font-bold text-sm">Completa Pasantía para desbloquear</span>
          </div>
        </div>
      )}
    </div>
  );
}
