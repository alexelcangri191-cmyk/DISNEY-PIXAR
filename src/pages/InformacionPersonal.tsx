import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const INSTRUCTIONS = [
  'Deben llenarse correctamente todos los datos para evitar inconvenientes a la hora de realizar retiros.',
  'Verificar correctamente el titular de la cuenta.',
  'Colocar correctamente el número de cuenta a registrarse.',
  'Realizar correctamente la selección del tipo de banco.',
  'Recuerden que al enviar los datos serán guardados para el uso de desembolso y pagos.',
];

export default function InformacionPersonal() {
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
        {/* Header con título y flecha de atrás */}
        <div className="flex items-center gap-3 mb-8">
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
            Información personal
          </h1>
        </div>

        {/* Bloque informativo */}
        <div className="w-full max-w-lg mx-auto">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1)',
            }}
          >
            {/* Barra superior decorativa */}
            <div
              className="h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, #FFD700, #FFC107, #B8860B)' }}
            />

            <div className="p-6">
              {/* Título destacado */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,193,7,0.12)' }}
                >
                  <Info size={22} style={{ color: '#FFC107' }} />
                </div>
                <div>
                  <h2
                    className="font-black text-lg tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Información
                  </h2>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles size={10} style={{ color: '#FFC107' }} />
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
                      Lee antes de continuar
                    </span>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div
                className="h-px mb-5"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,193,7,0.3), transparent)' }}
              />

              {/* Cuerpo de texto - lista de puntos */}
              <ul className="flex flex-col gap-3.5">
                {INSTRUCTIONS.map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
                      style={{
                        background: 'rgba(255,193,7,0.1)',
                        border: '1px solid rgba(255,193,7,0.25)',
                      }}
                    >
                      <span className="text-xs font-black" style={{ color: '#FFC107' }}>
                        {idx + 1}
                      </span>
                    </div>
                    <p
                      className="text-sm flex-1"
                      style={{ color: '#CCCCCC', lineHeight: '1.7' }}
                    >
                      {text}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Nota final destacada */}
              <div
                className="mt-5 rounded-2xl p-4 flex items-start gap-3"
                style={{
                  background: 'rgba(255,193,7,0.06)',
                  border: '1px solid rgba(255,193,7,0.2)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#FFC107' }} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs" style={{ color: '#AAAAAA', lineHeight: '1.6' }}>
                  Tus datos son tratados con cifrado de extremo a extremo y se utilizan
                  únicamente para procesos de desembolso y pagos dentro de la plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
