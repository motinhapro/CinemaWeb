import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();

  // Função auxiliar para ativar a classe 'active' no link correto
  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-film me-2"></i>
          CineWeb
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/filmes')}`} to="/filmes">
                Filmes
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/salas')}`} to="/salas">
                Salas
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/sessoes')}`} to="/sessoes">
                Sessões
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/lanches')}`} to="/lanches">
                Bomboniere
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}