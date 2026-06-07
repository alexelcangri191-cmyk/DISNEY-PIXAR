import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function UnderConstruction() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-20"
      style={{ background: '#000000' }}
    >
      <div
        className="flex flex-col items-center justify-center min-h-screen px-6"
      >
        <div
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,193,7,0.3)',
            boxShadow: '0 0 40px rgba(255,193,7,0.12)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles size={16} style={{ color: '#FFC107' }} />
            <span
              className="text-xs font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#FFC107' }}
            >
              Próximamente
            </span>
            <Sparkles size={16} style={{ color: '#FFC107' }} />
          </div>

          <div
            className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,193,7,0.1)' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFC107"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2 2v14Z" />
            </svg>
          </div>

          <h2
            className="font-black text-xl mb-3"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Sección en Construcción
          </h2>

          <p className="text-sm leading-relaxed mb-8" style={{ color: '#888888' }}>
            Esta sección se encuentra actualmente en desarrollo. Muy pronto estará disponible.
          </p>

          <button
            onClick={() => navigate('/perfil')}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={{
              background: 'rgba(255,193,7,0.1)',
              border: '1px solid rgba(255,193,7,0.4)',
              color: '#FFC107',
            }}
          >
            <ArrowLeft size={16} />
            Volver al Perfil
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
