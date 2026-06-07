import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Video, MessageCircle, Users, Zap } from 'lucide-react';
import { useState } from 'react';

const tabs = [
  { path: '/perfil', label: 'Mi perfil', Icon: Home },
  { path: '/videos', label: 'Vídeos', Icon: Video },
  { path: '/soporte', label: 'Soporte', Icon: MessageCircle },
  { path: '/mi-equipo', label: 'Mi Equipo', Icon: Users },
  { path: '/niveles', label: 'Niveles', Icon: Zap },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pressed, setPressed] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        background: '#1A1A1A',
        borderTop: '1px solid rgba(255,193,7,0.2)',
        boxShadow: '0 -4px 24px rgba(255,193,7,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(({ path, label, Icon }) => {
        const active = isActive(path);
        const isPressed = pressed === path;

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            onMouseDown={() => setPressed(path)}
            onMouseUp={() => setPressed(null)}
            onMouseLeave={() => setPressed(null)}
            onTouchStart={() => setPressed(path)}
            onTouchEnd={() => setPressed(null)}
            className="flex flex-col items-center gap-1 py-2.5 flex-1 transition-all duration-200"
            style={{
              transform: isPressed ? 'scale(0.9)' : 'scale(1)',
            }}
          >
            <Icon
              size={20}
              style={{
                color: active ? '#FFC107' : '#888888',
                filter: active ? 'drop-shadow(0 0 6px rgba(255,193,7,0.5))' : 'none',
                transition: 'color 0.2s, filter 0.2s',
              }}
            />
            <span
              className="text-[0.6rem] font-bold leading-none"
              style={{
                color: active ? '#FFC107' : '#888888',
                transition: 'color 0.2s',
              }}
            >
              {label}
            </span>
            {active && (
              <div
                className="absolute top-0 h-0.5 rounded-full"
                style={{
                  background: '#FFC107',
                  boxShadow: '0 0 8px rgba(255,193,7,0.6)',
                  width: '24px',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
