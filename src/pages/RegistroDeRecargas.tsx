import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpFromLine, Plus, Loader2 } from 'lucide-react';
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

interface Recarga {
  id: string;
  user_id: string;
  monto: number;
  status: string;
  created_at: string;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function RegistroDeRecargas() {
  const navigate = useNavigate();
  const [particles] = useState(() => generateParticles(60));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldoPersonal, setSaldoPersonal] = useState(0);

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
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [recargasRes, progressRes] = await Promise.all([
        supabase
          .from('recargas')
          .select('id, user_id, monto, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_progress')
          .select('saldo_personal')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (recargasRes.data) {
        setRecargas(recargasRes.data as Recarga[]);
      }
      if (progressRes.data) {
        setSaldoPersonal(Number((progressRes.data as { saldo_personal: number }).saldo_personal) || 0);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Realtime: listen for changes to recargas and user_progress
  useEffect(() => {
    const channel = supabase
      .channel('recargas-and-wallet-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recargas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as Recarga;
            setRecargas((prev) => {
              if (prev.some((r) => r.id === newRow.id)) return prev;
              return [newRow, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as Recarga;
            setRecargas((prev) =>
              prev.map((r) => (r.id === updatedRow.id ? updatedRow : r))
            );
            // When status changes, the trigger updates saldo_personal;
            // refresh the wallet from the DB to stay in sync.
            refreshWallet();
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id: string };
            setRecargas((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_progress' },
        (payload) => {
          const newProgress = payload.new as { saldo_personal: number };
          setSaldoPersonal(Number(newProgress.saldo_personal) || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function refreshWallet() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('user_progress')
      .select('saldo_personal')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setSaldoPersonal(Number((data as { saldo_personal: number }).saldo_personal) || 0);
    }
  }

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
        {/* Header with back button */}
        <div className="w-full max-w-lg flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 active:scale-90"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              color: '#888888',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,193,7,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#FFC107';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,193,7,0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = '#888888';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="font-black text-xl tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Registro de Recargas
          </h1>
        </div>

        {/* Personal Wallet Summary */}
        <div className="w-full max-w-lg mb-5">
          <div
            className="rounded-2xl px-5 py-4 flex items-center justify-between"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              boxShadow: '0 0 16px rgba(255,193,7,0.06), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#888888' }}
              >
                Billetera Personal
              </span>
            </div>
            <p className="text-xl font-black" style={{ color: '#FFC107' }}>
              {formatMoney(saldoPersonal)}
            </p>
          </div>
        </div>

        {/* Registro de recarga container */}
        <div className="w-full max-w-lg">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Container Header */}
            <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,193,7,0.15)' }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255,193,7,0.1)',
                  border: '1px solid rgba(255,193,7,0.4)',
                  boxShadow: '0 0 16px rgba(255,193,7,0.2)',
                }}
              >
                <ArrowUpFromLine size={18} style={{ color: '#FFC107' }} />
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
                Registro de recarga
              </h2>
            </div>

            {/* List of recharges */}
            <div className="p-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin" style={{ color: '#FFC107' }} />
                </div>
              ) : recargas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <p className="text-sm" style={{ color: '#888888' }}>
                    No tienes recargas registradas todavía.
                  </p>
                </div>
              ) : (
                recargas.map((recarga, index) => {
                  const isExitoso = recarga.status.toLowerCase() === 'exitoso';
                  const shortId = `#${recarga.id.slice(-3).toUpperCase()}`;
                  return (
                    <div
                      key={recarga.id}
                      className="flex items-center justify-between px-3 py-4"
                      style={{
                        borderBottom:
                          index < recargas.length - 1
                            ? '1px solid rgba(255,193,7,0.1)'
                            : 'none',
                      }}
                    >
                      {/* Left side: + icon, code, date */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,193,7,0.1)' }}
                        >
                          <Plus size={16} style={{ color: '#FFC107' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {shortId}
                          </p>
                          <p className="text-xs" style={{ color: '#888888' }}>
                            {formatDateTime(recarga.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Right side: amount + status */}
                      <div className="flex flex-col items-end flex-shrink-0">
                        <p
                          className="text-sm font-black"
                          style={{ color: '#FFC107' }}
                        >
                          {formatMoney(Number(recarga.monto) || 0)}
                        </p>
                        {isExitoso ? (
                          <span
                            className="text-xs font-bold mt-0.5"
                            style={{ color: '#22C55E' }}
                          >
                            Recarga completada
                          </span>
                        ) : (
                          <span
                            className="text-xs font-bold mt-0.5"
                            style={{ color: '#F59E0B' }}
                          >
                            Recarga pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
