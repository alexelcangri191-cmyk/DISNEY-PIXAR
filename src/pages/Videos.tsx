import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Sparkles, CheckCircle2, Clock, DollarSign, Play, Lock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

interface LevelData {
  id: string;
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
  pasantia_completada: boolean;
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
  { id: 11, title: 'Gestión de riesgo financiero', duration: '4:15' },
  { id: 12, title: 'Oportunidades de crecimiento', duration: '3:25' },
  { id: 13, title: 'Optimización de ganancias', duration: '4:40' },
  { id: 14, title: 'Tendencias del mercado actual', duration: '3:55' },
  { id: 15, title: 'Estrategias avanzadas de inversión', duration: '5:10' },
  { id: 16, title: 'Fundamentos del trading moderno', duration: '4:05' },
  { id: 17, title: 'Análisis técnico paso a paso', duration: '3:50' },
  { id: 18, title: 'Gestión de portafolios', duration: '4:30' },
  { id: 19, title: 'Psicología del inversor', duration: '3:20' },
  { id: 20, title: 'Mercados emergentes', duration: '4:50' },
  { id: 21, title: 'Inversión a largo plazo', duration: '3:35' },
  { id: 22, title: 'Compound interest explained', duration: '4:10' },
  { id: 23, title: ' hedge funds y alternativas', duration: '3:40' },
  { id: 24, title: 'Macroeconomía para inversores', duration: '5:05' },
  { id: 25, title: 'Indicadores económicos clave', duration: '3:00' },
  { id: 26, title: 'Flujos de caja y valoración', duration: '4:25' },
  { id: 27, title: 'Renta fija vs renta variable', duration: '3:30' },
  { id: 28, title: 'Criptomonedas y blockchain', duration: '4:45' },
  { id: 29, title: 'Fondos indexados y ETFs', duration: '3:15' },
  { id: 30, title: 'Plan de jubilación e inversión', duration: '4:55' },
  { id: 31, title: 'Análisis fundamental avanzado', duration: '4:20' },
  { id: 32, title: 'Gestión de riesgos en portafolios', duration: '3:50' },
  { id: 33, title: 'Inversión en bienes raíces', duration: '5:15' },
  { id: 34, title: 'Dividendos y recompensas accionarias', duration: '3:40' },
  { id: 35, title: 'Trading algorítmico introductorio', duration: '4:35' },
  { id: 36, title: 'Volatilidad y opciones', duration: '4:10' },
  { id: 37, title: 'Value investing profundización', duration: '5:00' },
  { id: 38, title: 'Arbitraje y oportunidades de mercado', duration: '3:25' },
  { id: 39, title: 'Inversión socialmente responsable', duration: '4:45' },
  { id: 40, title: 'Fondos de cobertura explicados', duration: '3:55' },
  { id: 41, title: 'Mercados de futuros y derivados', duration: '4:30' },
  { id: 42, title: 'Estrategias de bajo riesgo', duration: '3:15' },
  { id: 43, title: 'Capital de riesgo y startups', duration: '5:05' },
  { id: 44, title: 'Ingresos pasivos reales', duration: '4:00' },
  { id: 45, title: 'Diversificación geográfica', duration: '3:35' },
  { id: 46, title: 'Análisis de estados financieros', duration: '4:50' },
  { id: 47, title: 'Ciclos económicos y timing', duration: '3:45' },
  { id: 48, title: 'Inversión en materias primas', duration: '4:25' },
  { id: 49, title: 'Inteligencia artificial en finanzas', duration: '5:20' },
  { id: 50, title: 'Construyendo legado financiero', duration: '4:40' },
  { id: 51, title: 'Estrategias de alto rendimiento', duration: '4:15' },
  { id: 52, title: 'Gestión de grandes portafolios', duration: '5:25' },
  { id: 53, title: 'Inversión institucional explicada', duration: '4:50' },
  { id: 54, title: 'Modelos de valoración avanzados', duration: '4:05' },
  { id: 55, title: 'Renta fija de alto rendimiento', duration: '3:45' },
  { id: 56, title: 'Opciones y derivados avanzados', duration: '5:10' },
  { id: 57, title: 'Cobertura cambiaria', duration: '4:20' },
  { id: 58, title: 'Inversión en infraestructura', duration: '3:55' },
  { id: 59, title: 'Private equity desmitificado', duration: '4:35' },
  { id: 60, title: 'Fondos soberanos y pensiones', duration: '5:00' },
  { id: 61, title: 'Macroestrategias globales', duration: '4:25' },
  { id: 62, title: ' commodities y materias primas', duration: '3:40' },
  { id: 63, title: 'Inversión en metales preciosos', duration: '4:10' },
  { id: 64, title: 'Energía y mercados de carbono', duration: '4:55' },
  { id: 65, title: 'Fintech y disrupción financiera', duration: '3:30' },
  { id: 66, title: 'DeFi y finanzas descentralizadas', duration: '5:15' },
  { id: 67, title: 'Tokenización de activos', duration: '4:45' },
  { id: 68, title: 'Crowdfunding y inversión colectiva', duration: '3:20' },
  { id: 69, title: 'Análisis cuantitativo aplicado', duration: '4:30' },
  { id: 70, title: 'Machine learning en trading', duration: '5:05' },
  { id: 71, title: 'Gestión de drawdown y pérdida', duration: '3:50' },
  { id: 72, title: 'Psicología del trading avanzada', duration: '4:00' },
  { id: 73, title: 'Mesa de dinero y liquidez', duration: '4:40' },
  { id: 74, title: 'Arbitraje estadístico', duration: '3:35' },
  { id: 75, title: 'Inversión en arte y coleccionables', duration: '4:15' },
  { id: 76, title: 'Finanzas familiares y sucesión', duration: '5:20' },
  { id: 77, title: 'Optimización fiscal para inversores', duration: '4:25' },
  { id: 78, title: 'Fideicomisos y estructuras legales', duration: '3:55' },
  { id: 79, title: 'Filantropía estratégica', duration: '4:50' },
  { id: 80, title: 'Maestría financiera integral', duration: '5:30' },
  { id: 81, title: 'Estrategias de wealth management', duration: '4:20' },
  { id: 82, title: 'Family office y gobernanza', duration: '5:10' },
  { id: 83, title: 'Inversión transgeneracional', duration: '4:45' },
  { id: 84, title: 'Macro global y geopolítica', duration: '5:25' },
  { id: 85, title: 'Trading de alta frecuencia', duration: '4:15' },
  { id: 86, title: 'Modelos de Black-Scholes', duration: '4:50' },
  { id: 87, title: 'Griegas y gestión de opciones', duration: '4:30' },
  { id: 88, title: 'Estrategias delta-neutral', duration: '5:00' },
  { id: 89, title: 'Volatility surface trading', duration: '4:40' },
  { id: 90, title: 'Fixed income arbitrage', duration: '4:10' },
  { id: 91, title: 'Convertible bond arbitrage', duration: '4:55' },
  { id: 92, title: 'Capital structure arbitrage', duration: '4:25' },
  { id: 93, title: 'Statistical arbitrage pairs', duration: '5:15' },
  { id: 94, title: 'Mean reversion strategies', duration: '4:35' },
  { id: 95, title: 'Momentum y trend following', duration: '4:05' },
  { id: 96, title: 'Carry trade en Forex', duration: '4:45' },
  { id: 97, title: 'Risk parity y parity volátil', duration: '4:20' },
  { id: 98, title: 'Factor investing profundo', duration: '5:05' },
  { id: 99, title: 'Smart beta y multifactor', duration: '4:30' },
  { id: 100, title: 'ESG investing avanzado', duration: '4:50' },
  { id: 101, title: 'Impact investing medición', duration: '4:15' },
  { id: 102, title: 'Private credit markets', duration: '5:20' },
  { id: 103, title: 'Distressed debt investing', duration: '4:40' },
  { id: 104, title: 'Special situations investing', duration: '4:25' },
  { id: 105, title: 'Merger arbitrage', duration: '4:55' },
  { id: 106, title: 'Event-driven strategies', duration: '4:10' },
  { id: 107, title: 'Activist investing', duration: '5:00' },
  { id: 108, title: 'Pre-IPO y secondary markets', duration: '4:35' },
  { id: 109, title: 'SPACs y de-SPAC process', duration: '4:20' },
  { id: 110, title: 'Real assets y timberland', duration: '4:45' },
  { id: 111, title: 'Agriculture y farmland investing', duration: '5:10' },
  { id: 112, title: 'Water rights investing', duration: '4:30' },
  { id: 113, title: 'Carbon credits markets', duration: '4:15' },
  { id: 114, title: 'Green bonds y sustainability', duration: '4:50' },
  { id: 115, title: 'Catastrophe bonds', duration: '4:25' },
  { id: 116, title: 'Longevity risk transfer', duration: '4:40' },
  { id: 117, title: 'Reinsurance linked investments', duration: '5:05' },
  { id: 118, title: 'Litigation finance', duration: '4:20' },
  { id: 119, title: 'Royalty financing', duration: '4:35' },
  { id: 120, title: 'Revenue-based financing', duration: '4:50' },
  { id: 121, title: 'Venture debt mechanics', duration: '4:10' },
  { id: 122, title: 'Bridge financing y mezzanine', duration: '4:45' },
  { id: 123, title: 'Leveraged buyouts explicados', duration: '5:15' },
  { id: 124, title: 'Recapitalizations', duration: '4:25' },
  { id: 125, title: 'Dividend recaps', duration: '4:30' },
  { id: 126, title: 'Workout investing', duration: '4:55' },
  { id: 127, title: 'Chapter 11 investing', duration: '4:40' },
  { id: 128, title: 'Claims trading', duration: '4:15' },
  { id: 129, title: 'Post-reorg equity', duration: '4:50' },
  { id: 130, title: 'M&A arbitrage avanzado', duration: '5:00' },
  { id: 131, title: 'Spin-off investing', duration: '4:20' },
  { id: 132, title: 'Carve-outs y tracking stocks', duration: '4:35' },
  { id: 133, title: 'Rights offerings', duration: '4:45' },
  { id: 134, title: 'PIPEs y registered directs', duration: '4:10' },
  { id: 135, title: 'Follow-on offerings', duration: '4:30' },
  { id: 136, title: 'Block trades y dark pools', duration: '4:55' },
  { id: 137, title: 'Algorithmic execution', duration: '5:05' },
  { id: 138, title: 'VWAP y TWAP strategies', duration: '4:25' },
  { id: 139, title: 'Implementation shortfall', duration: '4:40' },
  { id: 140, title: 'Market making y liquidity', duration: '4:15' },
  { id: 141, title: 'Order book dynamics', duration: '4:50' },
  { id: 142, title: 'Microstructure y price impact', duration: '4:35' },
  { id: 143, title: 'Latency arbitrage', duration: '4:20' },
  { id: 144, title: 'Order flow trading', duration: '4:45' },
  { id: 145, title: 'Sentiment analysis con NLP', duration: '5:10' },
  { id: 146, title: 'Alternative data en trading', duration: '4:30' },
  { id: 147, title: 'Satellite data y commodities', duration: '4:55' },
  { id: 148, title: 'Web scraping para señales', duration: '4:15' },
  { id: 149, title: 'Backtesting riguroso', duration: '4:40' },
  { id: 150, title: 'Cierre de maestría: visión integral', duration: '5:25' },
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: progressData, error: progressErr } = await supabase
          .from('user_progress')
          .select('nivel_activo, videos_vistos_hoy, videos_fecha, saldo_ingresos, ganancias_hoy, ganancias_mes, ganancias_semana, ingresos_totales, pasantia_completada')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!progressErr && progressData) {
          setProgress(progressData as ProgressData);
        }

        const activeLevel = (progressData as { nivel_activo: string } | null)?.nivel_activo || 'pasantia';
        const { data: levelData, error: levelErr } = await supabase
          .from('levels')
          .select('id, task_payment, daily_tasks')
          .eq('id', activeLevel)
          .maybeSingle();

        if (!levelErr && levelData) {
          setLevel(levelData as LevelData);
        }
      } catch {
        // Connection error — non-fatal
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const isSameDay = progress?.videos_fecha === today;
  const videosVistosHoy = isSameDay ? (progress?.videos_vistos_hoy ?? 0) : 0;
  const tareasRestantes = level ? Math.max(0, level.daily_tasks - videosVistosHoy) : 0;
  const allTasksDone = tareasRestantes === 0;

  const isPasantia = (progress?.nivel_activo || 'pasantia') === 'pasantia';
  const isPasantiaBlocked = isPasantia && (progress?.pasantia_completada ?? false);
  const canWatchVideos = !isPasantiaBlocked && !allTasksDone;

  async function handleWatchVideo(videoId: number) {
    if (allTasksDone || watchingVideo !== null || !canWatchVideos) return;

    setWatchingVideo(videoId);
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setWatchingVideo(null); return; }

      const { data: freshProg } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const prog = freshProg as Record<string, unknown> | null;
      const progFecha = String(prog?.videos_fecha ?? '');
      const isCurrentDay = progFecha === today;
      const currentWatched = isCurrentDay ? Number(prog?.videos_vistos_hoy ?? 0) : 0;

      if (currentWatched >= (level?.daily_tasks ?? 0)) {
        setWatchingVideo(null);
        return;
      }

      const newWatched = currentWatched + 1;
      const taskPayment = level?.task_payment ?? 1000;

      const updatePayload: Record<string, unknown> = {
        videos_vistos_hoy: newWatched,
        videos_fecha: today,
        saldo_ingresos: (Number(prog?.saldo_ingresos) || 0) + taskPayment,
        ganancias_hoy: isCurrentDay ? (Number(prog?.ganancias_hoy) || 0) + taskPayment : taskPayment,
        ganancias_mes: (Number(prog?.ganancias_mes) || 0) + taskPayment,
        ganancias_semana: (Number(prog?.ganancias_semana) || 0) + taskPayment,
        ingresos_totales: (Number(prog?.ingresos_totales) || 0) + taskPayment,
        updated_at: new Date().toISOString(),
      };

      if (!isCurrentDay) {
        updatePayload.ganancias_hoy = taskPayment;
      }

      const isPasantiaLevelNow = String(prog?.nivel_activo || 'pasantia') === 'pasantia';
      const justFinishedAllTasks = newWatched >= (level?.daily_tasks ?? 5);

      if (isPasantiaLevelNow && justFinishedAllTasks) {
        updatePayload.pasantia_completada = true;
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
          saldo_ingresos: (Number(prev.saldo_ingresos) || 0) + taskPayment,
          ganancias_hoy: isCurrentDay ? (Number(prev.ganancias_hoy) || 0) + taskPayment : taskPayment,
          ganancias_mes: (Number(prev.ganancias_mes) || 0) + taskPayment,
          ganancias_semana: (Number(prev.ganancias_semana) || 0) + taskPayment,
          ingresos_totales: (Number(prev.ingresos_totales) || 0) + taskPayment,
          pasantia_completada: isPasantiaLevelNow && justFinishedAllTasks ? true : prev.pasantia_completada,
        } : prev);
    } catch {
      // Silent fail on video watch DB update
    } finally {
      setWatchingVideo(null);
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

  if (isPasantiaBlocked) {
    return (
      <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
        <div className="fixed pointer-events-none z-0" style={{ width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="fixed pointer-events-none z-0" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)', bottom: '100px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/perfil')} className="flex items-center gap-2 transition-opacity hover:opacity-70 active:scale-95" style={{ color: '#FFC107' }}>
              <ArrowLeft size={20} /><span className="text-sm font-bold">Regresar al Perfil</span>
            </button>
            <div className="flex items-center gap-2">
              <Video size={14} style={{ color: '#FFC107' }} />
              <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>Vídeos</span>
              <Video size={14} style={{ color: '#FFC107' }} />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-3xl p-8 text-center" style={{ background: '#1A1A1A', border: '1px solid rgba(255,193,7,0.3)', boxShadow: '0 0 40px rgba(255,193,7,0.12)' }}>
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,193,7,0.12)' }}>
                <Lock size={24} style={{ color: '#FFC107' }} />
              </div>
              <h2 className="font-black text-xl mb-3" style={{ background: 'linear-gradient(135deg, #FFD700, #B8860B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pasantía Completada</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#888888' }}>Has completado todas las tareas de la Pasantía. Para seguir calificando videos y obtener mayores ganancias, compra un nivel superior.</p>
              <button onClick={() => navigate('/niveles')} className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95" style={{ background: '#FFC107', color: '#000000', boxShadow: '0 4px 20px rgba(255,193,7,0.3)' }}>
                <Zap size={16} /> Comprar Nivel Superior
              </button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
      <div className="fixed pointer-events-none z-0" style={{ width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)', bottom: '100px', left: '50%', transform: 'translateX(-50%)' }} />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/perfil')} className="flex items-center gap-2 transition-opacity hover:opacity-70 active:scale-95" style={{ color: '#FFC107' }}>
            <ArrowLeft size={20} /><span className="text-sm font-bold">Regresar al Perfil</span>
          </button>
          <div className="flex items-center gap-2">
            <Video size={14} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>Vídeos</span>
            <Video size={14} style={{ color: '#FFC107' }} />
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto mb-5">
          <div className="rounded-2xl p-4" style={{ background: '#1A1A1A', border: allTasksDone ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,193,7,0.2)', boxShadow: allTasksDone ? '0 0 20px rgba(34,197,94,0.1)' : '0 0 12px rgba(255,193,7,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={16} style={{ color: allTasksDone ? '#22C55E' : '#FFC107' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>Tareas de hoy ({level?.id?.toUpperCase() ?? 'Pasantía'})</span>
              </div>
              <span className="text-sm font-black" style={{ color: allTasksDone ? '#22C55E' : '#FFC107' }}>{videosVistosHoy} / {level?.daily_tasks ?? 5}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,193,7,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(videosVistosHoy / (level?.daily_tasks ?? 5)) * 100}%`, background: allTasksDone ? 'linear-gradient(90deg, #22C55E, #4ADE80)' : 'linear-gradient(90deg, #FFC107, #FFD700)' }} />
            </div>
            {allTasksDone && (
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>Has completado todas las tareas diarias. Vuelve mañana.</span>
              </div>
            )}
            {!allTasksDone && (
              <p className="text-xs mt-2" style={{ color: '#888888' }}>Gana <span style={{ color: '#FFC107', fontWeight: 900 }}>${level?.task_payment.toLocaleString('es-CO') ?? '1,000'}</span> por cada vídeo visto</p>
            )}
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Sparkles size={12} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>Videos Disponibles</span>
          </div>
          <div className="flex flex-col gap-3">
            {MOCK_VIDEOS.slice(0, level?.daily_tasks ?? 5).map((video) => {
              const isCompleted = completedToday.has(video.id);
              const isCurrentlyWatching = watchingVideo === video.id;
              const canWatch = !allTasksDone && !isCompleted && watchingVideo === null;
              return (
                <VideoRow key={video.id} video={video} isCompleted={isCompleted} isWatching={isCurrentlyWatching} canWatch={canWatch} disabled={allTasksDone} taskPayment={level?.task_payment ?? 1000} onWatch={() => handleWatchVideo(video.id)} />
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function VideoRow({ video, isCompleted, isWatching, canWatch, disabled, taskPayment, onWatch }: {
  video: { id: number; title: string; duration: string }; isCompleted: boolean; isWatching: boolean; canWatch: boolean; disabled: boolean; taskPayment: number; onWatch: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button onClick={canWatch ? onWatch : undefined} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 rounded-xl transition-all duration-300"
      style={{ background: isCompleted ? 'rgba(34,197,94,0.06)' : hovered && canWatch ? 'rgba(255,193,7,0.06)' : '#1A1A1A', border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : hovered && canWatch ? 'rgba(255,193,7,0.35)' : 'rgba(255,193,7,0.12)'}`, boxShadow: isCompleted ? '0 0 12px rgba(34,197,94,0.06)' : hovered && canWatch ? '0 0 16px rgba(255,193,7,0.08)' : 'none', padding: '14px 16px', opacity: disabled && !isCompleted ? 0.4 : 1, cursor: canWatch ? 'pointer' : 'default' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(255,193,7,0.08)' }}>
        {isCompleted ? <CheckCircle2 size={18} style={{ color: '#22C55E' }} /> : isWatching ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FFC107', borderTopColor: 'transparent' }} /> : <Play size={16} style={{ color: canWatch ? '#FFC107' : '#555555' }} />}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold" style={{ color: isCompleted ? 'rgba(34,197,94,0.7)' : '#FFFFFF' }}>{video.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={10} style={{ color: '#888888' }} />
          <span className="text-xs" style={{ color: '#888888' }}>{video.duration}</span>
        </div>
      </div>
      {isCompleted && <span className="text-xs font-bold" style={{ color: '#22C55E' }}>+${taskPayment.toLocaleString('es-CO')}</span>}
      {isWatching && <span className="text-xs font-bold" style={{ color: '#FFC107' }}>Viendo...</span>}
    </button>
  );
}
