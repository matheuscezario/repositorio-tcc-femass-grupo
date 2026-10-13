
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const MENU_ITEMS = [
  { path: '/home', label: 'Início', perfis: ['TODOS'] },
  { path: '/alunos', label: 'Alunos', perfis: ['ADMIN', 'PROFESSOR'] },
  { path: '/orientadores', label: 'Orientadores', perfis: ['ADMIN'] },
  { path: '/professores', label: 'Professores', perfis: ['ADMIN'] },
  { path: '/coordenadores', label: 'Coordenadores', perfis: ['ADMIN'] },
  { path: '/tcc', label: 'Trabalhos de Conclusão', perfis: ['ADMIN', 'ALUNO', 'ORIENTADOR', 'COORDENADOR', 'PROFESSOR'] },
  { path: '/solicitacoes-tcc', label: 'Solicitações TCC', perfis: ['ADMIN', 'ORIENTADOR', 'COORDENADOR', 'PROFESSOR'] },
  { path: '/meu-tcc', label: 'Meu TCC', perfis: ['ADMIN', 'ALUNO'] },
  { path: '/categorias', label: 'Categorias', perfis: ['ADMIN'] },
  { path: '/users', label: 'Usuários', perfis: ['ADMIN'] },
  { path: '/atividades', label: 'Atividades', perfis: ['ADMIN', 'ALUNO', 'PROFESSOR'] },
  { path: '/turmas', label: 'Turmas', perfis: ['ADMIN', 'PROFESSOR'] }
];

export default class Navbar extends Component {
  state = {
    currentPageLink: window.location.pathname.split('/')[1],
    role: sessionStorage.getItem('role') || 'USER',
    perfis: this.carregarPerfis()
  };

  carregarPerfis() {
    try {
      const perfis = JSON.parse(sessionStorage.getItem('perfis') || '[]');
      return Array.isArray(perfis) ? perfis : [];
    } catch (error) {
      return [];
    }
  }

  logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('perfis');
    sessionStorage.removeItem('mustChangePassword');
    sessionStorage.removeItem('nomeCompleto');
    window.location.href = '/login';
  };

  componentDidMount() {
    this.setState({
      currentPageLink: window.location.pathname.split('/')[1],
      role: sessionStorage.getItem('role') || 'USER',
      perfis: this.carregarPerfis()
    });
  }

  podeVisualizar = (item) => {
    const { role, perfis } = this.state;

    if (role === 'ADMIN' || perfis.includes('ADMIN')) {
      return true;
    }

    if (item.perfis.includes('TODOS')) {
      return true;
    }

    return item.perfis.some(perfil => perfis.includes(perfil));
  };

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top">
        <div className="container-fluid">
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Barra de menu"
          >
            <span className="fs-1" style={{ color: 'black' }}>
              <i className="bi bi-list"></i>
            </span>
          </button>

          <div
            className="offcanvas offcanvas-start bg-custom-blue rounded-end-5 p-5 ps-4"
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header border-bottom">
              <h5
                className="offcanvas-title text-white display-5"
                id="offcanvasNavbarLabel"
              >
                Menu
              </h5>
            </div>

            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3 fs-5">
                {MENU_ITEMS.filter(this.podeVisualizar).map(item => {
                  const pagina = item.path.split('/')[1];

                  return (
                    <li className="nav-item" key={item.path}>
                      <Link
                        to={item.path}
                        className={`nav-link ${
                          this.state.currentPageLink === pagina ? 'active' : ''
                        }`}
                        id={pagina === 'home' ? 'linkToHome' : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div>
            <Link to="/perfil" className="btn btn-light border-0">
              <button
                type="button"
                aria-label="Usuário"
                className="btn btn-light border-0"
              >
                <span>
  <i className="bi bi-person-circle fs-2 p-2"></i>
  {sessionStorage.getItem('nomeCompleto') || 'Usuário'}
</span>
              </button>
            </Link>

            <button
              type="button"
              aria-label="Notificações"
              className="btn btn-light border-0"
            >
              <span className="w-100">
                <i className="bi bi-bell fs-2"></i>
              </span>
            </button>

            <button
              type="button"
              aria-label="Sair do Sistema"
              className="btn border-0 btn-light"
              onClick={this.logout}
            >
              <span>
                <i className="bi bi-box-arrow-left fs-2"></i>
              </span>
            </button>
          </div>
        </div>
      </nav>
    );
  }
}
