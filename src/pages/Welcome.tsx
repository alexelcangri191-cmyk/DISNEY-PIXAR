import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, UserPlus, TrendingUp, X, Sparkles } from 'lucide-react';

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

export default function Welcome() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<'register' | 'login' | null>(null);
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

  const handleRegisterClick = () => {
    setModal('register');
    setTimeout(() => {
      navigate('/register');
      setModal(null);
    }, 500);
  };

  const handleLoginClick = () => {
    setModal('login');
    setTimeout(() => {
      navigate('/login');
      setModal(null);
    }, 500);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#000000' }}>
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

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pb-16">

        <header className="w-full max-w-lg mx-auto pt-14 pb-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.25em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Bienvenidos
            </span>
            <Sparkles size={14} style={{ color: '#FFC107' }} />
          </div>

          <h1
            className="font-black leading-none tracking-tight"
            style={{
              fontSize: 'clamp(2.8rem, 11vw, 4.5rem)',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(255,193,7,0.4))',
            }}
          >
            Disney &amp; Pixar
          </h1>

          <div
            className="mt-3 w-24 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #FFC107, transparent)' }}
          />
        </header>

        <section className="w-full max-w-lg mx-auto text-center mb-8">
          <h2
            className="font-bold mb-4 leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', color: '#FFFFFF' }}
          >
            Optimiza tu futuro,{' '}
            <span style={{ color: '#FFC107' }}>maximiza tus ingresos.</span>
          </h2>
          <p
            className="text-sm leading-relaxed mx-auto"
            style={{ color: '#888888', maxWidth: '600px', lineHeight: '1.75' }}
          >
            Únete a la red de inversores más exclusiva. Gestión inteligente, resultados diarios
            y seguridad de nivel global en un solo lugar. Invierte seguro y gana dinero.
            Únete a miles de colombianos que ya están generando ingresos diarios invirtiendo
            en nuestra plataforma. Trabaja con nosotros y sé parte de este gran equipo.
            No dejes pasar esta oportunidad.
          </p>
        </section>

        <div className="w-full max-w-lg mx-auto grid grid-cols-3 gap-3 mb-8">
          {[
            { value: '50K+', label: 'Inversores' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9★', label: 'Calificación' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-4 rounded-2xl"
              style={{
                background: '#1A1A1A',
                border: '1px solid rgba(255,193,7,0.2)',
                boxShadow: '0 0 16px rgba(255,193,7,0.08)',
              }}
            >
              <span className="font-black text-lg leading-none" style={{ color: '#FFC107' }}>
                {stat.value}
              </span>
              <span className="text-xs mt-1 font-medium" style={{ color: '#888888' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-lg mx-auto grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: <DollarSign size={28} />, label: 'Gana Diario' },
            { icon: <UserPlus size={28} />, label: 'Invita Amigos' },
            { icon: <TrendingUp size={28} />, label: 'Sube de Nivel' },
          ].map((feat) => (
            <FeatureCard key={feat.label} icon={feat.icon} label={feat.label} />
          ))}
        </div>

        <div
          className="w-full max-w-lg mx-auto rounded-2xl p-6 mb-8"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,193,7,0.2)',
            boxShadow: '0 0 24px rgba(255,193,7,0.08)',
          }}
        >
          <h3
            className="text-sm font-bold uppercase tracking-widest text-center mb-5"
            style={{ color: '#FFC107' }}
          >
            Como funciona
          </h3>
          <div className="flex flex-col gap-4">
            {[
              { step: '01', title: 'Crea tu cuenta', desc: 'Registro gratuito en menos de 2 minutos.' },
              { step: '02', title: 'Elige tu plan', desc: 'Selecciona el nivel de inversión que más te conviene.' },
              { step: '03', title: 'Genera ingresos', desc: 'Recibe ganancias diarias directamente en tu cuenta.' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs"
                  style={{ background: 'rgba(255,193,7,0.12)', color: '#FFC107' }}
                >
                  {item.step}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#888888' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
          <PrimaryButton onClick={handleRegisterClick}>
            Crear cuenta — Es gratis
          </PrimaryButton>
          <SecondaryButton onClick={handleLoginClick}>
            Iniciar sesion
          </SecondaryButton>
        </div>

        <p className="mt-6 text-xs text-center" style={{ color: '#555555' }}>
          Cifrado de extremo a extremo • Sin comisiones ocultas • Retiros seguros
        </p>

      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-8 text-center relative"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.35)',
              boxShadow: '0 0 60px rgba(255,193,7,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 rounded-full p-1 transition-colors"
              style={{ color: '#888888' }}
              onClick={() => setModal(null)}
            >
              <X size={20} />
            </button>

            <div
              className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,193,7,0.12)' }}
            >
              <TrendingUp size={28} style={{ color: '#FFC107' }} />
            </div>

            <h3
              className="font-black text-xl mb-2"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {modal === 'register' ? 'Crear cuenta' : 'Iniciar sesion'}
            </h3>

            <p className="text-sm mb-6" style={{ color: '#888888' }}>
              Redireccionando a la plataforma segura de Disney &amp; Pixar...
            </p>

            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

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

function FeatureCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex flex-col items-center gap-3 py-6 rounded-2xl cursor-default transition-transform duration-300"
      style={{
        background: '#1A1A1A',
        border: `1px solid ${hovered ? 'rgba(255,193,7,0.5)' : 'rgba(255,193,7,0.2)'}`,
        boxShadow: hovered
          ? '0 0 30px rgba(255,193,7,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 0 20px rgba(255,193,7,0.08), inset 0 1px 0 rgba(255,255,255,0.03)',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ color: '#FFC107' }}>{icon}</div>
      <span className="text-xs font-semibold text-center" style={{ color: '#888888' }}>
        {label}
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      className="w-full py-4 rounded-2xl font-extrabold text-base tracking-wide transition-all duration-300 active:scale-95"
      style={{
        background: hovered ? '#FFD700' : '#FFC107',
        color: '#000000',
        boxShadow: hovered ? '0 6px 36px rgba(255,193,7,0.6)' : '0 4px 24px rgba(255,193,7,0.35)',
        fontSize: '1rem',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      className="w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 active:scale-95"
      style={{
        background: hovered ? 'rgba(255,193,7,0.08)' : 'transparent',
        color: '#FFC107',
        border: '2px solid #FFC107',
        boxShadow: hovered ? '0 0 20px rgba(255,193,7,0.2)' : 'none',
        fontSize: '1rem',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}
