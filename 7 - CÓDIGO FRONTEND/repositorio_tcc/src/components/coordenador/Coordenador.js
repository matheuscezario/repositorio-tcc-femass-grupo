
import React, { Component } from 'react';
import InputMask from 'react-input-mask';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import Navbar from '../navbar/Navbar';

const emptyForm = {
  nomeCompleto: '',
  cpf: '',
  telefone: '',
  email: '',
  idCurso: ''
};

class Coordenador extends Component {
  state = {
    listCoordenador: [],
    listCursos: [],
    search: '',
    showModalForm: false,
    showModalView: false,
    showModalDeletion: false,
    showModalImport: false,
    selectedItem: null,
    editing: false,
    form: { ...emptyForm },
    importFile: null,
    importCursoId: '',
    loading: false
  };

  componentDidMount() {
    this.fillList();
    this.fillCursos();
  }

  request = async (path, options = {}) => {
    const token = sessionStorage.getItem('token');

    const headers = {
      Authorization: 'Bearer ' + token,
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    };

    const response = await fetch(window.server + path, {
      ...options,
      headers
    });

    if (!response.ok) {
      let message = 'Erro na requisição (' + response.status + ')';

      try {
        const error = await response.json();
        message = error.message || error.error || message;
      } catch (e) {
        // Mantém a mensagem padrão.
      }

      throw new Error(message);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  };

  fillList = async () => {
    try {
      const data = await this.request('/coordenadores');

      this.setState({
        listCoordenador: Array.isArray(data) ? data : []
      });
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar os coordenadores.');
    }
  };

  fillCursos = async () => {
    try {
      const data = await this.request('/cursos');

      this.setState({
        listCursos: Array.isArray(data) ? data : []
      });
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar os cursos.');
    }
  };

  openCreate = () => {
    this.setState({
      showModalForm: true,
      editing: false,
      selectedItem: null,
      form: { ...emptyForm }
    });
  };

  openEdit = (item) => {
    this.setState({
      showModalForm: true,
      editing: true,
      selectedItem: item,
      form: {
        nomeCompleto: item.nomeCompleto || '',
        cpf: item.cpf || '',
        telefone: item.telefone || '',
        email: item.email || '',
        idCurso: item.idCurso || ''
      }
    });
  };

  openView = (item) => {
    this.setState({
      showModalView: true,
      selectedItem: item
    });
  };

  closeForm = () => {
    if (this.state.loading) return;

    this.setState({
      showModalForm: false,
      editing: false,
      selectedItem: null,
      form: { ...emptyForm }
    });
  };

  handleChange = (event) => {
    const { name, value } = event.target;

    this.setState((previous) => ({
      form: {
        ...previous.form,
        [name]: value
      }
    }));
  };

  saveCoordenador = async (event) => {
    event.preventDefault();

    if (this.state.loading) return;

    const { form, editing, selectedItem } = this.state;

    const data = {
      nomeCompleto: form.nomeCompleto.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      telefone: form.telefone.replace(/\D/g, ''),
      email: form.email.trim(),
      idCurso: form.idCurso
    };

    if (
      !data.nomeCompleto ||
      data.cpf.length !== 11 ||
      ![10, 11].includes(data.telefone.length) ||
      !data.email ||
      !data.idCurso
    ) {
      toast.warning('Confira os campos antes de salvar.');
      return;
    }

    this.setState({ loading: true });

    try {
      await this.request(
        editing
          ? '/coordenadores/' + selectedItem.id
          : '/coordenadores',
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify(data)
        }
      );

      toast.success(
        editing
          ? 'Coordenador atualizado com sucesso!'
          : 'Coordenador cadastrado com sucesso!'
      );

      this.setState({
        loading: false,
        showModalForm: false,
        selectedItem: null,
        editing: false,
        form: { ...emptyForm }
      });

      await this.fillList();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Erro ao salvar coordenador.');
      this.setState({ loading: false });
    }
  };

  deleteCoordenador = async () => {
    const item = this.state.selectedItem;

    if (!item || this.state.loading) return;

    this.setState({ loading: true });

    try {
      await this.request('/coordenadores/' + item.id, {
        method: 'DELETE'
      });

      toast.success('Coordenador excluído com sucesso!');

      this.setState({
        showModalDeletion: false,
        selectedItem: null,
        loading: false
      });

      await this.fillList();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Não foi possível excluir.');
      this.setState({ loading: false });
    }
  };

  importCoordenadores = async (event) => {
    event.preventDefault();

    const { importFile, importCursoId, loading } = this.state;

    if (loading) return;

    if (!importFile) {
      toast.warning('Selecione um arquivo para importar.');
      return;
    }

    if (!importCursoId) {
      toast.warning('Selecione o curso dos coordenadores.');
      return;
    }

    const extension = importFile.name
      .split('.')
      .pop()
      .toLowerCase();

    if (!['csv', 'xls', 'xlsx'].includes(extension)) {
      toast.warning('Selecione um arquivo CSV, XLS ou XLSX.');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('idCurso', importCursoId);

    this.setState({ loading: true });

    try {
      const quantity = await this.request(
        '/coordenadores/import',
        {
          method: 'POST',
          body: formData
        }
      );

      toast.success(
        `${quantity} coordenador(es) importado(s) com sucesso!`
      );

      this.setState({
        showModalImport: false,
        importFile: null,
        importCursoId: '',
        loading: false
      });

      await this.fillList();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Erro ao importar arquivo.');
      this.setState({ loading: false });
    }
  };

  formatCpf = (value) => {
    const digits = String(value || '').replace(/\D/g, '');

    if (digits.length !== 11) return value || '-';

    return digits.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    );
  };

  formatPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '');

    if (digits.length === 11) {
      return digits.replace(
        /(\d{2})(\d{5})(\d{4})/,
        '($1) $2-$3'
      );
    }

    if (digits.length === 10) {
      return digits.replace(
        /(\d{2})(\d{4})(\d{4})/,
        '($1) $2-$3'
      );
    }

    return value || '-';
  };

  renderFormFields = () => {
    const { form } = this.state;

    return (
      <>
        <div className="mb-3">
          <label className="form-label fw-bold">
            Nome Completo *
          </label>

          <input
            type="text"
            className="form-control"
            name="nomeCompleto"
            value={form.nomeCompleto}
            onChange={this.handleChange}
            required
            placeholder="Digite o nome completo"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            CPF *
          </label>

          <InputMask
            mask="999.999.999-99"
            className="form-control"
            name="cpf"
            value={form.cpf}
            onChange={this.handleChange}
            required
            placeholder="000.000.000-00"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            E-mail *
          </label>

          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={this.handleChange}
            required
            placeholder="Digite o e-mail"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Telefone *
          </label>

          <InputMask
            mask="(99) 99999-9999"
            className="form-control"
            name="telefone"
            value={form.telefone}
            onChange={this.handleChange}
            required
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Curso *
          </label>

          <select
            className="form-select"
            name="idCurso"
            value={form.idCurso}
            onChange={this.handleChange}
            required
          >
            <option value="">
              Selecione um curso
            </option>

            {this.state.listCursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nome}
              </option>
            ))}
          </select>

          <small className="text-muted">
            Selecione o curso ao qual o coordenador pertence.
          </small>
        </div>
      </>
    );
  };

  render() {
    const {
      listCoordenador,
      search,
      showModalForm,
      showModalView,
      showModalDeletion,
      showModalImport,
      selectedItem,
      editing,
      importFile,
      importCursoId,
      loading
    } = this.state;

    const filtered = listCoordenador.filter((item) => {
      const text = [
        item.nomeCompleto,
        item.email,
        item.cpf,
        item.nomeCurso
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(search.toLowerCase());
    });

    const columns = [
      {
        name: 'Nome',
        selector: (row) => row.nomeCompleto || '',
        sortable: true,
        width: '40%'
      },
      {
        name: 'E-mail',
        selector: (row) => row.email || '',
        sortable: true,
        width: '40%'
      },
      {
        name: 'Ações',
        width: '20%',
        cell: (row) => (
          <div className="d-flex flex-nowrap">
            <button
              type="button"
              className="btn btn-outline-secondary mx-1 px-1 py-0"
              title="Visualizar"
              aria-label="Visualizar coordenador"
              onClick={() => this.openView(row)}
            >
              <i className="bi bi-eye" />
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary mx-1 px-1 py-0"
              title="Editar"
              aria-label="Editar coordenador"
              onClick={() => this.openEdit(row)}
            >
              <i className="bi bi-pencil-square" />
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary mx-1 px-1 py-0"
              title="Excluir"
              aria-label="Excluir coordenador"
              onClick={() =>
                this.setState({
                  selectedItem: row,
                  showModalDeletion: true
                })
              }
            >
              <i className="bi bi-trash" />
            </button>
          </div>
        )
      }
    ];

    const customStyles = {
      headCells: {
        style: {
          backgroundColor: '#212529',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }
      },
      rows: {
        style: {
          minHeight: '55px'
        }
      }
    };

    return (
      <div>
        <Navbar />
        <ToastContainer />

        <div className="page-content">
          <div className="col-12 mb-4 mt-4">
            <h1 className="display-5 fw-bold mb-4 tittle tittleAfter">
              Coordenadores
            </h1>
          </div>

          <div className="col-sm-10 col-md-6 col-lg-5 col-xl-4 ms-5 mb-4">
            <div className="card mx-3">
              <div className="card-body d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-success fw-bold"
                  onClick={this.openCreate}
                >
                  <i className="bi bi-plus-circle-dotted fs-6 me-2" />
                  Incluir
                </button>

                <button
                  type="button"
                  className="btn btn-primary fw-bold"
                  onClick={() =>
                    this.setState({
                      showModalImport: true,
                      importFile: null,
                      importCursoId: ''
                    })
                  }
                >
                  <i className="bi bi-cloud-upload me-2" />
                  Carregar arquivo
                </button>
              </div>
            </div>
          </div>

          <div className="card mx-5 p-3">
            <div className="card-body">
              <div className="table-responsive border-rounded">
                <DataTable
                  columns={columns}
                  data={filtered}
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[10, 20, 30, 50]}
                  highlightOnHover
                  responsive
                  customStyles={customStyles}
                  noDataComponent="Nenhum coordenador encontrado"
                  subHeader
                  subHeaderComponent={
                    <input
                      type="text"
                      className="form-control"
                      style={{ maxWidth: '300px' }}
                      placeholder="Pesquisar coordenador..."
                      value={search}
                      onChange={(event) =>
                        this.setState({
                          search: event.target.value
                        })
                      }
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cadastro e edição */}
        <Modal
          show={showModalForm}
          onHide={this.closeForm}
          centered
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header
            className="bg-dark text-white"
            closeButton
            closeVariant="white"
          >
            <Modal.Title>
              {editing ? 'Editar Coordenador' : 'Novo Coordenador'}
            </Modal.Title>
          </Modal.Header>

          <form onSubmit={this.saveCoordenador}>
            <Modal.Body>
              {this.renderFormFields()}
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={this.closeForm}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                variant={editing ? 'primary' : 'success'}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Salvando...'
                  : editing
                    ? 'Salvar'
                    : 'Criar'}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>

        {/* Visualização */}
        <Modal
          show={showModalView}
          onHide={() =>
            this.setState({
              showModalView: false,
              selectedItem: null
            })
          }
          centered
          size="lg"
        >
          <Modal.Header
            className="bg-dark text-white"
            closeButton
            closeVariant="white"
          >
            <Modal.Title>
              Visualizar Coordenador
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedItem && (
              <div className="row g-3">
                <div className="col-12">
                  <strong>Nome Completo</strong>
                  <div>{selectedItem.nomeCompleto || '-'}</div>
                </div>

                <div className="col-md-6">
                  <strong>CPF</strong>
                  <div>{this.formatCpf(selectedItem.cpf)}</div>
                </div>

                <div className="col-md-6">
                  <strong>Telefone</strong>
                  <div>{this.formatPhone(selectedItem.telefone)}</div>
                </div>

                <div className="col-12">
                  <strong>E-mail</strong>
                  <div>{selectedItem.email || '-'}</div>
                </div>

                <div className="col-12">
                  <strong>Curso</strong>
                  <div>{selectedItem.nomeCurso || '-'}</div>
                </div>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() =>
                this.setState({
                  showModalView: false,
                  selectedItem: null
                })
              }
            >
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Exclusão */}
        <Modal
          show={showModalDeletion}
          onHide={() => {
            if (!loading) {
              this.setState({
                showModalDeletion: false,
                selectedItem: null
              });
            }
          }}
          centered
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header
            className="bg-dark text-white"
            closeButton
            closeVariant="white"
          >
            <Modal.Title>
              Confirmar Exclusão
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Tem certeza que deseja excluir o coordenador{' '}
            <strong>{selectedItem?.nomeCompleto}</strong>?
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() =>
                this.setState({
                  showModalDeletion: false,
                  selectedItem: null
                })
              }
            >
              Cancelar
            </Button>

            <Button
              variant="danger"
              disabled={loading}
              onClick={this.deleteCoordenador}
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Importação */}
        <Modal
          show={showModalImport}
          onHide={() => {
            if (!loading) {
              this.setState({
                showModalImport: false,
                importFile: null,
                importCursoId: ''
              });
            }
          }}
          centered
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header
            className="bg-dark text-white"
            closeButton
            closeVariant="white"
          >
            <Modal.Title>
              Carregar Coordenadores
            </Modal.Title>
          </Modal.Header>

          <form onSubmit={this.importCoordenadores}>
            <Modal.Body>
              <p>
                Selecione uma planilha para cadastrar coordenadores
                em lote.
              </p>

              <div className="mb-3">
                <label
                  className="form-label fw-bold"
                  htmlFor="coordImportCurso"
                >
                  Curso *
                </label>

                <select
                  id="coordImportCurso"
                  className="form-select"
                  value={importCursoId}
                  onChange={(event) =>
                    this.setState({
                      importCursoId: event.target.value
                    })
                  }
                  required
                >
                  <option value="">
                    Selecione um curso
                  </option>

                  {this.state.listCursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nome}
                    </option>
                  ))}
                </select>

                <small className="text-muted">
                  Todos os coordenadores da planilha serão
                  vinculados a este curso.
                </small>
              </div>

              <label
                className="form-label fw-bold"
                htmlFor="coordFile"
              >
                Arquivo CSV ou Excel
              </label>

              <div>
                <input
                  type="file"
                  id="coordFile"
                  style={{ display: 'none' }}
                  accept=".csv,.xls,.xlsx"
                  required
                  onChange={(event) =>
                    this.setState({
                      importFile: event.target.files[0] || null
                    })
                  }
                />

                <label
                  htmlFor="coordFile"
                  className="btn btn-outline-secondary"
                >
                  Selecionar arquivo
                </label>

                <span className="ms-2">
                  {importFile?.name || 'Nenhum arquivo selecionado'}
                </span>
              </div>

              <div className="mt-3">
                <strong>Ordem das colunas:</strong>
                <div>
                  Nome Completo | CPF | E-mail | Telefone
                </div>

                <small className="text-muted">
                  A primeira linha deve conter os cabeçalhos.
                  Registros com CPF ou e-mail já cadastrados
                  serão ignorados.
                </small>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() =>
                  this.setState({
                    showModalImport: false,
                    importFile: null,
                    importCursoId: ''
                  })
                }
              >
                Cancelar
              </Button>

              <Button
                variant="success"
                type="submit"
                disabled={!importFile || !importCursoId || loading}
              >
                {loading ? 'Importando...' : 'Carregar'}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}

export default Coordenador;
