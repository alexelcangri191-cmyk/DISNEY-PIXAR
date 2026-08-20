import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CircleDollarSign, Sparkles, Table2, Users, Gift, ClipboardList } from 'lucide-react';
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

interface FilaRegla {
  jerarquia: string;
  deposito: string;
  tareas: string;
  porTarea: string;
  diario: string;
  treintaDias: string;
  trescientosSesentaDias: string;
  esGratis?: boolean;
}

const FILAS: FilaRegla[] = [
  {
    jerarquia: 'Intern',
    deposito: '0',
    tareas: '5',
    porTarea: '1.000',
    diario: '5.000',
    treintaDias: '0',
    trescientosSesentaDias: '0',
    esGratis: true,
  },
  {
    jerarquia: 'J1',
    deposito: '150.000',
    tareas: '5',
    porTarea: '1.200',
    diario: '6.000',
    treintaDias: '180.000',
    trescientosSesentaDias: '2.160.000',
  },
  {
    jerarquia: 'J2',
    deposito: '480.000',
    tareas: '10',
    porTarea: '1.600',
    diario: '16.000',
    treintaDias: '480.000',
    trescientosSesentaDias: '5.760.000',
  },
  {
    jerarquia: 'J3',
    deposito: '1.300.000',
    tareas: '15',
    porTarea: '2.800',
    diario: '42.000',
    treintaDias: '1.260.000',
    trescientosSesentaDias: '15.120.000',
  },
  {
    jerarquia: 'J4',
    deposito: '4.700.000',
    tareas: '30',
    porTarea: '5.600',
    diario: '168.000',
    treintaDias: '5.040.000',
    trescientosSesentaDias: '60.480.000',
  },
  {
    jerarquia: 'J5',
    deposito: '12.800.000',
    tareas: '50',
    porTarea: '9.200',
    diario: '460.000',
    treintaDias: '13.800.000',
    trescientosSesentaDias: '165.600.000',
  },
  {
    jerarquia: 'J6',
    deposito: '31.000.000',
    tareas: '80',
    porTarea: '14.000',
    diario: '1.120.000',
    treintaDias: '33.600.000',
    trescientosSesentaDias: '403.200.000',
  },
  {
    jerarquia: 'J7',
    deposito: '67.200.000',
    tareas: '150',
    porTarea: '16.000',
    diario: '2.400.000',
    treintaDias: '72.000.000',
    trescientosSesentaDias: '864.000.000',
  },
  {
    jerarquia: 'J8',
    deposito: '135.000.000',
    tareas: '250',
    porTarea: '20.000',
    diario: '5.000.000',
    treintaDias: '150.000.000',
    trescientosSesentaDias: '1.800.000.000',
  },
  {
    jerarquia: 'J9',
    deposito: '325.000.000',
    tareas: '500',
    porTarea: '25.000',
    diario: '12.500.000',
    treintaDias: '375.000.000',
    trescientosSesentaDias: '4.500.000.000',
  },
];

const COLUMNAS = [
  { key: 'jerarquia', label: 'Jerarquía' },
  { key: 'deposito', label: 'Depósito' },
  { key: 'tareas', label: 'Tareas' },
  { key: 'porTarea', label: 'Por tarea' },
  { key: 'diario', label: 'Diario' },
  { key: 'treintaDias', label: '30 días' },
  { key: 'trescientosSesentaDias', label: '360 días' },
];

interface FilaComision {
  jerarquia: string;
  incentivos: string;
  primerNivel: string;
  segundoNivel: string;
  tercerNivel: string;
}

const FILAS_COMISION: FilaComision[] = [
  { jerarquia: 'J1', incentivos: '6%-4%-2%', primerNivel: '9.000', segundoNivel: '6.000', tercerNivel: '3.000' },
  { jerarquia: 'J2', incentivos: '9%-4%-2%', primerNivel: '43.200', segundoNivel: '19.200', tercerNivel: '9.600' },
  { jerarquia: 'J3', incentivos: '12%-4%-2%', primerNivel: '156.000', segundoNivel: '52.000', tercerNivel: '26.000' },
  { jerarquia: 'J4', incentivos: '12%-4%-2%', primerNivel: '564.000', segundoNivel: '188.000', tercerNivel: '94.000' },
  { jerarquia: 'J5', incentivos: '12%-4%-2%', primerNivel: '1.536.000', segundoNivel: '512.000', tercerNivel: '256.000' },
  { jerarquia: 'J6', incentivos: '12%-4%-2%', primerNivel: '3.720.000', segundoNivel: '1.240.000', tercerNivel: '620.000' },
  { jerarquia: 'J7', incentivos: '12%-4%-2%', primerNivel: '8.064.000', segundoNivel: '2.688.000', tercerNivel: '1.344.000' },
  { jerarquia: 'J8', incentivos: '12%-4%-2%', primerNivel: '16.200.000', segundoNivel: '5.400.000', tercerNivel: '2.700.000' },
  { jerarquia: 'J9', incentivos: '12%-4%-2%', primerNivel: '39.000.000', segundoNivel: '13.000.000', tercerNivel: '6.500.000' },
];

const COLUMNAS_COMISION = [
  { key: 'jerarquia', label: 'Jerarquía' },
  { key: 'incentivos', label: 'Incentivos' },
  { key: 'primerNivel', label: '1er nivel' },
  { key: 'segundoNivel', label: '2do nivel' },
  { key: 'tercerNivel', label: '3er nivel' },
];

interface FilaRecompensa {
  plan: string;
  comision: string;
  nivelA: string;
  nivelB: string;
  nivelC: string;
}

const FILAS_RECOMPENSA: FilaRecompensa[] = [
  { plan: 'J1', comision: '4%-2%-1%', nivelA: '$240', nivelB: '$120', nivelC: '$60' },
  { plan: 'J2', comision: '4%-2%-1%', nivelA: '$640', nivelB: '$320', nivelC: '$160' },
  { plan: 'J3', comision: '4%-2%-1%', nivelA: '$1.680', nivelB: '$840', nivelC: '$420' },
  { plan: 'J4', comision: '4%-2%-1%', nivelA: '$6.720', nivelB: '$3.360', nivelC: '$1.680' },
  { plan: 'J5', comision: '4%-2%-1%', nivelA: '$18.400', nivelB: '$9.200', nivelC: '$4.600' },
  { plan: 'J6', comision: '4%-2%-1%', nivelA: '$44.800', nivelB: '$22.400', nivelC: '$11.200' },
  { plan: 'J7', comision: '4%-2%-1%', nivelA: '$96.000', nivelB: '$48.000', nivelC: '$24.000' },
  { plan: 'J8', comision: '4%-2%-1%', nivelA: '$200.000', nivelB: '$100.000', nivelC: '$50.000' },
  { plan: 'J9', comision: '4%-2%-1%', nivelA: '$500.000', nivelB: '$250.000', nivelC: '$125.000' },
];

const COLUMNAS_RECOMPENSA = [
  { key: 'plan', label: 'Plan' },
  { key: 'comision', label: '% Comisión' },
  { key: 'nivelA', label: 'Nivel A' },
  { key: 'nivelB', label: 'Nivel B' },
  { key: 'nivelC', label: 'Nivel C' },
];

export default function FormasDeGanar() {
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

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8 pb-24">
        <div className="w-full max-w-lg flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-2 transition-opacity hover:opacity-70 active:scale-95"
            style={{ color: '#FFC107' }}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Regresar al Perfil</span>
          </button>
        </div>

        <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={14} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.25em] uppercase" style={{ color: '#FFC107' }}>
              Formas de Ganar
            </span>
            <Sparkles size={14} style={{ color: '#FFC107' }} />
          </div>

          <h1
            className="font-black leading-tight mb-3"
            style={{
              fontSize: 'clamp(1.6rem, 7vw, 2.2rem)',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 16px rgba(255,193,7,0.35))',
            }}
          >
            Formas de Ganar Dinero
          </h1>

          <div
            className="w-20 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #FFC107, transparent)' }}
          />
        </div>

        {/* Encabezado del módulo */}
        <div className="w-full max-w-lg mx-auto mb-5">
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 30px rgba(255,193,7,0.1)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255,193,7,0.12)',
                border: '1px solid rgba(255,193,7,0.3)',
              }}
            >
              <Table2 size={20} style={{ color: '#FFC107' }} />
            </div>
            <h2
              className="text-sm font-black tracking-wide text-center flex-1"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Tabla de reglas de ingresos por inversiones
            </h2>
          </div>
        </div>

        {/* Tabla */}
        <div className="w-full max-w-lg mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.25)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '680px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,193,7,0.06)' }}>
                    {COLUMNAS.map((col, i) => (
                      <th
                        key={col.key}
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: '#FFC107',
                          borderBottom: '1px solid rgba(255,193,7,0.25)',
                          borderRight:
                            i < COLUMNAS.length - 1
                              ? '1px solid rgba(255,193,7,0.1)'
                              : 'none',
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FILAS.map((fila, idx) => (
                    <tr
                      key={fila.jerarquia}
                      className="transition-colors duration-200"
                      style={{
                        background:
                          idx % 2 === 0
                            ? 'transparent'
                            : 'rgba(255,193,7,0.025)',
                        borderBottom:
                          idx < FILAS.length - 1
                            ? '1px solid rgba(255,193,7,0.08)'
                            : 'none',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          'rgba(255,193,7,0.07)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          idx % 2 === 0 ? 'transparent' : 'rgba(255,193,7,0.025)';
                      }}
                    >
                      {/* Jerarquía */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        <span
                          className="inline-block px-2.5 py-1 rounded-lg font-black text-xs"
                          style={
                            fila.esGratis
                              ? {
                                  background: 'rgba(34,197,94,0.12)',
                                  border: '1px solid rgba(34,197,94,0.4)',
                                  color: '#22C55E',
                                }
                              : {
                                  background: 'rgba(255,193,7,0.12)',
                                  border: '1px solid rgba(255,193,7,0.4)',
                                  color: '#FFC107',
                                }
                          }
                        >
                          {fila.jerarquia}
                        </span>
                      </td>
                      {/* Depósito */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: fila.esGratis ? '#22C55E' : '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        {fila.esGratis ? 'GRATIS' : `$${fila.deposito}`}
                      </td>
                      {/* Tareas */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#CCCCCC',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        {fila.tareas}
                      </td>
                      {/* Por tarea */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#CCCCCC',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        ${fila.porTarea}
                      </td>
                      {/* Diario */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#FFC107',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        ${fila.diario}
                      </td>
                      {/* 30 días */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#FFD700',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        ${fila.treintaDias}
                      </td>
                      {/* 360 días */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#FFD700',
                          fontWeight: 900,
                          fontSize: '0.8rem',
                          textShadow: '0 0 6px rgba(255,193,7,0.3)',
                        }}
                      >
                        ${fila.trescientosSesentaDias}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota inferior */}
          <div
            className="mt-4 rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: 'rgba(255,193,7,0.05)',
              border: '1px solid rgba(255,193,7,0.25)',
              boxShadow: '0 0 20px rgba(255,193,7,0.06)',
            }}
          >
            <CircleDollarSign size={18} style={{ color: '#FFC107', flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs leading-relaxed" style={{ color: '#AAAAAA' }}>
              <span className="font-black" style={{ color: '#FFC107' }}>Nota: </span>
              Los valores mostrados corresponden a las ganancias proyectadas según cada nivel de inversión.
              El nivel <span className="font-bold" style={{ color: '#22C55E' }}>Intern</span> es gratuito
              y no genera ingresos de 30 ni 360 días. Desliza horizontalmente para ver toda la tabla en
              pantallas pequeñas.
            </p>
          </div>
        </div>

        {/* ===== Bloque: Ganancia / Invitar inversores recompensar ===== */}
        <div className="w-full max-w-lg mx-auto mt-8">
          {/* Tarjeta / encabezado superior */}
          <div
            className="rounded-2xl overflow-hidden mb-5"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(255,193,7,0.12)',
                  border: '1px solid rgba(255,193,7,0.35)',
                  boxShadow: '0 0 24px rgba(255,193,7,0.2), inset 0 0 12px rgba(255,193,7,0.05)',
                }}
              >
                <Gift size={26} style={{ color: '#FFC107' }} />
              </div>

              <h3
                className="font-black text-2xl mb-2 leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 14px rgba(255,193,7,0.3))',
                }}
              >
                Ganancia
              </h3>

              <p
                className="text-sm font-extrabold mb-1.5 tracking-wide"
                style={{ color: '#FFC107' }}
              >
                Invitar a los inversores recompensar
              </p>

              <p className="text-xs" style={{ color: '#888888' }}>
                la tabla de comisiones
              </p>

              <div
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(255,193,7,0.06)',
                  border: '1px solid rgba(255,193,7,0.2)',
                }}
              >
                <Users size={14} style={{ color: '#FFC107' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FFC107' }}>
                  3 Niveles de Recompensa
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de comisiones */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.25)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,193,7,0.06)' }}>
                    {COLUMNAS_COMISION.map((col, i) => (
                      <th
                        key={col.key}
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: '#FFC107',
                          borderBottom: '1px solid rgba(255,193,7,0.25)',
                          borderRight:
                            i < COLUMNAS_COMISION.length - 1
                              ? '1px solid rgba(255,193,7,0.1)'
                              : 'none',
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FILAS_COMISION.map((fila, idx) => (
                    <tr
                      key={fila.jerarquia}
                      className="transition-colors duration-200"
                      style={{
                        background:
                          idx % 2 === 0
                            ? 'transparent'
                            : 'rgba(255,193,7,0.025)',
                        borderBottom:
                          idx < FILAS_COMISION.length - 1
                            ? '1px solid rgba(255,193,7,0.08)'
                            : 'none',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          'rgba(255,193,7,0.07)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          idx % 2 === 0 ? 'transparent' : 'rgba(255,193,7,0.025)';
                      }}
                    >
                      {/* Jerarquía */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{ borderRight: '1px solid rgba(255,193,7,0.1)' }}
                      >
                        <span
                          className="inline-block px-2.5 py-1 rounded-lg font-black text-xs"
                          style={{
                            background: 'rgba(255,193,7,0.12)',
                            border: '1px solid rgba(255,193,7,0.4)',
                            color: '#FFC107',
                          }}
                        >
                          {fila.jerarquia}
                        </span>
                      </td>
                      {/* Incentivos */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#FFC107',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        {fila.incentivos}
                      </td>
                      {/* 1er nivel */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#FFD700',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        ${fila.primerNivel}
                      </td>
                      {/* 2do nivel */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#CCCCCC',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        ${fila.segundoNivel}
                      </td>
                      {/* 3er nivel */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#888888',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        ${fila.tercerNivel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota comisiones */}
          <div
            className="mt-4 rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: 'rgba(255,193,7,0.05)',
              border: '1px solid rgba(255,193,7,0.25)',
              boxShadow: '0 0 20px rgba(255,193,7,0.06)',
            }}
          >
            <Users size={18} style={{ color: '#FFC107', flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs leading-relaxed" style={{ color: '#AAAAAA' }}>
              <span className="font-black" style={{ color: '#FFC107' }}>Recompensas: </span>
              Invita inversores y gana comisiones por 3 niveles. Los porcentajes de
              incentivos indican la comisión para el 1er, 2do y 3er nivel respectivamente.
              Desliza horizontalmente para ver toda la tabla en pantallas pequeñas.
            </p>
          </div>
        </div>

        {/* ===== Bloque: Recompensas por tareas de tu equipo ===== */}
        <div className="w-full max-w-lg mx-auto mt-8">
          {/* Tarjeta / encabezado superior */}
          <div
            className="rounded-2xl overflow-hidden mb-5"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(255,193,7,0.12)',
                  border: '1px solid rgba(255,193,7,0.35)',
                  boxShadow: '0 0 24px rgba(255,193,7,0.2), inset 0 0 12px rgba(255,193,7,0.05)',
                }}
              >
                <ClipboardList size={26} style={{ color: '#FFC107' }} />
              </div>

              <h3
                className="font-black text-lg mb-2 leading-tight tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 14px rgba(255,193,7,0.3))',
                }}
              >
                RECOMPENSAS POR TAREAS DE TU EQUIPO
              </h3>

              <div
                className="mt-1 flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(255,193,7,0.06)',
                  border: '1px solid rgba(255,193,7,0.2)',
                }}
              >
                <Users size={14} style={{ color: '#FFC107' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FFC107' }}>
                  Niveles A · B · C
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de recompensas */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.25)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,193,7,0.06)' }}>
                    {COLUMNAS_RECOMPENSA.map((col, i) => (
                      <th
                        key={col.key}
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: '#FFC107',
                          borderBottom: '1px solid rgba(255,193,7,0.25)',
                          borderRight:
                            i < COLUMNAS_RECOMPENSA.length - 1
                              ? '1px solid rgba(255,193,7,0.1)'
                              : 'none',
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FILAS_RECOMPENSA.map((fila, idx) => (
                    <tr
                      key={fila.plan}
                      className="transition-colors duration-200"
                      style={{
                        background:
                          idx % 2 === 0
                            ? 'transparent'
                            : 'rgba(255,193,7,0.025)',
                        borderBottom:
                          idx < FILAS_RECOMPENSA.length - 1
                            ? '1px solid rgba(255,193,7,0.08)'
                            : 'none',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          'rgba(255,193,7,0.07)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          idx % 2 === 0 ? 'transparent' : 'rgba(255,193,7,0.025)';
                      }}
                    >
                      {/* Plan */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{ borderRight: '1px solid rgba(255,193,7,0.1)' }}
                      >
                        <span
                          className="inline-block px-2.5 py-1 rounded-lg font-black text-xs"
                          style={{
                            background: 'rgba(255,193,7,0.12)',
                            border: '1px solid rgba(255,193,7,0.4)',
                            color: '#FFC107',
                          }}
                        >
                          {fila.plan}
                        </span>
                      </td>
                      {/* % Comisión */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#FFC107',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        {fila.comision}
                      </td>
                      {/* Nivel A */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#FFD700',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        {fila.nivelA}
                      </td>
                      {/* Nivel B */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#CCCCCC',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRight: '1px solid rgba(255,193,7,0.1)',
                        }}
                      >
                        {fila.nivelB}
                      </td>
                      {/* Nivel C */}
                      <td
                        className="px-3 py-3.5 text-center whitespace-nowrap"
                        style={{
                          color: '#888888',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {fila.nivelC}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota recompensas */}
          <div
            className="mt-4 rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: 'rgba(255,193,7,0.05)',
              border: '1px solid rgba(255,193,7,0.25)',
              boxShadow: '0 0 20px rgba(255,193,7,0.06)',
            }}
          >
            <ClipboardList size={18} style={{ color: '#FFC107', flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs leading-relaxed" style={{ color: '#AAAAAA' }}>
              <span className="font-black" style={{ color: '#FFC107' }}>Tareas de equipo: </span>
              Recibe recompensas por las tareas completadas por los miembros de tu equipo
              en los niveles A, B y C. Los porcentajes indican la comisión aplicada
              para cada nivel respectivamente. Desliza horizontalmente para ver toda la
              tabla en pantallas pequeñas.
            </p>
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
