import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Target,
  Eye,
  Star,
  CheckCircle2,
  ChevronRight,
  Film,
  TrendingUp,
  Users,
  Rocket,
} from 'lucide-react';
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

export default function SobreNosotros() {
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

  const elegirNos = [
    'Plataforma segura y confiable',
    'Comisiones competitivas y transparentes',
    'Soporte dedicado 24/7',
    'Herramientas y recursos para el éxito',
    'Comunidad activa y solidaria',
  ];

  const logros = [
    'Mejoras de hasta un 28% en la tasa de conversión de visualizaciones de trailers a reproducciones de películas.',
    'Optimización de procesos que reduce tiempos de calificación en un 40%.',
    'Integración fluida con sistemas de gestión de contenido de empresas líderes del sector.',
  ];

  const oportunidades = [
    {
      bold: 'Ingresos competitivos:',
      text: ' Remuneraciones por encima del promedio del sector audiovisual colombiano, con escalas salariales que reconocen la experiencia y el desempeño.',
    },
    {
      bold: 'Capacitación especializada:',
      text: ' Programas de formación en metodologías de calificación Disney y herramientas tecnológicas propias de nuestra plataforma audiovisual, certificados internacionalmente.',
    },
    {
      bold: 'Oportunidades de crecimiento:',
      text: ' Vías claras de promoción hacia roles de coordinación y liderazgo, con proyección a proyectos internacionales.',
    },
    {
      bold: 'Trabajo flexible:',
      text: ' Adaptado a las necesidades del personal, con opciones de modalidad híbrida que combinan trabajo remoto y ayuda a tus ingresos mensuales como teletrabajo.',
    },
  ];

  const impactos = [
    'Transferencia de conocimientos y tecnologías de vanguardia.',
    'Creación de sinergias con empresas locales de postproducción y marketing cinematográfico.',
    'Impulso a la cultura del análisis de datos aplicado al contenido audiovisual en Colombia.',
  ];

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

        <div className="flex items-center gap-2 mb-8">
          <Sparkles size={14} style={{ color: '#FFC107' }} />
          <span
            className="text-xs font-extrabold tracking-[0.25em] uppercase"
            style={{ color: '#FFC107' }}
          >
            Sobre Nosotros
          </span>
          <Sparkles size={14} style={{ color: '#FFC107' }} />
        </div>

        {/* ===== BLOQUE 1: Misión, Visión y Elegirnos ===== */}
        <div className="w-full max-w-lg">
          {/* Sección 1: Nuestra Misión */}
          <SectionCard icon={<Target size={16} />} title="Nuestra Misión">
            <p className="text-sm" style={{ color: '#AAAAAA', lineHeight: '1.75' }}>
              Somos una comunidad dedicada a crear oportunidades de emprendimiento y crecimiento
              financiero. Nuestro objetivo es empoderar a cada miembro para alcanzar sus metas
              económicas a través de sistemas innovadores y sostenibles.
            </p>
          </SectionCard>

          {/* Sección 2: Nuestra Visión */}
          <SectionCard icon={<Eye size={16} />} title="Nuestra Visión">
            <p className="text-sm" style={{ color: '#AAAAAA', lineHeight: '1.75' }}>
              Crear un ecosistema global donde los emprendedores puedan colaborar, crecer y
              prosperar juntos. Creemos en la transparencia, la confianza y el éxito mutuo como
              pilares fundamentales de nuestro proyecto.
            </p>
          </SectionCard>

          {/* Sección 3: ¿Por Qué Elegirnos? */}
          <SectionCard icon={<Star size={16} />} title="¿Por Qué Elegirnos?">
            <ul className="flex flex-col gap-3">
              {elegirNos.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    style={{ color: '#22C55E', flexShrink: 0, marginTop: '2px' }}
                  />
                  <span className="text-sm" style={{ color: '#CCCCCC', lineHeight: '1.6' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* ===== BLOQUE 2: Disney y Pixar Sistema ===== */}
        <div className="w-full max-w-lg mt-2">
          {/* Sección 4: Disney x Pixar */}
          <SectionCard icon={<Film size={16} />} title="Disney x Pixar">
            <h3
              className="text-sm font-bold mb-3 tracking-wide"
              style={{ color: '#FFC107' }}
            >
              Entrando al Mercado Colombiano
            </h3>
            <p className="text-sm" style={{ color: '#AAAAAA', lineHeight: '1.75' }}>
              Disney y Pixar es una empresa especializada en sistemas de evaluación y calificación
              de contenido audiovisual, con experiencia probada en plataformas de streaming
              internacionales. Hoy, anunciamos nuestra llegada al mercado colombiano con un
              proyecto estratégico en alianza con The Walt Disney Company, enfocado en el análisis
              y calificación de trailers cinematográficos, con el objetivo claro de impulsar los
              ingresos del talento local y fortalecer la industria audiovisual nacional.
            </p>
          </SectionCard>

          {/* Sección 5: Nuestro Sistema y Experiencia Previa */}
          <SectionCard icon={<TrendingUp size={16} />} title="Nuestro Sistema y Experiencia Previa">
            <p className="text-sm mb-4" style={{ color: '#AAAAAA', lineHeight: '1.75' }}>
              Nuestro sistema de calificación de trailers se basa en algoritmos avanzados
              combinados con evaluación humana especializada, diseñado para optimizar el impacto
              de contenido promocional en audiencias específicas. Durante los últimos 3 años,
              hemos implementado esta solución en plataformas de streaming de renombre en América
              del Norte y Europa, logrando:
            </p>
            <ul className="flex flex-col gap-3">
              {logros.map((logro, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Star
                    size={18}
                    style={{ color: '#FFC107', flexShrink: 0, marginTop: '2px', fill: '#FFC107' }}
                  />
                  <span className="text-sm" style={{ color: '#CCCCCC', lineHeight: '1.6' }}>
                    {logro}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* ===== BLOQUE 3: Oportunidad e Impacto en Colombia ===== */}
        <div className="w-full max-w-lg mt-2">
          {/* Sección 6: Oportunidad para el Personal Colombiano */}
          <SectionCard icon={<Users size={16} />} title="Oportunidad para el Personal Colombiano">
            <h3
              className="text-sm font-bold mb-4"
              style={{ color: '#FFC107', lineHeight: '1.6' }}
            >
              La entrada al mercado colombiano tiene como pilar central el desarrollo del talento
              local. Nuestro modelo propone:
            </h3>
            <ul className="flex flex-col gap-3">
              {oportunidades.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    style={{ color: '#22C55E', flexShrink: 0, marginTop: '2px' }}
                  />
                  <span className="text-sm" style={{ color: '#CCCCCC', lineHeight: '1.6' }}>
                    <span className="font-bold" style={{ color: '#FFC107' }}>
                      {item.bold}
                    </span>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Sección 7: Impacto en el Mercado Colombiano */}
          <SectionCard icon={<TrendingUp size={16} />} title="Impacto en el Mercado Colombiano">
            <h3
              className="text-sm font-bold mb-4"
              style={{ color: '#FFC107', lineHeight: '1.6' }}
            >
              Este proyecto no solo beneficiará directamente al personal contratado, sino que
              también contribuirá al fortalecimiento de la industria audiovisual nacional:
            </h3>
            <ul className="flex flex-col gap-3">
              {impactos.map((impacto, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ChevronRight
                    size={18}
                    style={{ color: '#FFC107', flexShrink: 0, marginTop: '2px' }}
                  />
                  <span className="text-sm" style={{ color: '#CCCCCC', lineHeight: '1.6' }}>
                    {impacto}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* ===== BLOQUE 4: Próximos Pasos ===== */}
        <div className="w-full max-w-lg mt-2">
          {/* Sección 8: Próximos Pasos */}
          <SectionCard icon={<Rocket size={16} />} title="Próximos Pasos">
            <p className="text-sm" style={{ color: '#AAAAAA', lineHeight: '1.75' }}>
              En los próximos meses fortaleceremos el rendimiento económico. Durante el año 2026 y
              2027 nos consolidamos como tu mejor aliado económico. Juntos lograremos mejores
              oportunidades de ingresos diarios y un crecimiento sostenible para toda nuestra
              comunidad.
            </p>
          </SectionCard>
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
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl mb-4 transition-all duration-300"
      style={{
        background: '#1A1A1A',
        border: `1px solid ${hovered ? 'rgba(255,193,7,0.45)' : 'rgba(255,193,7,0.2)'}`,
        boxShadow: hovered
          ? '0 0 24px rgba(255,193,7,0.18), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 0 16px rgba(255,193,7,0.06), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="px-5 py-4 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,193,7,0.15)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,193,7,0.1)' }}
        >
          <span style={{ color: '#FFC107' }}>{icon}</span>
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
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
