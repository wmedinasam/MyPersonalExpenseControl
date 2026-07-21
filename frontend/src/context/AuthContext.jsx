import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const respuesta = await api.post('/auth/login', { email, password });
    const { token, nombre, email: userEmail } = respuesta.data;

    const datosUsuario = { nombre, email: userEmail };

    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));

    setUsuario(datosUsuario);
    return respuesta.data;
  };

  const registro = async (nombre, email, password) => {
    const respuesta = await api.post('/auth/registro', { nombre, email, password });
    const { token, email: userEmail } = respuesta.data;

    const datosUsuario = { nombre, email: userEmail };

    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));

    setUsuario(datosUsuario);
    return respuesta.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, registro, logout, cargando }}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);