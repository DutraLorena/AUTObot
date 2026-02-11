import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', formData);
      onLogin(response.data.user, response.data.access);
      navigate('/');
    } catch (error) {
      toast.error('Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2d3748' }}>
        Login
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label className="label">Usuário</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="input"
            placeholder="Digite seu usuário"
          />
        </div>
        
        <div>
          <label className="label">Senha</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input"
            placeholder="Digite sua senha"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '20px' }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#718096' }}>
        Não tem uma conta?{' '}
        <Link to="/register" style={{ color: '#667eea', textDecoration: 'none' }}>
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}