import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function VehicleSearch({ onSearchComplete }) {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [anos, setAnos] = useState([]);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedAno, setSelectedAno] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMarcas();
  }, []);

  const loadMarcas = async () => {
    try {
      const response = await api.get('/fipe/marcas/');
      setMarcas(response.data);
    } catch (error) {
      toast.error('Erro ao carregar marcas');
    }
  };

  const handleMarcaChange = async (e) => {
    const marcaId = e.target.value;
    setSelectedMarca(marcaId);
    setSelectedModelo('');
    setSelectedAno('');
    setModelos([]);
    setAnos([]);

    if (marcaId) {
      try {
        const response = await api.get(`/fipe/modelos/?marca=${marcaId}`);
        setModelos(response.data.modelos || []);
      } catch (error) {
        toast.error('Erro ao carregar modelos');
      }
    }
  };

  const handleModeloChange = async (e) => {
    const modeloId = e.target.value;
    setSelectedModelo(modeloId);
    setSelectedAno('');
    setAnos([]);

    if (modeloId && selectedMarca) {
      try {
        const response = await api.get(`/fipe/anos/?marca=${selectedMarca}&modelo=${modeloId}`);
        setAnos(response.data);
      } catch (error) {
        toast.error('Erro ao carregar anos');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMarca || !selectedModelo || !selectedAno) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/fipe/preco/?marca=${selectedMarca}&modelo=${selectedModelo}&ano=${selectedAno}`
      );
      onSearchComplete(response.data);
    } catch (error) {
      toast.error('Erro ao consultar preço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2d3748' }}>
        Consulta Tabela FIPE
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label className="label">Marca</label>
          <select
            className="input"
            value={selectedMarca}
            onChange={handleMarcaChange}
            disabled={loading}
          >
            <option value="">Selecione a marca</option>
            {marcas.map((marca) => (
              <option key={marca.codigo} value={marca.codigo}>
                {marca.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Modelo</label>
          <select
            className="input"
            value={selectedModelo}
            onChange={handleModeloChange}
            disabled={loading || !selectedMarca}
          >
            <option value="">Selecione o modelo</option>
            {modelos.map((modelo) => (
              <option key={modelo.codigo} value={modelo.codigo}>
                {modelo.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Ano</label>
          <select
            className="input"
            value={selectedAno}
            onChange={(e) => setSelectedAno(e.target.value)}
            disabled={loading || !selectedModelo}
          >
            <option value="">Selecione o ano</option>
            {anos.map((ano) => (
              <option key={ano.codigo} value={ano.codigo}>
                {ano.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedAno}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '20px' }}
        >
          {loading ? 'Consultando...' : 'Consultar Preço'}
        </button>
      </form>
    </div>
  );
}