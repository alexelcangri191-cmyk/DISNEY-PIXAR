import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Crown, Wallet, Coins, Sparkles, TrendingUp, Calendar, CalendarDays, CalendarClock, DollarSign, Users, UserPlus, ChevronRight, ArrowDownToLine, ArrowUpFromLine, BarChart3, Receipt, CreditCard, Info, BadgeInfo, CircleDollarSign, LogOut } from 'lucide-react';
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

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function Perfil() {
  const navigate = useNavigate();
  const [particles] = useState(() => generateParticles(60));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [telefonoUsuario, setTelefonoUsuario] = useState('+57 3000000000');
  const [nivelUsuario, setNivelUsuario] = useState('PASANTÍA');
  const [fechaIngreso, setFechaIngreso] = useState(() => formatDate(new Date()));
  const [saldoPersonal, setSaldoPersonal] = useState(0);
  const [saldoIngresos, setSaldoIngresos] = useState(0);

  const [gananciasAyer, setGananciasAyer] = useState(0);
  const [gananciasHoy, setGananciasHoy] = useState(0);
  const [gananciasSemana, setGananciasSemana] = useState(0);
  const [gananciasMes, setGananciasMes] = useState(0);
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [tareasEquipo, setTareasEquipo] = useState(0);
  const [ingresosRecomendacion, setIngresosRecomendacion] = useState(0);

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
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('phone, level, created_at')
        .eq('id', user.id)
        .single();

      if (data) {
        setTelefonoUsuario(`+57 ${data.phone}`);
        setNivelUsuario(data.level || 'PASANTÍA');
        if (data.created_at) {
          setFechaIngreso(formatDate(new Date(data.created_at)));
        }
      }
    }
    fetchProfile();
  }, []);

  const fechaFin = (() => {
    const start = new Date(fechaIngreso);
    start.setFullYear(start.getFullYear() + 1);
    return formatDate(start);
  })();

  const formatMoney = (amount: number) =>
    `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} COP`;

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

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={14} style={{ color: '#FFC107' }} />
          <span
            className="text-xs font-extrabold tracking-[0.25em] uppercase"
            style={{ color: '#FFC107' }}
          >
            Mi Perfil
          </span>
          <Sparkles size={14} style={{ color: '#FFC107' }} />
        </div>

        {/* Queen Card */}
        <div
          className="w-full max-w-lg rounded-3xl overflow-hidden"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,193,7,0.3)',
            boxShadow: '0 0 40px rgba(255,193,7,0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* Top Section: User Info */}
          <div className="p-5 pb-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,193,7,0.1)',
                  border: '2px solid rgba(255,193,7,0.5)',
                  boxShadow: '0 0 24px rgba(255,193,7,0.3), inset 0 0 12px rgba(255,193,7,0.1)',
                }}
              >
                <User size={28} style={{ color: '#FFC107' }} />
              </div>

              {/* Profile Data */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate">
                  {telefonoUsuario}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Crown size={14} style={{ color: '#FFC107' }} />
                  <span
                    className="text-sm font-extrabold tracking-wide"
                    style={{ color: '#FFC107' }}
                  >
                    {nivelUsuario}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-xs" style={{ color: '#888888' }}>Fecha válida:</span>
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,193,7,0.7)' }}>
                    {fechaIngreso} ~ {fechaFin}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className="flex-shrink-0 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.4)',
                }}
              >
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>
                  VIGENTE
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="mx-5 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,193,7,0.3), transparent)' }}
          />

          {/* Bottom Section: Wallets */}
          <div className="flex">
            {/* Personal Wallet */}
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <Wallet size={16} style={{ color: '#FFC107' }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                  Billetera Personal
                </span>
              </div>
              <p className="text-xl font-black text-white">
                {formatMoney(saldoPersonal)}
              </p>
            </div>

            {/* Vertical Divider */}
            <div
              className="w-px my-4"
              style={{ background: 'rgba(255,193,7,0.15)' }}
            />

            {/* Income Wallet */}
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,193,7,0.1)' }}
                >
                  <Coins size={16} style={{ color: '#FFC107' }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                  Billetera de Ingresos
                </span>
              </div>
              <p
                className="text-xl font-black"
                style={{ color: '#FFC107' }}
              >
                {formatMoney(saldoIngresos)}
              </p>
            </div>
          </div>
        </div>

        {/* Earnings Statistics */}
        <div className="w-full max-w-lg mt-5">
          <div className="flex items-center gap-2 mb-4 px-1">
            <TrendingUp size={14} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Estadísticas de Ganancias
            </span>
          </div>

          {/* Row 1: Yesterday & Today */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard
              icon={<Calendar size={14} />}
              title="Ganancias de Ayer"
              value={formatMoney(gananciasAyer)}
            />
            <StatCard
              icon={<CalendarDays size={14} />}
              title="Ganancias de Hoy"
              value={formatMoney(gananciasHoy)}
            />
          </div>

          {/* Row 2: Month & Week */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard
              icon={<CalendarClock size={14} />}
              title="Ganancias Este Mes"
              value={formatMoney(gananciasMes)}
            />
            <StatCard
              icon={<Calendar size={14} />}
              title="Ganancias Esta Semana"
              value={formatMoney(gananciasSemana)}
            />
          </div>

          {/* Row 3: Total, Team, Referral */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<DollarSign size={14} />}
              title="Ingresos Totales"
              value={formatMoney(ingresosTotales)}
              compact
            />
            <StatCard
              icon={<Users size={14} />}
              title="Delegación Tareas en Equipo"
              value={formatMoney(tareasEquipo)}
              compact
            />
            <StatCard
              icon={<UserPlus size={14} />}
              title="Ingresos por Recomendación"
              value={formatMoney(ingresosRecomendacion)}
              compact
            />
          </div>
        </div>

        {/* Menu Options */}
        <div className="w-full max-w-lg mt-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span
              className="text-xs font-extrabold tracking-[0.25em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Menú
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <MenuOption
              icon={<ArrowDownToLine size={20} />}
              label="Recargar"
              onClick={() => navigate('/recargar')}
            />
            <MenuOption
              icon={<ArrowUpFromLine size={20} />}
              label="Retiros"
              onClick={() => navigate('/retiros')}
            />
            <MenuOption
              icon={<BarChart3 size={20} />}
              label="Registro de Recarga"
              onClick={() => navigate('/historial-recargas')}
            />
            <MenuOption
              icon={<Receipt size={20} />}
              label="Registro de Retiros"
              onClick={() => navigate('/historial-retiros')}
            />
            <MenuOption
              icon={<CreditCard size={20} />}
              label="Cuenta Bancaria"
              onClick={() => navigate('/cuenta-bancaria')}
            />
            <MenuOption
              icon={<Users size={20} />}
              label="Mi Equipo"
              onClick={() => navigate('/mi-equipo')}
            />
            <MenuOption
              icon={<Info size={20} />}
              label="Sobre Nosotros"
              onClick={() => navigate('/sobre-nosotros')}
            />
            <MenuOption
              icon={<BadgeInfo size={20} />}
              label="Información Personal"
              onClick={() => navigate('/informacion-personal')}
            />
            <MenuOption
              icon={<CircleDollarSign size={20} />}
              label="Formas de Ganar Dinero"
              onClick={() => navigate('/formas-de-ganar')}
            />
            <MenuOption
              icon={<LogOut size={20} />}
              label="Cerrar Sesión"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
            />
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

function StatCard({
  icon,
  title,
  value,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl transition-all duration-300"
      style={{
        background: '#1A1A1A',
        border: `1px solid ${hovered ? 'rgba(255,193,7,0.45)' : 'rgba(255,193,7,0.2)'}`,
        boxShadow: hovered
          ? '0 0 24px rgba(255,193,7,0.18), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 0 16px rgba(255,193,7,0.06), inset 0 1px 0 rgba(255,255,255,0.02)',
        padding: compact ? '14px 10px' : '18px 14px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div style={{ color: '#FFC107' }}>{icon}</div>
        <span
          className="font-bold uppercase tracking-wider leading-tight"
          style={{
            color: '#888888',
            fontSize: compact ? '0.55rem' : '0.65rem',
          }}
        >
          {title}
        </span>
      </div>
      <p
        className="font-black"
        style={{
          color: '#FFC107',
          fontSize: compact ? '0.95rem' : '1.2rem',
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function MenuOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-xl transition-all duration-300 active:scale-[0.98]"
      style={{
        background: hovered ? 'rgba(255,193,7,0.08)' : '#1A1A1A',
        border: `1px solid ${hovered ? 'rgba(255,193,7,0.4)' : 'rgba(255,193,7,0.15)'}`,
        boxShadow: hovered
          ? '0 0 20px rgba(255,193,7,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 0 12px rgba(255,193,7,0.04), inset 0 1px 0 rgba(255,255,255,0.02)',
        padding: '16px 18px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,193,7,0.1)' }}
        >
          <span style={{ color: '#FFC107' }}>{icon}</span>
        </div>
        <span className="text-sm font-bold text-white">{label}</span>
      </div>
      <ChevronRight size={18} style={{ color: '#888888' }} />
    </button>
  );
}
