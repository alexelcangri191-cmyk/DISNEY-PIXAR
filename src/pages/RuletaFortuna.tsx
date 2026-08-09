import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Info, ShieldCheck } from 'lucide-react';
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

export default function RuletaFortuna() {
  const navigate = useNavigate();
  const [particles] = useState(() => generateParticles(60));
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      </div>

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
