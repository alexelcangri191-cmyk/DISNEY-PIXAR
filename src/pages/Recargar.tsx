import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

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

const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

function formatearHora(fecha: Date): string {
  let horas = fecha.getHours();
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  const ampm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12;
  horas = horas ? horas : 12;
  return `${horas}:${minutos} ${ampm}`;
}

export default function Recargar() {
  const navigate = useNavigate();
  const [horaActual, setHoraActual] = useState(new Date());
  const [particles] = useState(() => generateParticles(60));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setHoraActual(new Date());
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const diaSemana = DIAS_SEMANA[horaActual.getDay()];
  const horaTexto = formatearHora(horaActual);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#000000' }}
    >
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
          background:
            'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
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
            'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-6">
        {/* Header */}
        <header className="w-full max-w-lg mx-auto flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 active:scale-90"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              color: '#888888',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'rgba(255,193,7,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#FFC107';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'rgba(255,193,7,0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = '#888888';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="font-black text-xl tracking-tight"
            style={{
              background:
                'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Recargar
          </h1>
        </header>

        {/* Schedule Notice Block */}
        <div
          className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,193,7,0.15)',
            boxShadow: '0 0 30px rgba(255,193,7,0.08)',
          }}
        >
          <div className="flex">
            {/* Left accent bar */}
            <div
              className="flex-shrink-0 w-1.5"
              style={{
                background:
                  'linear-gradient(180deg, #FFD700, #FFC107, #B8860B)',
              }}
            />
            <div className="flex-1 p-5 flex flex-col gap-3">
              {/* Title */}
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: '#FFC107' }} />
                <h2
                  className="font-bold text-sm tracking-wide"
                  style={{ color: '#FFC107' }}
                >
                  Recargas fuera de horario
                </h2>
              </div>

              {/* Availability text */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#AAAAAA' }}
              >
                Disponible de Lunes a Viernes de 08:00 AM – 12:00 PM y 2:00 PM –
                6:00 PM.
              </p>

              {/* Current time */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(255,193,7,0.06)',
                  border: '1px solid rgba(255,193,7,0.12)',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#FFC107' }}
                />
                <p className="text-xs" style={{ color: '#888888' }}>
                  Hora actual:{' '}
                  <span
                    className="font-semibold"
                    style={{ color: '#CCCCCC' }}
                  >
                    {diaSemana} {horaTexto}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
