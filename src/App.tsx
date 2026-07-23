import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import UnderConstruction from './pages/UnderConstruction';
import Recargar from './pages/Recargar';
import CuentaBancaria from './pages/CuentaBancaria';
import MiEquipo from './pages/MiEquipo';
import SobreNosotros from './pages/SobreNosotros';
import InformacionPersonal from './pages/InformacionPersonal';
import FormasDeGanar from './pages/FormasDeGanar';
import Videos from './pages/Videos';
import Soporte from './pages/Soporte';
import Niveles from './pages/Niveles';
import Retiros from './pages/Retiros';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/recargar" element={<ProtectedRoute><Recargar /></ProtectedRoute>} />
        <Route path="/retiros" element={<ProtectedRoute><Retiros /></ProtectedRoute>} />
        <Route path="/historial-recargas" element={<ProtectedRoute><UnderConstruction /></ProtectedRoute>} />
        <Route path="/historial-retiros" element={<ProtectedRoute><UnderConstruction /></ProtectedRoute>} />
        <Route path="/cuenta-bancaria" element={<ProtectedRoute><CuentaBancaria /></ProtectedRoute>} />
        <Route path="/mi-equipo" element={<ProtectedRoute><MiEquipo /></ProtectedRoute>} />
        <Route path="/sobre-nosotros" element={<ProtectedRoute><SobreNosotros /></ProtectedRoute>} />
        <Route path="/informacion-personal" element={<ProtectedRoute><InformacionPersonal /></ProtectedRoute>} />
        <Route path="/formas-de-ganar" element={<ProtectedRoute><FormasDeGanar /></ProtectedRoute>} />
        <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
        <Route path="/soporte" element={<ProtectedRoute><Soporte /></ProtectedRoute>} />
        <Route path="/niveles" element={<ProtectedRoute><Niveles /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
