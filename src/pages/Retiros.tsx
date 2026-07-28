import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

export default function Retiros() {
  const navigate = useNavigate();

  const puntos = [
    'Los retiros estarán disponible únicamente de lunes a viernes en horario de oficina hora colombiana de 08:00 am a 12:00 pm y de 02:00 pm a 06:00 pm (hora colombiana) fuera de estos días y horas nuestro personal y el sistema no procesara ninguna solicitud.',
    'Debe tener en cuenta que sobre cada retiro se cobrará una comisión del 10% al monto a retirar.',
    'El dinero restante será transferido a su cuenta Nequi o Bancolombia registrada en la app.',
    'Sola mente se puede realizar un retiro x día y una vez realizado la solicitud de retiro el sistema procesara su solicitud y en el lapso no mayor a las siguientes Horas será respectiva mente hecho efectivo su retiro.',
    'Verificar que el monto seleccionado a retirar sea el que usted ha escogido y así evitar demoras en las transacciones.',
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#000000' }}
    >
      {/* Ambient glow */}
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

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-6">
        {/* Header */}
        <header className="w-full max-w-lg mx-auto flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
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
            Retiros
          </h1>
        </header>

        {/* Información de Retiros Block */}
        <div
          className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,193,7,0.15)',
            boxShadow: '0 0 30px rgba(255,193,7,0.08)',
          }}
        >
          <div className="flex">
            {/* Left accent bar */}
            <div
              className="flex-shrink-0 w-1.5"
              style={{
                background:
                  'linear-gradient(180deg, #FFD700, #FFC107, #B8860B)',
              }}
            />
            <div className="flex-1 p-5 flex flex-col gap-4">
              {/* Title */}
              <div className="flex items-center gap-2">
                <Info size={16} style={{ color: '#FFC107' }} />
                <h2
                  className="font-bold text-sm tracking-wide"
                  style={{ color: '#FFC107' }}
                >
                  Información de Retiros
                </h2>
              </div>

              {/* Info points */}
              <ul className="flex flex-col gap-3">
                {puntos.map((texto, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: '#FFC107' }}
                    />
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#AAAAAA' }}
                    >
                      {texto}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
