import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Sparkles, Play, CheckCircle2, Lock } from 'lucide-react';
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
}

interface ProgressData {
  nivel_activo: string;
  pasantia_bloqueada: boolean;
  videos_vistos_hoy: number;
  videos_fecha: string;
}

const formatMoney = (amount: number) =>
  `$${amount.toLocaleString('es-CO')}`;

export default function Niveles() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [levelsRes, progressRes] = await Promise.all([
        supabase.from('levels').select('*').order('sort_order'),
        supabase.from('user_progress').select('nivel_activo, pasantia_bloqueada, videos_vistos_hoy, videos_fecha').eq('user_id', user.id).single(),
      ]);

      if (levelsRes.data) setLevels(levelsRes.data);
      if (progressRes.data) setProgress(progressRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const pasantia = levels.find(l => l.id === 'pasantia');

  const isPasantiaActive = progress?.nivel_activo === 'pasantia' || !progress?.nivel_activo;
  const isPasantiaBlocked = progress?.pasantia_bloqueada ?? false;
  const isSameDay = progress?.videos_fecha === today;
  const videosVistosHoy = isSameDay ? (progress?.videos_vistos_hoy ?? 0) : 0;
  const tareasCompletadas = pasantia ? videosVistosHoy >= pasantia.daily_tasks : false;

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden pb-20 flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#22C55E', animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#22C55E', animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#22C55E', animationDelay: '300ms' }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
      {/* Ambient glows */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
          top: '-200px', left: '50%', transform: 'translateX(-50%)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.03) 0%, transparent 70%)',
          bottom: '100px', left: '50%', transform: 'translateX(-50%)',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-2 transition-opacity hover:opacity-70 active:scale-95"
            style={{ color: '#FFC107' }}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Regresar al Perfil</span>
          </button>
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: '#22C55E' }} />
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#22C55E' }}>
              Niveles
            </span>
            <Zap size={14} style={{ color: '#22C55E' }} />
          </div>
        </div>

        {/* Level cards */}
        <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
          {/* PASANTÍA Card */}
          {pasantia && (
            <PasantiaCard
              level={pasantia}
              isActive={isPasantiaActive}
              isBlocked={isPasantiaBlocked}
              tareasCompletadas={tareasCompletadas}
              videosVistosHoy={videosVistosHoy}
              onStart={() => navigate('/videos')}
            />
          )}

          {/* Placeholder for future levels */}
          {levels.filter(l => l.id !== 'pasantia').map(level => (
            <LockedLevelCard key={level.id} name={level.name} />
          ))}

          {levels.length <= 1 && (
            <div className="text-center mt-4">
              <p className="text-xs" style={{ color: '#888888' }}>
                Más niveles disponibles próximamente
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function PasantiaCard({
  level,
  isActive,
  isBlocked,
  tareasCompletadas,
  videosVistosHoy,
  onStart,
}: {
  level: LevelData;
  isActive: boolean;
  isBlocked: boolean;
  tareasCompletadas: boolean;
  videosVistosHoy: number;
  onStart: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const gridItems = [
    { label: 'Ingresos Mensuales', value: formatMoney(level.monthly_income) },
    { label: 'Ingresos Diarios', value: formatMoney(level.daily_income) },
    { label: 'Pago por Tarea', value: formatMoney(level.task_payment) },
    { label: 'Tareas Diarias', value: String(level.daily_tasks) },
  ];

  return (
    <div
      className="rounded-[20px] overflow-hidden transition-all duration-300"
      style={{
        background: '#1A1A1A',
        border: `1px solid ${isActive ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)'}`,
        boxShadow: isActive
          ? '0 0 40px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 0 20px rgba(34,197,94,0.06), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Top: Title + Badge */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)' }}
            >
              <Sparkles size={20} style={{ color: '#22C55E' }} />
            </div>
            <div>
              <h2
                className="font-black text-lg tracking-wide"
                style={{ color: '#FFFFFF' }}
              >
                {level.name}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                Jerarquía: {level.hierarchy}
              </p>
            </div>
          </div>
          {level.is_free ? (
            <span
              className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.4)',
                color: '#22C55E',
              }}
            >
              GRATIS
            </span>
          ) : null}
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-5 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)' }}
      />

      {/* Data Grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {gridItems.map(item => (
            <div
              key={item.label}
              className="rounded-xl p-3"
              style={{
                background: 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.1)',
              }}
            >
              <p className="text-[0.6rem] font-bold uppercase tracking-wider mb-1" style={{ color: '#888888' }}>
                {item.label}
              </p>
              <p className="font-black text-sm" style={{ color: '#FFFFFF' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Inversión - Highlighted */}
        <div
          className="mt-3 rounded-xl p-3 flex items-center justify-between"
          style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.15)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
            Inversión
          </span>
          <span className="font-black text-sm" style={{ color: '#22C55E' }}>
            ¡GRATIS!
          </span>
        </div>

        {/* Progress indicator when active */}
        {isActive && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: '#888888' }}>
                Tareas completadas hoy
              </span>
              <span className="text-xs font-black" style={{ color: tareasCompletadas ? '#22C55E' : '#FFC107' }}>
                {videosVistosHoy} / {level.daily_tasks}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(34,197,94,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(videosVistosHoy / level.daily_tasks) * 100}%`,
                  background: tareasCompletadas
                    ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
                    : 'linear-gradient(90deg, #22C55E, #86EFAC)',
                  boxShadow: tareasCompletadas ? '0 0 10px rgba(34,197,94,0.5)' : 'none',
                }}
              />
            </div>
            {tareasCompletadas && (
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>
                  Has completado todas las tareas diarias
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      {isActive && (
        <div className="px-5 pb-5">
          <button
            onClick={tareasCompletadas ? undefined : onStart}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={tareasCompletadas ? {
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: 'rgba(34,197,94,0.5)',
              cursor: 'not-allowed',
            } : {
              background: hovered ? '#4ADE80' : '#22C55E',
              color: '#000000',
              boxShadow: hovered
                ? '0 6px 30px rgba(34,197,94,0.5)'
                : '0 4px 20px rgba(34,197,94,0.3)',
            }}
          >
            {tareasCompletadas ? (
              <>
                <CheckCircle2 size={16} />
                Tareas completadas hoy
              </>
            ) : (
              <>
                <Play size={16} />
                Iniciar ahora
              </>
            )}
          </button>
        </div>
      )}

      {/* Blocked overlay */}
      {isBlocked && (
        <div className="px-5 pb-5">
          <div
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,193,7,0.08)',
              border: '1px solid rgba(255,193,7,0.2)',
              color: '#FFC107',
            }}
          >
            <Lock size={16} />
            <span className="font-bold text-sm">Nivel bloqueado</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LockedLevelCard({ name }: { name: string }) {
  return (
    <div
      className="rounded-[20px] p-5 flex items-center gap-3"
      style={{
        background: '#1A1A1A',
        border: '1px solid rgba(255,193,7,0.1)',
        opacity: 0.5,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(255,193,7,0.06)' }}
      >
        <Lock size={18} style={{ color: '#888888' }} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm text-white">{name}</h3>
        <p className="text-xs" style={{ color: '#888888' }}>Disponible próximamente</p>
      </div>
      <Lock size={16} style={{ color: '#555555' }} />
    </div>
  );
}
