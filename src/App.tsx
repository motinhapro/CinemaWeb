import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';

// Importando as páginas que criamos
import Home from './pages/Home';
import Filmes from './pages/Filmes';
import FilmesForm from './pages/FilmesForm';
import FilmeEditar from './pages/FilmesEditar';
import Salas from './pages/Salas';
import SalasForm from './pages/SalasForm';
import Sessoes from './pages/Sessoes';
import SessoesForm from './pages/SessoesForm';
import VenderIngresso from './pages/VenderIngresso';
import SalaEditar from './pages/SalasEditar';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar fica fora do Routes para aparecer em todas as telas */}
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/filmes" element={<Filmes />} />
        <Route path="/filmes/novo" element={<FilmesForm />} />
        <Route path="/filmes/:id/editar" element={<FilmeEditar />} />
        <Route path="/salas" element={<Salas />} />
        <Route path="/salas/nova" element={<SalasForm />} />
        <Route path="/sessoes" element={<Sessoes />} />
        <Route path="/sessoes/nova" element={<SessoesForm />} />
        <Route path="/sessoes/:sessaoId/vender" element={<VenderIngresso />} />
        <Route path="/salas/:id/editar" element={<SalaEditar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;