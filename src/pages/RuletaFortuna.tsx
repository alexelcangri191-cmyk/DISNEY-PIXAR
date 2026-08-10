import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Info, ShieldCheck, X, Gift, Lock, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 20 + 15,
    opacity: Math.random() * 0.6 + 0.2,
    delay: Math.random() * 10,
  }));
}

const CONDICIONES = [
  'Las oportunidades de ingresos en la ruleta solo se generan por la activación de planes J, no aplica para el plan de pasantías ni para ningún otro tipo de transacción.',
  'Solo cuentan los empleados o referidos en el primer nivel de tu red, las actividades de nivel 2 y nivel 3 no generan oportunidades en este sistema.',
  'Los premios se acreditan directamente en la billetera de ingresos.',
  'La aplicación se reserva los derechos de auditar activaciones que presenten algún tipo de irregularidades.',
  'Los premios obtenidos por la ruleta serán activados automáticamente para sus respectivos beneficios.',
];

const SEGMENTOS = [
  { valor: 500, label: '$500' },
  { valor: 1000, label: '$1.000' },
  { valor: 2000, label: '$2.000' },
  { valor: 3000, label: '$3.000' },
  { valor: 4000, label: '$4.000' },
  { valor: 5000, label: '$5.000' },
  { valor: 6000, label: '$6.000' },
  { valor: 7000, label: '$7.000' },
  { valor: 8000, label: '$8.000' },
  { valor: 9000, label: '$9.000' },
];

const PREMIOS_PERMITIDOS = [500, 1000, 2000];
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const SEGMENT_ANGLE = 360 / SEGMENTOS.length;

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function RuletaFortuna() {
  const navigate = useNavigate();
  const [particles] = useState(() => generateParticles(60));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [lastSpinAt, setLastSpinAt] = useState<Date | null>(null);
  const [nivelActivo, setNivelActivo] = useState<string>('pasantia');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [premioGanado, setPremioGanado] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nivelNormalizado = nivelActivo.toLowerCase().trim();
  const esNivelJ = /^j\d+$/.test(nivelNormalizado);
  const bloqueadaPorNivel = !esNivelJ;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.005 + 0.002,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 193, 7, ${s.alpha * 0.7})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    async function fetchEstado() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('last_spin_at, nivel_activo')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        setErrorMsg('No se pudo cargar el estado de la ruleta.');
      }
      if (data) {
        setNivelActivo(data.nivel_activo || 'pasantia');
        if (data.last_spin_at) setLastSpinAt(new Date(data.last_spin_at));
      }
      setLoading(false);
    }
    fetchEstado();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tiempoRestante = lastSpinAt ? COOLDOWN_MS - (now - lastSpinAt.getTime()) : 0;
  const enCooldown = tiempoRestante > 0;
  const puedeGirar = !bloqueadaPorNivel && !enCooldown && !spinning && !loading;

  const girar = useCallback(async () => {
    if (!puedeGirar) return;
    setSpinning(true);
    setErrorMsg(null);

    const premio = PREMIOS_PERMITIDOS[Math.floor(Math.random() * PREMIOS_PERMITIDOS.length)];
    const indiceGanador = SEGMENTOS.findIndex((s) => s.valor === premio);

    const vueltas = 6 + Math.floor(Math.random() * 3);
    const centroSegmento = indiceGanador * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const offset = (360 - centroSegmento) % 360;
    const rotacionFinal = rotation + vueltas * 360 + offset;

    setRotation(rotacionFinal);

    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('No se pudo verificar tu sesión.');
        setSpinning(false);
        return;
      }

      const { error: progressError } = await supabase
        .from('user_progress')
        .update({ last_spin_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (progressError) {
        setErrorMsg('No se pudo registrar tu tiro. Inténtalo de nuevo.');
        setSpinning(false);
        return;
      }

      const { data: progreso } = await supabase
        .from('user_progress')
        .select('saldo_ingresos')
        .eq('user_id', user.id)
        .maybeSingle();

      const saldoActual = progreso ? Number(progreso.saldo_ingresos) || 0 : 0;
      const nuevoSaldo = saldoActual + premio;

      await supabase
        .from('user_progress')
        .update({ saldo_ingresos: nuevoSaldo })
        .eq('user_id', user.id);

      await supabase
        .from('transacciones')
        .insert({
          user_id: user.id,
          tipo: 'Premio Ruleta',
          monto: premio,
          descripcion: `Premio de la Ruleta de la Fortuna: $${premio.toLocaleString('es-CO')} COP`,
        });

      setLastSpinAt(new Date());
      setPremioGanado(premio);
      setShowModal(true);
      setSpinning(false);
    }, 4800);
  }, [puedeGirar, rotation]);

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.8 }}
      />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: '#FFC107',
              opacity: p.opacity,
              animation: `floatUp ${p.speed}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>

      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8 pb-24">
        {/* Back button */}
        <div className="w-full max-w-lg flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-2 transition-all duration-300 active:scale-95 hover:opacity-80"
            style={{ color: '#FFC107' }}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Regresar al Perfil</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-8">
          <Sparkles size={14} style={{ color: '#FFC107' }} />
          <span
            className="text-xs font-extrabold tracking-[0.25em] uppercase"
            style={{ color: '#FFC107' }}
          >
            Ruleta de la Fortuna
          </span>
          <Sparkles size={14} style={{ color: '#FFC107' }} />
        </div>

        {/* Condiciones de Uso card */}
        <div className="w-full max-w-lg">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Card header */}
            <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,193,7,0.15)' }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,193,7,0.1)',
                  border: '1px solid rgba(255,193,7,0.2)',
                }}
              >
                <ShieldCheck size={20} style={{ color: '#FFC107' }} />
              </div>
              <h2
                className="font-black text-base tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Condiciones de Uso
              </h2>
            </div>

            {/* Numbered conditions */}
            <div className="p-5 flex flex-col gap-4">
              {CONDICIONES.map((texto, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'rgba(255,193,7,0.12)',
                      border: '1px solid rgba(255,193,7,0.3)',
                    }}
                  >
                    <span
                      className="text-xs font-black"
                      style={{ color: '#FFC107' }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed pt-0.5"
                    style={{ color: '#CCCCCC' }}
                  >
                    {texto}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,193,7,0.1)', background: 'rgba(255,193,7,0.03)' }}
            >
              <Info size={14} style={{ color: 'rgba(255,193,7,0.6)' }} />
              <span className="text-xs" style={{ color: '#888888' }}>
                Al participar aceptas estas condiciones.
              </span>
            </div>
          </div>
        </div>

        {/* ===== Ruleta interactiva ===== */}
        <div className="w-full max-w-lg mt-6">
          <div
            className="rounded-3xl p-6 flex flex-col items-center"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Indicador / puntero */}
            <div className="relative flex flex-col items-center">
              <div
                className="z-20"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '14px solid transparent',
                  borderRight: '14px solid transparent',
                  borderTop: '22px solid #FFC107',
                  filter: 'drop-shadow(0 0 8px rgba(255,193,7,0.8))',
                }}
              />

              {/* Disco de la ruleta */}
              <div
                className="relative"
                style={{
                  width: 'min(78vw, 320px)',
                  height: 'min(78vw, 320px)',
                  marginTop: '-6px',
                }}
              >
                {/* Anillo exterior resplandeciente */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: '0 0 30px rgba(255,193,7,0.35), 0 0 60px rgba(255,193,7,0.15)',
                    border: '3px solid rgba(255,193,7,0.6)',
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: spinning
                        ? 'transform 4.8s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                        : 'none',
                    }}
                  >
                    <svg
                      viewBox="0 0 200 200"
                      width="100%"
                      height="100%"
                      style={{ display: 'block' }}
                    >
                      {SEGMENTOS.map((seg, i) => {
                        const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
                        const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
                        const r = 100;
                        const x1 = 100 + r * Math.cos(startAngle);
                        const y1 = 100 + r * Math.sin(startAngle);
                        const x2 = 100 + r * Math.cos(endAngle);
                        const y2 = 100 + r * Math.sin(endAngle);
                        const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
                        const path = `M100,100 L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;

                        const midAngle = (startAngle + endAngle) / 2;
                        const tx = 100 + r * 0.62 * Math.cos(midAngle);
                        const ty = 100 + r * 0.62 * Math.sin(midAngle);
                        const rotateDeg = (midAngle * 180) / Math.PI + 90;

                        const colorPar = i % 2 === 0;
                        const fill = colorPar ? '#241f00' : '#3a3000';
                        const stroke = 'rgba(255,193,7,0.35)';

                        return (
                          <g key={i}>
                            <path d={path} fill={fill} stroke={stroke} strokeWidth="0.5" />
                            <text
                              x={tx}
                              y={ty}
                              fill="#FFD700"
                              fontSize="9"
                              fontWeight="800"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(${rotateDeg} ${tx} ${ty})`}
                              style={{ textShadow: '0 0 4px rgba(255,193,7,0.6)' }}
                            >
                              {seg.label}
                            </text>
                          </g>
                        );
                      })}
                      <circle cx="100" cy="100" r="14" fill="#1A1A1A" stroke="rgba(255,193,7,0.6)" strokeWidth="2" />
                      <circle cx="100" cy="100" r="6" fill="#FFC107" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado / botón */}
            <div className="mt-7 w-full flex flex-col items-center">
              {loading ? (
                <p className="text-sm" style={{ color: '#888888' }}>Cargando...</p>
              ) : bloqueadaPorNivel ? (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.25)' }}
                  >
                    <Lock size={26} style={{ color: '#FFC107' }} />
                  </div>
                  <p className="text-sm font-bold text-center" style={{ color: '#CCCCCC' }}>
                    La ruleta está bloqueada para tu nivel actual.
                  </p>
                  <p className="text-xs text-center" style={{ color: '#888888' }}>
                    Activa un plan J (J1, J2, J3...) para participar.
                  </p>
                </div>
              ) : enCooldown ? (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.25)' }}
                  >
                    <Clock size={26} style={{ color: '#FFC107' }} />
                  </div>
                  <p className="text-sm font-bold text-center" style={{ color: '#CCCCCC' }}>
                    Ya giraste la ruleta hoy.
                  </p>
                  <p className="text-xs" style={{ color: '#888888' }}>
                    Disponible en
                  </p>
                  <p
                    className="text-lg font-black tabular-nums"
                    style={{ color: '#FFC107', textShadow: '0 0 10px rgba(255,193,7,0.4)' }}
                  >
                    {formatCountdown(tiempoRestante)}
                  </p>
                </div>
              ) : (
                <button
                  onClick={girar}
                  disabled={!puedeGirar}
                  className="relative w-full max-w-xs py-4 rounded-2xl font-black text-base tracking-wide transition-all duration-300 active:scale-95"
                  style={{
                    background: spinning
                      ? 'rgba(255,193,7,0.15)'
                      : 'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #B8860B 100%)',
                    color: '#1A1A1A',
                    border: '1px solid rgba(255,193,7,0.6)',
                    boxShadow: '0 0 24px rgba(255,193,7,0.5), 0 0 48px rgba(255,193,7,0.2)',
                    opacity: spinning ? 0.5 : 1,
                    cursor: spinning ? 'not-allowed' : 'pointer',
                  }}
                >
                  {spinning ? 'Girando...' : '¡A Rodar!'}
                </button>
              )}

              {errorMsg && (
                <p className="mt-4 text-xs text-center" style={{ color: '#ef4444' }}>
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de victoria */}
      {showModal && premioGanado !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-8 text-center"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.5)',
              boxShadow: '0 0 60px rgba(255,193,7,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar X */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90"
              style={{
                background: 'rgba(255,193,7,0.1)',
                border: '1px solid rgba(255,193,7,0.3)',
                color: '#FFC107',
              }}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            {/* Icono regalo */}
            <div
              className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,193,7,0.12)',
                border: '1px solid rgba(255,193,7,0.4)',
                boxShadow: '0 0 24px rgba(255,193,7,0.3)',
              }}
            >
              <Gift size={30} style={{ color: '#FFC107' }} />
            </div>

            <h2
              className="font-black text-xl mb-3"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ¡Felicidades!
            </h2>
            <p className="text-sm mb-2" style={{ color: '#CCCCCC' }}>
              Has ganado
            </p>
            <p
              className="text-2xl font-black mb-6"
              style={{ color: '#FFC107', textShadow: '0 0 12px rgba(255,193,7,0.4)' }}
            >
              ${premioGanado.toLocaleString('es-CO')} COP
            </p>
            <p className="text-xs mb-6" style={{ color: '#888888' }}>
              El premio se acreditó en tu Billetera de Ingresos.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95"
              style={{
                background: 'rgba(255,193,7,0.1)',
                border: '1px solid rgba(255,193,7,0.4)',
                color: '#FFC107',
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      <BottomNav />

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
