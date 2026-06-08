import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Sparkles, CheckCircle2, Clock, DollarSign, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

interface LevelData {
  task_payment: number;
  daily_tasks: number;
}

interface ProgressData {
  nivel_activo: string;
  videos_vistos_hoy: number;
  videos_fecha: string;
  saldo_ingresos: number;
  ganancias_hoy: number;
  ganancias_mes: number;
  ganancias_semana: number;
  ingresos_totales: number;
}

const MOCK_VIDEOS = [
  { id: 1, title: 'Introducción a la plataforma', duration: '2:30' },
  { id: 2, title: 'Cómo generar ingresos diarios', duration: '3:15' },
  { id: 3, title: 'Estrategias de inversión segura', duration: '4:00' },
  { id: 4, title: 'Consejos de expertos financieros', duration: '2:45' },
  { id: 5, title: 'Tutorial de retiros', duration: '3:30' },
  { id: 6, title: 'Historias de éxito', duration: '5:00' },
  { id: 7, title: 'Planificación financiera', duration: '3:45' },
  { id: 8, title: 'Diversificación de ingresos', duration: '4:20' },
  { id: 9, title: 'Análisis de mercado diario', duration: '2:50' },
  { id: 10, title: 'Rendimiento y métricas clave', duration: '3:10' },
];

export default function Videos() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<LevelData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchingVideo, setWatchingVideo] = useState<number | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [levelRes, progressRes] = await Promise.all([
        supabase.from('levels').select('task_payment, daily_tasks').eq('id', 'pasantia').single(),
        supabase.from('user_progress').select('nivel_activo, videos_vistos_hoy, videos_fecha, saldo_ingresos, ganancias_hoy, ganancias_mes, ganancias_semana, ingresos_totales').eq('user_id', user.id).single(),
      ]);

      if (levelRes.data) setLevel(levelRes.data);
      if (progressRes.data) setProgress(progressRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const isSameDay = progress?.videos_fecha === today;
  const videosVistosHoy = isSameDay ? (progress?.videos_vistos_hoy ?? 0) : 0;
  const tareasRestantes = level ? Math.max(0, level.daily_tasks - videosVistosHoy) : 0;
  const allTasksDone = tareasRestantes === 0;

  async function handleWatchVideo(videoId: number) {
    if (allTasksDone || watchingVideo !== null) return;

    setWatchingVideo(videoId);

    // Simulate video watching (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setWatchingVideo(null); return; }

    // Fetch fresh progress
    const { data: freshProg } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const prog = freshProg;
    const isCurrentDay = prog?.videos_fecha === today;
    const currentWatched = isCurrentDay ? (prog?.videos_vistos_hoy ?? 0) : 0;

    if (currentWatched >= (level?.daily_tasks ?? 0)) {
      setWatchingVideo(null);
      return;
    }

    const newWatched = currentWatched + 1;
    const taskPayment = level?.task_payment ?? 1000;

    const updatePayload: Record<string, unknown> = {
      videos_vistos_hoy: newWatched,
      videos_fecha: today,
      saldo_ingresos: (prog?.saldo_ingresos ?? 0) + taskPayment,
      ganancias_hoy: isCurrentDay ? (prog?.ganancias_hoy ?? 0) + taskPayment : taskPayment,
      ganancias_mes: (prog?.ganancias_mes ?? 0) + taskPayment,
      ganancias_semana: (prog?.ganancias_semana ?? 0) + taskPayment,
      ingresos_totales: (prog?.ingresos_totales ?? 0) + taskPayment,
      updated_at: new Date().toISOString(),
    };

    // If day changed, reset ganancias_hoy
    if (!isCurrentDay) {
      updatePayload.ganancias_hoy = taskPayment;
    }

    await supabase
      .from('user_progress')
      .update(updatePayload)
      .eq('user_id', user.id);

    setCompletedToday(prev => new Set([...prev, videoId]));
    setProgress(prev => prev ? {
      ...prev,
      videos_vistos_hoy: newWatched,
      videos_fecha: today,
      saldo_ingresos: (prev.saldo_ingresos ?? 0) + taskPayment,
      ganancias_hoy: isCurrentDay ? (prev.ganancias_hoy ?? 0) + taskPayment : taskPayment,
      ganancias_mes: (prev.ganancias_mes ?? 0) + taskPayment,
      ganancias_semana: (prev.ganancias_semana ?? 0) + taskPayment,
      ingresos_totales: (prev.ingresos_totales ?? 0) + taskPayment,
    } : prev);
    setWatchingVideo(null);
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
      {/* Ambient glows */}
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
            <Video size={14} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>
              Vídeos
            </span>
            <Video size={14} style={{ color: '#FFC107' }} />
          </div>
        </div>

        {/* Progress Summary */}
        <div className="w-full max-w-lg mx-auto mb-5">
          <div
            className="rounded-2xl p-4"
            style={{
              background: '#1A1A1A',
              border: allTasksDone ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,193,7,0.2)',
              boxShadow: allTasksDone ? '0 0 20px rgba(34,197,94,0.1)' : '0 0 12px rgba(255,193,7,0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={16} style={{ color: allTasksDone ? '#22C55E' : '#FFC107' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                  Tareas de hoy
                </span>
              </div>
              <span className="text-sm font-black" style={{ color: allTasksDone ? '#22C55E' : '#FFC107' }}>
                {videosVistosHoy} / {level?.daily_tasks ?? 5}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,193,7,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(videosVistosHoy / (level?.daily_tasks ?? 5)) * 100}%`,
                  background: allTasksDone
                    ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
                    : 'linear-gradient(90deg, #FFC107, #FFD700)',
                }}
              />
            </div>

            {allTasksDone && (
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>
                  Has completado todas las tareas diarias. Vuelve mañana.
                </span>
              </div>
            )}

            {!allTasksDone && (
              <p className="text-xs mt-2" style={{ color: '#888888' }}>
                Gana <span style={{ color: '#FFC107', fontWeight: 900 }}>${level?.task_payment.toLocaleString('es-CO') ?? '1,000'}</span> por cada vídeo visto
              </p>
            )}
          </div>
        </div>

        {/* Video List */}
        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Sparkles size={12} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>
              Videos Disponibles
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_VIDEOS.map((video, index) => {
              const isCompleted = completedToday.has(video.id) || (allTasksDone && index < (level?.daily_tasks ?? 5));
              const isCurrentlyWatching = watchingVideo === video.id;
              const canWatch = !allTasksDone && !isCompleted && watchingVideo === null;

              return (
                <VideoRow
                  key={video.id}
                  video={video}
                  isCompleted={isCompleted}
                  isWatching={isCurrentlyWatching}
                  canWatch={canWatch}
                  disabled={allTasksDone}
                  onWatch={() => handleWatchVideo(video.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function VideoRow({
  video,
  isCompleted,
  isWatching,
  canWatch,
  disabled,
  onWatch,
}: {
  video: { id: number; title: string; duration: string };
  isCompleted: boolean;
  isWatching: boolean;
  canWatch: boolean;
  disabled: boolean;
  onWatch: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={canWatch ? onWatch : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 rounded-xl transition-all duration-300"
      style={{
        background: isCompleted
          ? 'rgba(34,197,94,0.06)'
          : hovered && canWatch
            ? 'rgba(255,193,7,0.06)'
            : '#1A1A1A',
        border: `1px solid ${
          isCompleted
            ? 'rgba(34,197,94,0.3)'
            : hovered && canWatch
              ? 'rgba(255,193,7,0.35)'
              : 'rgba(255,193,7,0.12)'
        }`,
        boxShadow: isCompleted
          ? '0 0 12px rgba(34,197,94,0.06)'
          : hovered && canWatch
            ? '0 0 16px rgba(255,193,7,0.08)'
            : 'none',
        padding: '14px 16px',
        opacity: disabled && !isCompleted ? 0.4 : 1,
        cursor: canWatch ? 'pointer' : 'default',
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(255,193,7,0.08)',
        }}
      >
        {isCompleted ? (
          <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
        ) : isWatching ? (
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FFC107', borderTopColor: 'transparent' }} />
        ) : (
          <Play size={16} style={{ color: canWatch ? '#FFC107' : '#555555' }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <p
          className="text-sm font-bold"
          style={{ color: isCompleted ? 'rgba(34,197,94,0.7)' : '#FFFFFF' }}
        >
          {video.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={10} style={{ color: '#888888' }} />
          <span className="text-xs" style={{ color: '#888888' }}>{video.duration}</span>
        </div>
      </div>

      {/* Status */}
      {isCompleted && (
        <span className="text-xs font-bold" style={{ color: '#22C55E' }}>+$1,000</span>
      )}
      {isWatching && (
        <span className="text-xs font-bold" style={{ color: '#FFC107' }}>Viendo...</span>
      )}
    </button>
  );
}
