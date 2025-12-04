import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';

// Importando as páginas que criamos
import Home from './pages/Home';
import Filmes from './pages/Filmes';
import FilmesForm from './pages/FilmesForm';
import Salas from './pages/Salas';
import SalasForm from './pages/SalasForm';
import Sessoes from './pages/Sessoes';
import SessoesForm from './pages/SessoesForm';
import VenderIngresso from './pages/VenderIngresso';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar fica fora do Routes para aparecer em todas as telas */}
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/filmes" element={<Filmes />} />
        <Route path="/filmes/novo" element={<FilmesForm />} />
        <Route path="/salas" element={<Salas />} />
        <Route path="/salas/nova" element={<SalasForm />} />
        <Route path="/sessoes" element={<Sessoes />} />
        <Route path="/sessoes/nova" element={<SessoesForm />} />
        <Route path="/sessoes/:sessaoId/vender" element={<VenderIngresso />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;