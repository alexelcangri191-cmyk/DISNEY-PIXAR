import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Sparkles,
  Play,
  CheckCircle2,
  Wallet,
  AlertTriangle,
  Lock,
  Crown,
} from 'lucide-react';
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
  saldo_personal: number;
  videos_vistos_hoy: number;
  videos_fecha: string;
  pasantia_completada: boolean;
}

const formatMoney = (amount: number) => `$${amount.toLocaleString('es-CO')}`;

export default function Niveles() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select(
            'nivel_activo, saldo_personal, videos_vistos_hoy, videos_fecha, pasantia_completada'
          )
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

  useEffect(() => {
    fetchData();
  }, []);

  const nivelActivo = progress?.nivel_activo || 'pasantia';
  const saldoPersonal = Number(progress?.saldo_personal) || 0;

  const today = new Date().toISOString().slice(0, 10);
  const isSameDay = progress?.videos_fecha === today;
  const videosVistosHoy = isSameDay ? progress?.videos_vistos_hoy ?? 0 : 0;

  function dismissAlerts() {
    setAlertMsg(null);
    setSuccessMsg(null);
  }

  async function handleActivate(level: LevelData) {
    if (activating) return;

    if (level.is_free) {
      setActivating(level.id);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setActivating(null);
          return;
        }

        const { error } = await supabase
          .from('user_progress')
          .update({
            nivel_activo: level.id,
            pasantia_completada: false,
            videos_vistos_hoy: 0,
            videos_fecha: today,
          })
          .eq('user_id', user.id);

        if (error) {
          setAlertMsg('Error al activar el nivel. Intenta de nuevo.');
          setActivating(null);
          return;
        }

        setProgress((prev) =>
          prev ? {
            ...prev,
            nivel_activo: level.id,
            pasantia_completada: false,
            videos_vistos_hoy: 0,
            videos_fecha: today,
          } : prev
        );
        setSuccessMsg('Pasantía activada. ¡Empieza a calificar videos!');
        setTimeout(() => navigate('/videos'), 1200);
      } catch {
        setAlertMsg('Error de conexión al activar el nivel.');
      } finally {
        setActivating(null);
      }
      return;
    }

    const investment = Number(level.investment_amount);

    if (saldoPersonal < investment) {
      setAlertMsg(
        `Saldo insuficiente. Necesitas ${formatMoney(investment)}, tienes ${formatMoney(saldoPersonal)}. Recarga para continuar.`
      );
      setTimeout(() => {
        navigate('/recargar');
      }, 2500);
      return;
    }

    setActivating(level.id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setActivating(null);
        return;
      }

      const { data: freshProg } = await supabase
        .from('user_progress')
        .select('saldo_personal, nivel_activo')
        .eq('user_id', user.id)
        .single();

      const currentSaldo =
        Number(
          (freshProg as { saldo_personal: number } | null)?.saldo_personal
        ) || 0;
      if (currentSaldo < investment) {
        setAlertMsg(
          'Saldo insuficiente en billetera personal, por favor recarga'
        );
        setActivating(null);
        setTimeout(() => {
          navigate('/recargar');
        }, 2000);
        return;
      }

      const newSaldo = currentSaldo - investment;
      const { error } = await supabase
        .from('user_progress')
        .update({
          saldo_personal: newSaldo,
          nivel_activo: level.id,
          videos_vistos_hoy: 0,
          videos_fecha: today,
          pasantia_completada: false,
        })
        .eq('user_id', user.id);

      if (error) {
        setAlertMsg('Error al activar el nivel. Intenta de nuevo.');
        setActivating(null);
        return;
      }

      const { error: userErr } = await supabase
        .from('users')
        .update({ level: level.name })
        .eq('id', user.id);

      if (userErr) {
        // Non-fatal: level is still activated in user_progress
      }

      setProgress((prev) =>
        prev
          ? {
              ...prev,
              saldo_personal: newSaldo,
              nivel_activo: level.id,
              videos_vistos_hoy: 0,
              videos_fecha: today,
              pasantia_completada: false,
            }
          : prev
      );
      setSuccessMsg(
        `¡Nivel ${level.name} activado! Descontados ${formatMoney(investment)} de tu saldo.`
      );
      setTimeout(() => navigate('/videos'), 1200);
    } catch {
      setAlertMsg('Error de conexión al activar el nivel.');
    } finally {
      setActivating(null);
    }
  }

  if (loading) {
    return (
      <div
        className="relative min-h-screen overflow-x-hidden pb-20 flex items-center justify-center"
        style={{ background: '#000000' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#FFC107', animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#FFC107', animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#FFC107', animationDelay: '300ms' }}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-20"
      style={{ background: '#000000' }}
    >
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,193,7,0.05) 0%, transparent 70%)',
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
            'radial-gradient(circle, rgba(255,193,7,0.03) 0%, transparent 70%)',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
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
            <Zap size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Niveles
            </span>
            <Zap size={14} style={{ color: '#FFC107' }} />
          </div>
        </div>

        {/* Wallet summary */}
        <div className="w-full max-w-lg mx-auto mb-5">
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              boxShadow: '0 0 20px rgba(255,193,7,0.06)',
            }}
          >
            <div className="flex items-center gap-2">
              <Wallet size={18} style={{ color: '#FFC107' }} />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#888888' }}
              >
                Tu Saldo
              </span>
            </div>
            <span
              className="font-black text-lg"
              style={{ color: '#FFC107' }}
            >
              {formatMoney(saldoPersonal)}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.4)',
              }}
            >
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
              <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                {errorMsg}
              </span>
            </div>
          </div>
        )}
        {alertMsg && (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div
              className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.4)',
              }}
              onClick={dismissAlerts}
            >
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
              <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                {alertMsg}
              </span>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="w-full max-w-lg mx-auto mb-4">
            <div
              className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.4)',
              }}
              onClick={dismissAlerts}
            >
              <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
              <span className="text-sm font-bold" style={{ color: '#22C55E' }}>
                {successMsg}
              </span>
            </div>
          </div>
        )}

        <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
          {levels.map((level) => {
            const isActive = level.id === nivelActivo;
            const canAfford = saldoPersonal >= Number(level.investment_amount);

            if (level.is_free) {
              return (
                <FreeLevelCard
                  key={level.id}
                  level={level}
                  isActive={isActive}
                  videosVistosHoy={videosVistosHoy}
                  activating={activating === level.id}
                  onActivate={() => handleActivate(level)}
                />
              );
            }
            return (
              <PaidLevelCard
                key={level.id}
                level={level}
                isActive={isActive}
                canAfford={canAfford}
                saldoPersonal={saldoPersonal}
                activating={activating === level.id}
                onActivate={() => handleActivate(level)}
              />
            );
          })}
          {levels.length === 0 && !errorMsg && (
            <div className="text-center py-12">
              <Lock
                size={32}
                style={{ color: '#888888' }}
                className="mx-auto mb-3"
              />
              <p className="text-sm" style={{ color: '#888888' }}>
                No se encontraron niveles disponibles
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function FreeLevelCard({
  level,
  isActive,
  videosVistosHoy,
  activating,
  onActivate,
}: {
  level: LevelData;
  isActive: boolean;
  videosVistosHoy: number;
  activating: boolean;
  onActivate: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const tareasCompletadas = videosVistosHoy >= level.daily_tasks;

  const gridItems = [
    {
      label: 'Ingresos Mensuales',
      value: formatMoney(Number(level.monthly_income)),
    },
    {
      label: 'Ingresos Diarios',
      value: formatMoney(Number(level.daily_income)),
    },
    {
      label: 'Pago por Tarea',
      value: formatMoney(Number(level.task_payment)),
    },
    { label: 'Tareas Diarias', value: String(level.daily_tasks) },
  ];

  return (
    <div
      className="rounded-[20px] overflow-hidden transition-all duration-300"
      style={{
        background: '#1A1A1A',
        border: `1px solid ${
          isActive ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.3)'
        }`,
        boxShadow: isActive
          ? '0 0 40px rgba(34,197,94,0.15)'
          : '0 0 20px rgba(34,197,94,0.08)',
      }}
    >
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
        </div>
      </div>
      <div
        className="mx-5 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)',
        }}
      />
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {gridItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3"
              style={{
                background: 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.1)',
              }}
            >
              <p
                className="text-[0.6rem] font-bold uppercase tracking-wider mb-1"
                style={{ color: '#888888' }}
              >
                {item.label}
              </p>
              <p className="font-black text-sm" style={{ color: '#FFFFFF' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-3 rounded-xl p-3 flex items-center justify-between"
          style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.15)',
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: '#888888' }}
          >
            Inversión
          </span>
          <span className="font-black text-sm" style={{ color: '#22C55E' }}>
            ¡GRATIS!
          </span>
        </div>
        {isActive && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: '#888888' }}>
                Tareas completadas hoy
              </span>
              <span
                className="text-xs font-black"
                style={{
                  color: tareasCompletadas ? '#22C55E' : '#FFC107',
                }}
              >
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
                }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        {isActive ? (
          <button
            onClick={() => onActivate()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={activating}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={{
              background: hovered ? '#4ADE80' : '#22C55E',
              color: '#000000',
              boxShadow: hovered
                ? '0 6px 30px rgba(34,197,94,0.5)'
                : '0 4px 20px rgba(34,197,94,0.3)',
              opacity: activating ? 0.7 : 1,
            }}
          >
            {activating ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor: '#000',
                    borderTopColor: 'transparent',
                  }}
                />
                Activando...
              </>
            ) : (
              <>
                <Play size={16} />
                Calificar Videos
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onActivate}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={activating}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={{
              background: hovered ? '#4ADE80' : '#22C55E',
              color: '#000000',
              boxShadow: hovered
                ? '0 6px 30px rgba(34,197,94,0.5)'
                : '0 4px 20px rgba(34,197,94,0.3)',
              opacity: activating ? 0.7 : 1,
            }}
          >
            {activating ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor: '#000',
                    borderTopColor: 'transparent',
                  }}
                />
                Activando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Activar Pasantía
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function PaidLevelCard({
  level,
  isActive,
  canAfford,
  saldoPersonal,
  activating,
  onActivate,
}: {
  level: LevelData;
  isActive: boolean;
  canAfford: boolean;
  saldoPersonal: number;
  activating: boolean;
  onActivate: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const gridItems = [
    {
      label: 'Ingresos Mensuales',
      value: formatMoney(Number(level.monthly_income)),
    },
    {
      label: 'Ingresos Diarios',
      value: formatMoney(Number(level.daily_income)),
    },
    {
      label: 'Ingresos Anuales',
      value: formatMoney(Number(level.annual_income)),
    },
    { label: 'Tareas Diarias', value: String(level.daily_tasks) },
  ];

  return (
    <div
      className="rounded-[20px] overflow-hidden transition-all duration-300"
      style={{
        background: '#1A1A1A',
        border: `1px solid ${
          isActive
            ? 'rgba(255,193,7,0.5)'
            : canAfford
            ? 'rgba(255,193,7,0.25)'
            : 'rgba(255,193,7,0.12)'
        }`,
        boxShadow: isActive
          ? '0 0 40px rgba(255,193,7,0.15)'
          : canAfford
          ? '0 0 20px rgba(255,193,7,0.08)'
          : 'none',
        opacity: canAfford || isActive ? 1 : 0.7,
      }}
    >
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,193,7,0.12)' }}
            >
              {level.sort_order >= 3 ? (
                <Crown size={20} style={{ color: '#FFC107' }} />
              ) : (
                <Zap size={20} style={{ color: '#FFC107' }} />
              )}
            </div>
            <h2
              className="font-black text-xl tracking-wide"
              style={{
                background:
                  'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {level.name}
            </h2>
          </div>
          <p className="text-xs text-right" style={{ color: '#888888' }}>
            Tiempo de compromiso:
            <br />
            <span className="font-bold" style={{ color: '#FFC107' }}>
              {level.commitment_days} días
            </span>
          </p>
        </div>
      </div>
      <div
        className="mx-5 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,193,7,0.3), transparent)',
        }}
      />
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {gridItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3"
              style={{
                background: 'rgba(255,193,7,0.04)',
                border: '1px solid rgba(255,193,7,0.1)',
              }}
            >
              <p
                className="text-[0.6rem] font-bold uppercase tracking-wider mb-1"
                style={{ color: '#888888' }}
              >
                {item.label}
              </p>
              <p className="font-black text-sm" style={{ color: '#FFFFFF' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-3 rounded-xl p-3 flex items-center justify-between"
          style={{
            background: 'rgba(255,193,7,0.06)',
            border: '1px solid rgba(255,193,7,0.15)',
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: '#888888' }}
          >
            Monto de inversión
          </span>
          <span className="font-black text-sm" style={{ color: '#FFC107' }}>
            {formatMoney(Number(level.investment_amount))}
          </span>
        </div>
        {!isActive && (
          <div
            className="mt-3 rounded-xl p-3"
            style={{
              background: canAfford
                ? 'rgba(34,197,94,0.04)'
                : 'rgba(239,68,68,0.04)',
              border: `1px solid ${
                canAfford
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(239,68,68,0.15)'
              }`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold"
                style={{ color: '#888888' }}
              >
                Tu Billetera Personal
              </span>
              <span
                className="text-xs font-black"
                style={{ color: canAfford ? '#22C55E' : '#EF4444' }}
              >
                {formatMoney(saldoPersonal)}
              </span>
            </div>
            {!canAfford && (
              <p
                className="text-xs mt-1.5"
                style={{ color: '#EF4444' }}
              >
                Te faltan{' '}
                {formatMoney(
                  Number(level.investment_amount) - saldoPersonal
                )}{' '}
                para activar este nivel
              </p>
            )}
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        {isActive ? (
          <div
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,193,7,0.08)',
              border: '1px solid rgba(255,193,7,0.3)',
              color: '#FFC107',
            }}
          >
            <CheckCircle2 size={16} />
            <span className="font-bold text-sm">Nivel Activo</span>
          </div>
        ) : (
          <button
            onClick={onActivate}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={activating}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={{
              background: activating
                ? 'rgba(255,193,7,0.3)'
                : hovered && canAfford
                ? '#FFD700'
                : '#FFC107',
              color: '#000000',
              boxShadow: activating
                ? 'none'
                : hovered && canAfford
                ? '0 6px 30px rgba(255,193,7,0.5)'
                : '0 4px 20px rgba(255,193,7,0.3)',
              opacity: activating ? 0.7 : canAfford ? 1 : 0.5,
              cursor: canAfford ? 'pointer' : 'not-allowed',
            }}
          >
            {activating ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor: '#000',
                    borderTopColor: 'transparent',
                  }}
                />
                Activando...
              </>
            ) : canAfford ? (
              <>
                <Wallet size={16} />
                Activar
              </>
            ) : (
              <>
                <Wallet size={16} />
                Activar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
