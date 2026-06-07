import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import UnderConstruction from './pages/UnderConstruction';
import CuentaBancaria from './pages/CuentaBancaria';
import MiEquipo from './pages/MiEquipo';
import SobreNosotros from './pages/SobreNosotros';
import InformacionPersonal from './pages/InformacionPersonal';
import FormasDeGanar from './pages/FormasDeGanar';
import Videos from './pages/Videos';
import Soporte from './pages/Soporte';
import Niveles from './pages/Niveles';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/recargar" element={<UnderConstruction />} />
        <Route path="/retiros" element={<UnderConstruction />} />
        <Route path="/historial-recargas" element={<UnderConstruction />} />
        <Route path="/historial-retiros" element={<UnderConstruction />} />
        <Route path="/cuenta-bancaria" element={<CuentaBancaria />} />
        <Route path="/mi-equipo" element={<MiEquipo />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/informacion-personal" element={<InformacionPersonal />} />
        <Route path="/formas-de-ganar" element={<FormasDeGanar />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/soporte" element={<Soporte />} />
        <Route path="/niveles" element={<Niveles />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
