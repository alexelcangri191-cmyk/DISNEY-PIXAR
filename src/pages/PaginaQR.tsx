import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wrench } from 'lucide-react';

export default function PaginaQR() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#000000' }}
    >
      {/* Ambient glow - same as Perfil */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
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
          background:
            'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-6">
        {/* Header */}
        <header className="w-full max-w-lg mx-auto flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/recargar')}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 active:scale-90"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              color: '#888888',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'rgba(255,193,7,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#FFC107';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'rgba(255,193,7,0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = '#888888';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: '#FFC107' }} />
            <h1
              className="font-black text-xl tracking-tight"
              style={{
                background:
                  'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Página QR
            </h1>
          </div>
        </header>

        {/* Under Construction placeholder */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="w-full max-w-lg rounded-3xl p-10 flex flex-col items-center text-center"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,193,7,0.2)',
              boxShadow: '0 0 40px rgba(255,193,7,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'rgba(255,193,7,0.1)',
                border: '2px solid rgba(255,193,7,0.3)',
                boxShadow: '0 0 32px rgba(255,193,7,0.2), inset 0 0 16px rgba(255,193,7,0.05)',
              }}
            >
              <Wrench size={36} style={{ color: '#FFC107' }} />
            </div>

            {/* Title */}
            <h2
              className="font-black text-2xl mb-3"
              style={{
                background:
                  'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              En construcción
            </h2>

            {/* Message */}
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: '#888888' }}
            >
              Estamos trabajando en esta página. Pronto podrás ver aquí tu
              código QR para completar la recarga.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
