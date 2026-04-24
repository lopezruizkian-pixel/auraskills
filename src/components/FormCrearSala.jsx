import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import {
  Type,
  Wrench,
  Smile,
  Users,
  AlignLeft,
  Plus,
  Loader,
} from 'lucide-react';
import { createRoom } from '../services/roomService';
import { fetchSkills } from '../services/skillService';
import { useToast } from '../hooks/useToast';
import { validateForm, validators } from '../services/validation';
import AuraSelect from './AuraSelect';
import '../Styles/CrearSala.css';

function FormCrearSala({ onCancel, onSuccess }) {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    habilidad: '',
    mood: '',
    limiteEstudiantes: '',
    descripcion: '',
  });

  const [mySkills, setMySkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkillData, setNewSkillData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Tecnologia',
    nivel: 'basico',
  });
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const userId = storage.get('userId');
      const skills = await fetchSkills({ mentorId: userId });
      setMySkills(skills);
    } catch (err) {
      console.error('Error al cargar mis habilidades:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errors: formErrors } = validateForm(formData, validators.crearSalaForm);

    if (!valid) {
      setErrors(formErrors);
      showError('Por favor, completa todos los campos correctamente');
      return;
    }

    setIsLoading(true);
    try {
      const selectedSkill = mySkills.find(
        (skill) => (skill.id || skill._id) === formData.habilidad
      );

      const roomData = {
        nombre: formData.nombre.trim(),
        skill_id: selectedSkill?.id || selectedSkill?._id || formData.habilidad,
        mood: formData.mood,
        capacidad_maxima: parseInt(formData.limiteEstudiantes, 10),
        descripcion: formData.descripcion.trim(),
      };

      const createdRoom = await createRoom(roomData);
      storage.set('salaActiva', {
        id: createdRoom.id || createdRoom._id,
        titulo: createdRoom.nombre || roomData.nombre,
        habilidad: createdRoom.habilidad || roomData.habilidad,
        mood: createdRoom.mood || roomData.mood,
        capacidad: createdRoom.capacidad_maxima || roomData.capacidad_maxima,
      });

      // Guardar en el historial local para que aparezca inmediatamente
      const currentHistory = storage.get('historialSalas') || [];
      const newHistoryItem = {
        id: createdRoom.id || createdRoom._id,
        nombreSala: createdRoom.nombre || roomData.nombre,
        habilidad: createdRoom.habilidad || roomData.habilidad || selectedSkill?.nombre,
        fecha: new Date().toISOString(),
        mentor: storage.get('userName') || 'Yo',
        duracion: 0
      };
      storage.set('historialSalas', [newHistoryItem, ...currentHistory]);
      showSuccess('Sala creada con exito');
      if (onSuccess) {
        onSuccess(createdRoom);
      } else {
        navigate('/salas-activas');
      }
    } catch (err) {
      showError(err.message || 'Error al crear la sala');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='form-crear-sala-container neon-card'>
      <div className='crear-sala-shell'>
        <section className='crear-sala-form-card'>
          <form className='formulario-sala' onSubmit={handleSubmit}>
            <div className='input-group-neon'>
              <div className='input-label-row'>
                <label htmlFor='room-name'>Nombre de la sala</label>
              </div>
              <div className='input-wrapper'>
                <Type className='input-icon' size={18} />
                <input
                  id='room-name'
                  type='text'
                  name='nombre'
                  placeholder='Ej. Logica de Programacion para principiantes'
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.nombre ? 'input-error' : ''}
                />
              </div>
              {errors.nombre && <span className='error-text'>{errors.nombre}</span>}
            </div>

            <div className='form-row-flex'>
              <div className='input-group-neon'>
                <div className='input-label-row'>
                  <label htmlFor='room-skill'>Habilidad a ensenar</label>
                </div>
                <div className='input-wrapper' style={{ border: "none", padding: 0 }}>
                  <AuraSelect 
                    value={formData.habilidad}
                    onChange={(val) => setFormData(prev => ({ ...prev, habilidad: val }))}
                    options={mySkills.map(hab => ({ value: hab.id || hab._id, label: hab.nombre }))}
                    placeholder="Selecciona una habilidad"
                    icon={Wrench}
                  />
                </div>
                {errors.habilidad && <span className='error-text'>{errors.habilidad}</span>}
              </div>

              <div className='input-group-neon'>
                <div className='input-label-row'>
                  <label htmlFor='room-limit'>Estudiantes</label>
                </div>
                <div className='input-wrapper'>
                  <Users className='input-icon' size={18} />
                  <input
                    id='room-limit'
                    type='number'
                    name='limiteEstudiantes'
                    placeholder='Max. 10'
                    min='1'
                    max='50'
                    value={formData.limiteEstudiantes}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={errors.limiteEstudiantes ? 'input-error' : ''}
                  />
                </div>
                {errors.limiteEstudiantes && <span className='error-text'>{errors.limiteEstudiantes}</span>}
              </div>
            </div>

            <div className='input-group-neon'>
              <div className='input-label-row'>
                <label htmlFor='room-mood'>Mood de la sesion</label>
                <span className='field-optional'>Opcional</span>
              </div>
                <div className='input-wrapper' style={{ border: "none", padding: 0 }}>
                  <AuraSelect 
                    value={formData.mood}
                    onChange={(val) => setFormData(prev => ({ ...prev, mood: val }))}
                    options={[
                      { value: "Concentrado", label: "Concentrado 🧠" },
                      { value: "Relajado", label: "Relajado ☕" },
                      { value: "Energetico", label: "Energetico 🔥" },
                      { value: "Creativo", label: "Creativo 🎨" },
                      { value: "Chill", label: "Chill 🌊" }
                    ]}
                    placeholder="Selecciona el ambiente"
                    icon={Smile}
                  />
                </div>
              {errors.mood && <span className='error-text'>{errors.mood}</span>}
            </div>

            <div className='input-group-neon'>
              <div className='input-label-row'>
                <label htmlFor='room-description'>Descripcion breve</label>
                <span className='field-optional'>Opcional</span>
              </div>
              <div className='input-wrapper is-textarea'>
                <AlignLeft className='input-icon' size={18} />
                <textarea
                  id='room-description'
                  name='descripcion'
                  placeholder='Cuenta en una o dos lineas que aprenderan, que nivel esperas y como llevaras la sesion.'
                  value={formData.descripcion}
                  onChange={handleChange}
                  disabled={isLoading}
                  maxLength={500}
                />
              </div>
              <div className='description-meta'>
                <span className='character-counter'>{formData.descripcion.length}/500</span>
              </div>
            </div>

            <div className='crear-sala-actions'>
              {onCancel && (
                <button type='button' className='secondary-btn-s' onClick={onCancel} disabled={isLoading}>
                  Cancelar
                </button>
              )}
              <button type='submit' className='primary-btn-s submit-btn-wide' disabled={isLoading}>
                {isLoading ? (
                  <div className='submit-btn-content'>
                    <Loader className='aura-spinner-mini' size={20} />
                    <span>Lanzando sala...</span>
                  </div>
                ) : 'Lanzar sala'}
              </button>
            </div>
          </form>
        </section>
      </div>

    </div>
  );
}

export default FormCrearSala;
