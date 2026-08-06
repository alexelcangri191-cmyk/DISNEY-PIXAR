import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Sparkles, Target, Eye, Star, CheckCircle2, ChevronRight, TrendingUp, Users, ArrowRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  titleColor?: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, subtitle, titleColor = '#FFC107', children }: SectionCardProps) {
  return (
    <div
      className="w-full max-w-lg mx-auto rounded-3xl overflow-hidden"
      style={{
        background: '#1A1A1A',
        border: '1px solid rgba(255,193,7,0.2)',
        boxShadow: '0 0 30px rgba(255,193,7,0.08), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <div className="flex">
        <div
          className="flex-shrink-0 w-1.5"
          style={{ background: 'linear-gradient(180deg, #FFD700, #FFC107, #B8860B)' }}
        />
        <div className="flex-1 p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,193,7,0.1)' }}
            >
              <span style={{ color: titleColor }}>{icon}</span>
            </div>
            <h2
              className="font-black text-lg tracking-wide leading-tight"
              style={{ color: titleColor }}
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <h3
              className="text-sm font-bold mb-3 leading-snug"
              style={{ color: '#FFFFFF' }}
            >
              {subtitle}
            </h3>
          )}
          <div style={{ color: '#AAAAAA' }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
      <p className="text-sm leading-relaxed" style={{ color: '#CCCCCC' }}>
        {children}
      </p>
    </li>
  );
}

function StarItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Star size={18} className="flex-shrink-0 mt-0.5 fill-current" style={{ color: '#FFC107' }} />
      <p className="text-sm leading-relaxed" style={{ color: '#CCCCCC' }}>
        {children}
      </p>
    </li>
  );
}

function ArrowItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <ChevronRight size={18} className="flex-shrink-0 mt-0.5 rotate-0" style={{ color: '#FFC107' }} />
      <p className="text-sm leading-relaxed" style={{ color: '#CCCCCC' }}>
        {children}
      </p>
    </li>
  );
}

function BlockHeader({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="w-full max-w-lg mx-auto flex items-center gap-2 mb-4 mt-8 px-1">
      <span style={{ color: '#FFC107' }}>{icon}</span>
      <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>
        {label}
      </span>
    </div>
  );
}

export default function SobreNosotros() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
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

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:opacity-70 active:scale-95"
            style={{
              background: 'rgba(255,193,7,0.1)',
              border: '1px solid rgba(255,193,7,0.3)',
              color: '#FFC107',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="text-lg font-black tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Sobre Nosotros
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          {/* BLOQUE 1: Nuestra Misión, Visión y Elegirnos */}
          <BlockHeader label="Nuestra Misión, Visión y Elegirnos" icon={<Sparkles size={14} />} />

          <SectionCard icon={<Target size={20} />} title="Nuestra Misión">
            <p className="text-sm leading-relaxed" style={{ lineHeight: '1.75' }}>
              Somos una comunidad dedicada a crear oportunidades de emprendimiento y crecimiento
              financiero. Nuestro objetivo es empoderar a cada miembro para alcanzar sus metas
              económicas a través de sistemas innovadores y sostenibles.
            </p>
          </SectionCard>

          <SectionCard icon={<Eye size={20} />} title="Nuestra Visión">
            <p className="text-sm leading-relaxed" style={{ lineHeight: '1.75' }}>
              Crear un ecosistema global donde los emprendedores puedan colaborar, crecer y
              prosperar juntos. Creemos en la transparencia, la confianza y el éxito mutuo como
              pilares fundamentales de nuestro proyecto.
            </p>
          </SectionCard>

          <SectionCard icon={<CheckCircle2 size={20} />} title="¿Por Qué Elegirnos?">
            <ul className="flex flex-col gap-3">
              <CheckItem>Plataforma segura y confiable</CheckItem>
              <CheckItem>Comisiones competitivas y transparentes</CheckItem>
              <CheckItem>Soporte dedicado 24/7</CheckItem>
              <CheckItem>Herramientas y recursos para el éxito</CheckItem>
              <CheckItem>Comunidad activa y solidaria</CheckItem>
            </ul>
          </SectionCard>

          {/* BLOQUE 2: Disney y Pixar Sistema */}
          <BlockHeader label="Disney y Pixar Sistema" icon={<Sparkles size={14} />} />

          <SectionCard
            icon={<Sparkles size={20} />}
            title="Disney x Pixar"
            subtitle="Entrando al Mercado Colombiano"
          >
            <p className="text-sm leading-relaxed" style={{ lineHeight: '1.75' }}>
              Disney y Pixar es una empresa especializada en sistemas de evaluación y calificación
              de contenido audiovisual, con experiencia probada en plataformas de streaming
              internacionales. Hoy, anunciamos nuestra llegada al mercado colombiano con un
              proyecto estratégico en alianza con The Walt Disney Company, enfocado en el análisis
              y calificación de trailers cinematográficos, con el objetivo claro de impulsar los
              ingresos del talento local y fortalecer la industria audiovisual nacional.
            </p>
          </SectionCard>

          <SectionCard icon={<TrendingUp size={20} />} title="Nuestro Sistema y Experiencia Previa">
            <p className="text-sm leading-relaxed mb-4" style={{ lineHeight: '1.75' }}>
              Nuestro sistema de calificación de trailers se basa en algoritmos avanzados
              combinados con evaluación humana especializada, diseñado para optimizar el impacto de
              contenido promocional en audiencias específicas. Durante los últimos 3 años, hemos
              implementado esta solución en plataformas de streaming de renombre en América del
              Norte y Europa, logrando:
            </p>
            <ul className="flex flex-col gap-3">
              <StarItem>
                Mejoras de hasta un 28% en la tasa de conversión de visualizaciones de trailers a
                reproducciones de películas.
              </StarItem>
              <StarItem>
                Optimización de procesos que reduce tiempos de calificación en un 40%.
              </StarItem>
              <StarItem>
                Integración fluida con sistemas de gestión de contenido de empresas líderes del
                sector.
              </StarItem>
            </ul>
          </SectionCard>

          {/* BLOQUE 3: Oportunidad e Impacto en Colombia */}
          <BlockHeader label="Oportunidad e Impacto en Colombia" icon={<Sparkles size={14} />} />

          <SectionCard
            icon={<Users size={20} />}
            title="Oportunidad para el Personal Colombiano"
            titleColor="#FFA500"
            subtitle="La entrada al mercado colombiano tiene como pilar central el desarrollo del talento local. Nuestro modelo propone:"
          >
            <ul className="flex flex-col gap-3">
              <CheckItem>
                <span className="font-bold" style={{ color: '#FFC107' }}>Ingresos competitivos:</span>{' '}
                Remuneraciones por encima del promedio del sector audiovisual colombiano, con
                escalas salariales que reconocen la experiencia y el desempeño.
              </CheckItem>
              <CheckItem>
                <span className="font-bold" style={{ color: '#FFC107' }}>Capacitación especializada:</span>{' '}
                Programas de formación en metodologías de calificación Disney y herramientas
                tecnológicas propias de nuestra plataforma audiovisual, certificados
                internacionalmente.
              </CheckItem>
              <CheckItem>
                <span className="font-bold" style={{ color: '#FFC107' }}>Oportunidades de crecimiento:</span>{' '}
                Vías claras de promoción hacia roles de coordinación y liderazgo, con proyección a
                proyectos internacionales.
              </CheckItem>
              <CheckItem>
                <span className="font-bold" style={{ color: '#FFC107' }}>Trabajo flexible:</span>{' '}
                Adaptado a las necesidades del personal, con opciones de modalidad híbrida que
                combinan trabajo remoto y ayuda a tus ingresos mensuales como teletrabajo.
              </CheckItem>
            </ul>
          </SectionCard>

          <SectionCard
            icon={<TrendingUp size={20} />}
            title="Impacto en el Mercado Colombiano"
            subtitle="Este proyecto no solo beneficiará directamente al personal contratado, sino que también contribuirá al fortalecimiento de la industria audiovisual nacional:"
          >
            <ul className="flex flex-col gap-3">
              <ArrowItem>Transferencia de conocimientos y tecnologías de vanguardia.</ArrowItem>
              <ArrowItem>
                Creación de sinergias con empresas locales de postproducción y marketing
                cinematográfico.
              </ArrowItem>
              <ArrowItem>
                Impulso a la cultura del análisis de datos aplicado al contenido audiovisual en
                Colombia.
              </ArrowItem>
            </ul>
          </SectionCard>

          {/* BLOQUE 4: Próximos Pasos */}
          <BlockHeader label="Próximos Pasos" icon={<Sparkles size={14} />} />

          <SectionCard icon={<ArrowRight size={20} />} title="Próximos Pasos" titleColor="#FFD700">
            <p className="text-sm leading-relaxed" style={{ lineHeight: '1.75' }}>
              En los próximos meses fortaleceremos el rendimiento económico. Durante el año 2026 y
              2027 nos consolidamos como tu mejor aliado económico. Juntos lograremos mejores
              oportunidades de ingresos diarios y un crecimiento sostenible para toda nuestra
              comunidad.
            </p>
          </SectionCard>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
