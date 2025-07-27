import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5001';

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [listas, setListas] = useState([]);
  const [tareas, setTareas] = useState([]);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [listaSeleccionada, setListaSeleccionada] = useState('');

  const [nombreTarea, setNombreTarea] = useState('');
  const [descripcionTarea, setDescripcionTarea] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [conexionOK, setConexionOK] = useState(false);

  const [mostrarFormUsuario, setMostrarFormUsuario] = useState(false);
  const [mostrarFormProyecto, setMostrarFormProyecto] = useState(false);
  const [mostrarFormLista, setMostrarFormLista] = useState(false);

  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', contraseña: '' });
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', descripcion: '' });
  const [nuevaLista, setNuevaLista] = useState({ nombre: '' });

  const verificarConexion = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      if (response.data.mensaje) {
        setConexionOK(true);
        setMensaje('Conexión establecida correctamente');
        setTimeout(() => setMensaje(''), 3000);
      }
    } catch (error) {
      setConexionOK(false);
      if (error.code === 'ERR_NETWORK') {
        setMensaje('Error: No se puede conectar al servidor. Verifica que el backend esté ejecutándose en el puerto 5001');
      } else if (error.response?.status === 403) {
        setMensaje('Error 403: Problema de CORS. Verifica la configuración del servidor');
      } else {
        setMensaje(`Error de conexión: ${error.message}`);
      }
    }
  }, []);

  const cargarUsuarios = useCallback(async () => {
    if (!conexionOK) return;
    
    try {
      setCargando(true);
      const response = await axios.get(`${API_BASE_URL}/usuarios`);
      setUsuarios(response.data);
    } catch (error) {
      setMensaje('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  }, [conexionOK]);

  const cargarProyectos = useCallback(async () => {
    if (!conexionOK || !usuarioSeleccionado) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/proyectos`);
      const proyectosFiltrados = response.data.filter(
        proyecto => proyecto.user_id === parseInt(usuarioSeleccionado)
      );
      setProyectos(proyectosFiltrados);
    } catch (error) {
      setMensaje('Error al cargar proyectos');
    }
  }, [usuarioSeleccionado, conexionOK]);

  const cargarListas = useCallback(async () => {
    if (!conexionOK || !proyectoSeleccionado) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/listas`);
      const listasFiltradas = response.data.filter(
        lista => lista.proyectos_id === parseInt(proyectoSeleccionado)
      );
      setListas(listasFiltradas);
    } catch (error) {
      setMensaje('Error al cargar listas');
    }
  }, [proyectoSeleccionado, conexionOK]);

  const cargarTareas = useCallback(async () => {
    if (!conexionOK || !listaSeleccionada) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/listas/${listaSeleccionada}/tareas`);
      setTareas(response.data);
    } catch (error) {
      setMensaje('Error al cargar tareas');
    }
  }, [listaSeleccionada, conexionOK]);

  useEffect(() => {
    verificarConexion();
  }, [verificarConexion]);

  useEffect(() => {
    if (conexionOK) {
      cargarUsuarios();
    }
  }, [conexionOK, cargarUsuarios]);

  useEffect(() => {
    if (usuarioSeleccionado) {
      cargarProyectos();
    } else {
      setProyectos([]);
      setProyectoSeleccionado('');
    }
  }, [usuarioSeleccionado, cargarProyectos]);

  useEffect(() => {
    if (proyectoSeleccionado) {
      cargarListas();
    } else {
      setListas([]);
      setListaSeleccionada('');
    }
  }, [proyectoSeleccionado, cargarListas]);

  useEffect(() => {
    if (listaSeleccionada) {
      cargarTareas();
    } else {
      setTareas([]);
    }
  }, [listaSeleccionada, cargarTareas]);

  const crearUsuario = async (e) => {
    e.preventDefault();
    
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.contraseña) {
      setMensaje('Todos los campos son obligatorios');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/usuarios`, nuevoUsuario);
      setNuevoUsuario({ nombre: '', email: '', contraseña: '' });
      setMostrarFormUsuario(false);
      cargarUsuarios();
      setMensaje('Usuario creado exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al crear usuario');
    }
  };

  const crearProyecto = async (e) => {
    e.preventDefault();
    
    if (!nuevoProyecto.nombre || !nuevoProyecto.descripcion) {
      setMensaje('Todos los campos son obligatorios');
      return;
    }

    try {
      const proyectoData = {
        ...nuevoProyecto,
        user_id: parseInt(usuarioSeleccionado)
      };
      
      await axios.post(`${API_BASE_URL}/proyectos`, proyectoData);
      setNuevoProyecto({ nombre: '', descripcion: '' });
      setMostrarFormProyecto(false);
      cargarProyectos();
      setMensaje('Proyecto creado exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al crear proyecto');
    }
  };

  const crearLista = async (e) => {
    e.preventDefault();
    
    if (!nuevaLista.nombre) {
      setMensaje('El nombre es obligatorio');
      return;
    }

    try {
      const listaData = {
        ...nuevaLista,
        proyectos_id: parseInt(proyectoSeleccionado)
      };
      
      await axios.post(`${API_BASE_URL}/listas`, listaData);
      setNuevaLista({ nombre: '' });
      setMostrarFormLista(false);
      cargarListas();
      setMensaje('Lista creada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al crear lista');
    }
  };

  const crearTarea = async (e) => {
    e.preventDefault();

    if (!nombreTarea.trim()) {
      setMensaje('El nombre de la tarea es obligatorio');
      return;
    }

    if (!listaSeleccionada) {
      setMensaje('Debe seleccionar una lista');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const nuevaTarea = {
        lista_id: parseInt(listaSeleccionada),
        nombre: nombreTarea.trim(),
        descripción: descripcionTarea.trim() || null,
        completada: false,
        vencimiento: fechaVencimiento || null
      };

      await axios.post(`${API_BASE_URL}/tareas`, nuevaTarea);

      setNombreTarea('');
      setDescripcionTarea('');
      setFechaVencimiento('');

      cargarTareas();
      setMensaje('Tarea creada exitosamente');
      setTimeout(() => setMensaje(''), 3000);

    } catch (error) {
      setMensaje('Error al crear la tarea');
    } finally {
      setCargando(false);
    }
  };

  const toggleTarea = async (tareaId, completada) => {
    try {
      const tarea = tareas.find(t => t.id === tareaId);
      if (!tarea) return;

      const tareaActualizada = {
        ...tarea,
        completada: !completada
      };

      await axios.put(`${API_BASE_URL}/tareas/${tareaId}`, tareaActualizada);
      cargarTareas();

    } catch (error) {
      setMensaje('Error al actualizar la tarea');
    }
  };

  const eliminarTarea = async (tareaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/tareas/${tareaId}`);
      cargarTareas();
      setMensaje('Tarea eliminada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al eliminar la tarea');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1>
              <span className="icon">📋</span>
              Gestor de Proyectos
            </h1>
            <div className={`status-indicator ${conexionOK ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span>{conexionOK ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
        </header>

        {!conexionOK && (
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h3>Sin conexión al servidor</h3>
            <p>Verifica que el servidor Flask esté ejecutándose en el puerto 5001</p>
            <button onClick={verificarConexion} className="retry-btn">
              Reintentar conexión
            </button>
          </div>
        )}

        {conexionOK && (
          <div className="main-content">
            <div className="selection-panel">
              <div className="selection-row">
                <div className="selector-group">
                  <label>👤 Usuario</label>
                  <div className="selector-container">
                    <select
                      value={usuarioSeleccionado}
                      onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                      disabled={cargando}
                    >
                      <option value="">Seleccionar usuario</option>
                      {usuarios.map(usuario => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="add-btn"
                      onClick={() => setMostrarFormUsuario(!mostrarFormUsuario)}
                      title="Añadir usuario"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="selector-group">
                  <label>📁 Proyecto</label>
                  <div className="selector-container">
                    <select
                      value={proyectoSeleccionado}
                      onChange={(e) => setProyectoSeleccionado(e.target.value)}
                      disabled={!usuarioSeleccionado || cargando}
                    >
                      <option value="">Seleccionar proyecto</option>
                      {proyectos.map(proyecto => (
                        <option key={proyecto.id} value={proyecto.id}>
                          {proyecto.nombre}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="add-btn"
                      onClick={() => setMostrarFormProyecto(!mostrarFormProyecto)}
                      disabled={!usuarioSeleccionado}
                      title="Añadir proyecto"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="selector-group">
                  <label>📝 Lista</label>
                  <div className="selector-container">
                    <select
                      value={listaSeleccionada}
                      onChange={(e) => setListaSeleccionada(e.target.value)}
                      disabled={!proyectoSeleccionado || cargando}
                    >
                      <option value="">Seleccionar lista</option>
                      {listas.map(lista => (
                        <option key={lista.id} value={lista.id}>
                          {lista.nombre}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="add-btn"
                      onClick={() => setMostrarFormLista(!mostrarFormLista)}
                      disabled={!proyectoSeleccionado}
                      title="Añadir lista"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {mostrarFormUsuario && (
              <div className="form-card">
                <h3>➕ Crear Usuario</h3>
                <form onSubmit={crearUsuario}>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={nuevoUsuario.nombre}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={nuevoUsuario.email}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={nuevoUsuario.contraseña}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, contraseña: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">Crear Usuario</button>
                    <button type="button" onClick={() => setMostrarFormUsuario(false)} className="cancel-btn">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mostrarFormProyecto && usuarioSeleccionado && (
              <div className="form-card">
                <h3>➕ Crear Proyecto</h3>
                <form onSubmit={crearProyecto}>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Nombre del proyecto"
                      value={nuevoProyecto.nombre}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombre: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Descripción"
                      value={nuevoProyecto.descripcion}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">Crear Proyecto</button>
                    <button type="button" onClick={() => setMostrarFormProyecto(false)} className="cancel-btn">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mostrarFormLista && proyectoSeleccionado && (
              <div className="form-card">
                <h3>➕ Crear Lista</h3>
                <form onSubmit={crearLista}>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Nombre de la lista"
                      value={nuevaLista.nombre}
                      onChange={(e) => setNuevaLista({...nuevaLista, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">Crear Lista</button>
                    <button type="button" onClick={() => setMostrarFormLista(false)} className="cancel-btn">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {listaSeleccionada && (
              <div className="task-section">
                <div className="form-card">
                  <h3>➕ Nueva Tarea</h3>
                  <form onSubmit={crearTarea}>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Nombre de la tarea"
                        value={nombreTarea}
                        onChange={(e) => setNombreTarea(e.target.value)}
                        required
                      />
                      <input
                        type="date"
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                      />
                    </div>
                    <textarea
                      placeholder="Descripción (opcional)"
                      value={descripcionTarea}
                      onChange={(e) => setDescripcionTarea(e.target.value)}
                      rows="2"
                    />
                    <div className="form-actions">
                      <button type="submit" disabled={cargando} className="submit-btn">
                        {cargando ? 'Creando...' : 'Crear Tarea'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="tasks-container">
                  <div className="tasks-header">
                    <h3>📋 Tareas ({tareas.length})</h3>
                    <div className="tasks-stats">
                      <span className="stat">
                        ✅ {tareas.filter(t => t.completada).length} completadas
                      </span>
                      <span className="stat">
                        ⏳ {tareas.filter(t => !t.completada).length} pendientes
                      </span>
                    </div>
                  </div>

                  {tareas.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <p>No hay tareas en esta lista</p>
                      <small>Crea tu primera tarea usando el formulario de arriba</small>
                    </div>
                  ) : (
                    <div className="tasks-grid">
                      {tareas.map(tarea => (
                        <div key={tarea.id} className={`task-card ${tarea.completada ? 'completed' : ''}`}>
                          <div className="task-header">
                            <h4 className={tarea.completada ? 'completed-text' : ''}>
                              {tarea.nombre}
                            </h4>
                            <div className="task-actions">
                              <button
                                onClick={() => toggleTarea(tarea.id, tarea.completada)}
                                className={`toggle-btn ${tarea.completada ? 'completed' : ''}`}
                                title={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
                              >
                                {tarea.completada ? '✅' : '⭕'}
                              </button>
                              <button
                                onClick={() => eliminarTarea(tarea.id)}
                                className="delete-btn"
                                title="Eliminar tarea"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          {tarea.descripción && (
                            <p className="task-description">{tarea.descripción}</p>
                          )}
                          
                          {tarea.vencimiento && (
                            <div className="task-due-date">
                              <span className="due-icon">📅</span>
                              <span>{new Date(tarea.vencimiento).toLocaleDateString('es-ES')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mensaje && (
          <div className={`message ${mensaje.includes('Error') || mensaje.includes('error') ? 'error' : 'success'}`}>
            <div className="message-content">
              <span className="message-icon">
                {mensaje.includes('Error') || mensaje.includes('error') ? '❌' : '✅'}
              </span>
              <span>{mensaje}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;