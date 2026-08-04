import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, FileText, UserCheck, Hash, Building2, Save } from 'lucide-react';
import BottomNav from '../components/BottomNav';

interface InstructionItem {
  icon: React.ReactNode;
  text: string;
}

const instructions: InstructionItem[] = [
  { icon: <FileText size={18} />, text: 'Deben llenarse correctamente todos los datos para evitar inconvenientes a la hora de realizar retiros.' },
  { icon: <UserCheck size={18} />, text: 'Verificar correctamente el titular de la cuenta.' },
  { icon: <Hash size={18} />, text: 'Colocar correctamente el número de cuenta a registrarse.' },
  { icon: <Building2 size={18} />, text: 'Realizar correctamente la selección del tipo de banco.' },
  { icon: <Save size={18} />, text: 'Recuerden que al enviar los datos serán guardados para el uso de desembolso y pagos.' },
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
            Información Personal
          </h1>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.3)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid rgba(255,193,7,0.15)' }}
            >
              <Info size={18} style={{ color: '#FFC107' }} />
              <h2
                className="text-base font-extrabold uppercase tracking-wider"
                style={{ color: '#FFC107' }}
              >
                Información
              </h2>
            </div>

            <div className="p-5">
              <ul className="flex flex-col gap-4">
                {instructions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(255,193,7,0.1)' }}
                    >
                      <span style={{ color: '#FFC107' }}>{item.icon}</span>
                    </div>
                    <p
                      className="text-sm font-medium leading-relaxed"
                      style={{ color: '#CCCCCC', lineHeight: '1.75' }}
                    >
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,193,7,0.15)' }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#FFC107' }}
              />
              <p className="text-xs" style={{ color: '#888888' }}>
                Tenga en cuenta estos puntos antes de continuar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
