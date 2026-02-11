import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import VehicleSearch from './components/VehicleSearch';
import VehicleResult from './components/VehicleResult';
import toast from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);

  useEffect(() => {
    // Verificar usuário logado ao iniciar
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Login realizado com sucesso!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logout realizado com sucesso!');
  };

  const handleSearchComplete = (data) => {
    setVehicleData(data);
  };

  const handleNewSearch = () => {
    setVehicleData(null);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo">
            🚗 AutoBot
          </Link>
          
          <div>
            {user ? (
              <>
                <span style={{ marginRight: '15px', color: '#4a5568' }}>
                  Olá, {user.username}!
                </span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ padding: '8px 16px' }}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="btn btn-primary" style={{ marginRight: '10px' }}>
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="btn btn-secondary">
                    Cadastrar
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route 
            path="/" 
            element={
              !vehicleData ? (
                <VehicleSearch onSearchComplete={handleSearchComplete} />
              ) : (
                <VehicleResult 
                  vehicleData={vehicleData} 
                  onNewSearch={handleNewSearch} 
                />
              )
            } 
          />
          
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          
          <Route 
            path="/register" 
            element={<Register />} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;