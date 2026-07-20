import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phone.trim()) {
      setError('Por favor ingresa tu teléfono');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Usamos el teléfono como email para compatibilidad con Supabase Auth
      const email = `${formData.phone.trim()}@disneypixar.local`;

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Teléfono o contraseña incorrectos');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        navigate('/perfil');
      } else {
        setError('No se pudo iniciar sesión. Intenta de nuevo.');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
      setLoading(false);
    }
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
        {/* Header */}
        <header className="w-full max-w-lg mx-auto text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.15em] uppercase" style={{ color: '#FFC107' }}>
              Iniciar Sesión
            </span>
            <Sparkles size={14} style={{ color: '#FFC107' }} />
          </div>

          <h1
            className="font-black leading-tight mb-3"
            style={{
              fontSize: 'clamp(2rem, 8vw, 2.8rem)',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(255,193,7,0.4))',
            }}
          >
            Bienvenido
          </h1>

          <p className="text-sm" style={{ color: '#888888' }}>
            Accede a tu cuenta de Disney & Pixar
          </p>
        </header>

        {/* Form Container */}
        <div
          className="w-full max-w-lg mx-auto rounded-3xl p-6"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,193,7,0.15)',
            boxShadow: '0 0 30px rgba(255,193,7,0.08)',
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: '#FFC107' }}>
                Número de Teléfono
              </label>
              <div className="flex gap-2">
                <div
                  className="px-4 py-3 rounded-xl text-sm font-bold flex items-center"
                  style={{
                    background: '#0F0F0F',
                    border: '1px solid rgba(255,193,7,0.2)',
                    color: '#FFC107',
                  }}
                >
                  +57
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="3001234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none"
                  style={{
                    background: '#0F0F0F',
                    border: '1px solid rgba(255,193,7,0.2)',
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.6)';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 16px rgba(255,193,7,0.15)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.2)';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: '#FFC107' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none"
                  style={{
                    background: '#0F0F0F',
                    border: '1px solid rgba(255,193,7,0.2)',
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.6)';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 16px rgba(255,193,7,0.15)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = 'rgba(255,193,7,0.2)';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  style={{ color: '#888888' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="p-3 rounded-xl text-xs text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-extrabold text-base tracking-wide transition-all duration-300 active:scale-95 mt-4"
              style={{
                background: '#FFC107',
                color: '#000000',
                boxShadow: '0 4px 24px rgba(255,193,7,0.35)',
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 36px rgba(255,193,7,0.6)';
                  (e.currentTarget as HTMLButtonElement).style.background = '#FFD700';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(255,193,7,0.35)';
                  (e.currentTarget as HTMLButtonElement).style.background = '#FFC107';
                }
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

          </form>

          {/* Footer Text */}
          <p className="text-xs text-center mt-6" style={{ color: '#888888' }}>
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-bold transition-colors"
              style={{ color: '#FFC107' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Crea una cuenta
            </Link>
          </p>
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
