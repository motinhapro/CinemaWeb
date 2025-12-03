import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';

// Importando as páginas que criamos
import Home from './pages/Home';
import Filmes from './pages/Filmes';
import Salas from './pages/Salas';
import Sessoes from './pages/Sessoes';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar fica fora do Routes para aparecer em todas as telas */}
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/filmes" element={<Filmes />} />
        <Route path="/salas" element={<Salas />} />
        <Route path="/sessoes" element={<Sessoes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;