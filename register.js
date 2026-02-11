import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: ''
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
    
    if (formData.password !== formData.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/auth/register/', formData);
      toast.success('Cadastro realizado com sucesso! Faça login.');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2d3748' }}>
        Cadastro
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label className="label">Nome</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          
          <div>
            <label className="label">Sobrenome</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        </div>
        
        <div>
          <label className="label">Usuário</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          
          <div>
            <label className="label">Confirmar Senha</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '20px' }}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#718096' }}>
        Já tem uma conta?{' '}
        <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
          Faça login
        </Link>
      </p>
    </div>
  );
}