import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Niveles() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#000000' }}>
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
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 mb-8 transition-opacity hover:opacity-70 active:scale-95"
          style={{ color: '#FFC107' }}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Regresar al Perfil</span>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles size={14} style={{ color: '#FFC107' }} />
              <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>
                Próximamente
              </span>
              <Sparkles size={14} style={{ color: '#FFC107' }} />
            </div>

            <div
              className="rounded-3xl p-8 text-center"
              style={{
                background: '#1A1A1A',
                border: '1px solid rgba(255,193,7,0.3)',
                boxShadow: '0 0 40px rgba(255,193,7,0.1)',
              }}
            >
              <div
                className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,193,7,0.1)' }}
              >
                <Zap size={30} style={{ color: '#FFC107' }} />
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
                Niveles
              </h2>

              <p className="text-sm leading-relaxed" style={{ color: '#888888', lineHeight: '1.75' }}>
                Esta sección se encuentra actualmente en desarrollo. Muy pronto estará disponible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
