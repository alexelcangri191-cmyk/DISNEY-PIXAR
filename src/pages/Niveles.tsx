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
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: levelsData, error: levelsErr } = await supabase
          .from('levels')
          .select('*')
          .order('sort_order');

        if (levelsErr) {
          setErrorMsg('Error al cargar niveles: ' + levelsErr.message);
        } else if (levelsData) {
          setLevels(levelsData as LevelData[]);
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('nivel_activo, pasantia_bloqueada, pasantia_completada, videos_vistos_hoy, videos_fecha, saldo_personal')
            .eq('user_id', user.id)
            .maybeSingle();

          if (progressData) {
            setProgress(progressData as ProgressData);
          }
        }
      } catch {
        setErrorMsg('Error de conexión. Intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const nivelActivo = progress?.nivel_activo || 'pasantia';
  const isPasantiaCompleted = progress?.pasantia_completada ?? false;
  const isPasantiaBlocked = progress?.pasantia_bloqueada ?? false;
  const isSameDay = progress?.videos_fecha === today;
  const videosVistosHoy = isSameDay ? (progress?.videos_vistos_hoy ?? 0) : 0;
  const saldoPersonal = Number(progress?.saldo_personal) || 0;

  const activeSortOrder = levels.find(l => l.id === nivelActivo)?.sort_order ?? 1;

  function getLevelState(level: LevelData): 'active' | 'completed' | 'can_activate' | 'locked' {
    if (level.id === nivelActivo) {
      if (level.is_free && isPasantiaBlocked) return 'completed';
      return 'active';
    }
    const prevLevel = levels.find(l => l.sort_order === level.sort_order - 1);
    if (!prevLevel) return 'locked';
    const prevIsActive = prevLevel.id === nivelActivo;
    const prevIsCompleted = prevLevel.is_free
      ? isPasantiaCompleted
      : prevLevel.sort_order < activeSortOrder;
    if (prevIsActive || prevIsCompleted) return 'can_activate';
    return 'locked';
  }

  function dismissAlerts() {
    setAlertMsg(null);
    setSuccessMsg(null);
  }

  async function handleActivate(level: LevelData) {
    if (activating || level.is_free) return;
    const investment = Number(level.investment_amount);

    if (saldoPersonal < investment) {
      setAlertMsg('Saldo insuficiente en billetera personal, por favor recarga');
      setTimeout(() => { navigate('/recargar'); }, 2000);
      return;
    }

    setActivating(level.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setActivating(null); return; }

      const { data: freshProg } = await supabase
        .from('user_progress')
        .select('saldo_personal, nivel_activo')
        .eq('user_id', user.id)
        .single();

      const currentSaldo = Number((freshProg as { saldo_personal: number } | null)?.saldo_personal) || 0;
      if (currentSaldo < investment) {
        setAlertMsg('Saldo insuficiente en billetera personal, por favor recarga');
        setActivating(null);
        setTimeout(() => { navigate('/recargar'); }, 2000);
        return;
      }

      const newSaldo = currentSaldo - investment;
      const { error } = await supabase
        .from('user_progress')
        .update({ saldo_personal: newSaldo, nivel_activo: level.id })
        .eq('user_id', user.id);

      if (error) {
        setAlertMsg('Error al activar el nivel. Intenta de nuevo.');
        setActivating(null);
        return;
      }

      setProgress(prev => prev ? { ...prev, saldo_personal: newSaldo, nivel_activo: level.id } : prev);
      setSuccessMsg('Nivel Activado Exitosamente');
      setTimeout(dismissAlerts, 3000);
    } catch {
      setAlertMsg('Error de conexión al activar el nivel.');
    } finally {
      setActivating(null);
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

        {errorMsg && (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
              <span className="text-sm font-bold" style={{ color: '#EF4444' }}>{errorMsg}</span>
            </div>
          </div>
        )}
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

        <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
          {levels.map(level => {
            const state = getLevelState(level);
            if (level.is_free) {
              return (
                <FreeLevelCard
                  key={level.id}
                  level={level}
                  state={state}
                  videosVistosHoy={videosVistosHoy}
                  onStart={() => {
                    const tareasCompletadas = videosVistosHoy >= level.daily_tasks;
                    if (!tareasCompletadas) navigate('/videos');
                  }}
                />
              );
            }
            return (
              <PaidLevelCard
                key={level.id}
                level={level}
                state={state}
                saldoPersonal={saldoPersonal}
                activating={activating === level.id}
                onActivate={() => handleActivate(level)}
                prevLevelName={levels.find(l => l.sort_order === level.sort_order - 1)?.name ?? ''}
              />
            );
          })}
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

function FreeLevelCard({ level, state, videosVistosHoy, onStart }: {
  level: LevelData;
  state: 'active' | 'completed';
  videosVistosHoy: number;
  onStart: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const tareasCompletadas = videosVistosHoy >= level.daily_tasks;
  const isCompleted = state === 'completed';

  const gridItems = [
    { label: 'Ingresos Mensuales', value: formatMoney(Number(level.monthly_income)) },
    { label: 'Ingresos Diarios', value: formatMoney(Number(level.daily_income)) },
    { label: 'Pago por Tarea', value: formatMoney(Number(level.task_payment)) },
    { label: 'Tareas Diarias', value: String(level.daily_tasks) },
  ];

  return (
    <div className="rounded-[20px] overflow-hidden transition-all duration-300" style={{
      background: '#1A1A1A',
      border: `1px solid ${isCompleted ? 'rgba(255,193,7,0.4)' : 'rgba(34,197,94,0.5)'}`,
      boxShadow: isCompleted ? '0 0 40px rgba(255,193,7,0.12)' : '0 0 40px rgba(34,197,94,0.15)',
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
        {state === 'active' && (
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
      {state === 'active' && (
        <div className="px-5 pb-5">
          <button onClick={tareasCompletadas ? undefined : onStart} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={tareasCompletadas ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: 'rgba(34,197,94,0.5)', cursor: 'not-allowed' } : { background: hovered ? '#4ADE80' : '#22C55E', color: '#000000', boxShadow: hovered ? '0 6px 30px rgba(34,197,94,0.5)' : '0 4px 20px rgba(34,197,94,0.3)' }}>
            {tareasCompletadas ? <><CheckCircle2 size={16} />Tareas completadas hoy</> : <><Play size={16} />Iniciar ahora</>}
          </button>
        </div>
      )}
      {isCompleted && (
        <div className="px-5 pb-5">
          <div className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2" style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.3)', color: '#FFC107' }}>
            <CheckCircle2 size={16} /><span className="font-bold text-sm">Nivel completado</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PaidLevelCard({ level, state, saldoPersonal, activating, onActivate, prevLevelName }: {
  level: LevelData;
  state: 'active' | 'completed' | 'can_activate' | 'locked';
  saldoPersonal: number;
  activating: boolean;
  onActivate: () => void;
  prevLevelName: string;
}) {
  const [hovered, setHovered] = useState(false);
  const canAfford = saldoPersonal >= Number(level.investment_amount);
  const isLocked = state === 'locked';
  const canActivate = state === 'can_activate';
  const isActive = state === 'active';

  const gridItems = [
    { label: 'Ingresos Mensuales', value: formatMoney(Number(level.monthly_income)) },
    { label: 'Ingresos Diarios', value: formatMoney(Number(level.daily_income)) },
    { label: 'Ingresos Anuales', value: formatMoney(Number(level.annual_income)) },
    { label: 'Tareas Diarias', value: String(level.daily_tasks) },
  ];

  return (
    <div className="rounded-[20px] overflow-hidden transition-all duration-300" style={{
      background: '#1A1A1A',
      border: `1px solid ${isActive ? 'rgba(255,193,7,0.5)' : isLocked ? 'rgba(255,193,7,0.1)' : 'rgba(255,193,7,0.2)'}`,
      boxShadow: isActive ? '0 0 40px rgba(255,193,7,0.15)' : isLocked ? 'none' : '0 0 20px rgba(255,193,7,0.06)',
      opacity: isLocked ? 0.6 : 1,
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
      {isLocked && (
        <div className="px-5 pb-5">
          <div className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2" style={{ background: 'rgba(255,193,7,0.05)', border: '1px solid rgba(255,193,7,0.15)', color: '#888888' }}>
            <Lock size={16} /><span className="font-bold text-sm">Completa {prevLevelName} para desbloquear</span>
          </div>
        </div>
      )}
    </div>
  );
}
