import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Users, Type, Clock, AlertCircle } from "lucide-react";
import { createRoom } from "../services/roomService";
import { useToast } from "../hooks/useToast";

const FormCrearSala = () => {
    const navigate = useNavigate();
    const { error: showError, success: showSuccess } = useToast();
    const [formData, setFormData] = useState({
        titulo: "",
        habilidad: "",
        capacidad_maxima: 10,
        duracion: 60,
        descripcion: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cap = parseInt(formData.capacidad_maxima);

        // Validaciones solicitadas
        if (cap < 2) {
            showError("El cupo mínimo debe ser de 2 personas (sin contar al mentor).");
            return;
        }
        if (cap > 10) {
            showError("El límite máximo por sala es de 10 personas.");
            return;
        }

        try {
            await createRoom(formData);
            showSuccess("¡Sala creada exitosamente!");
            navigate("/salas-activas");
        } catch (error) {
            console.error("Error creating room:", error);
            showError(error.message || "No se pudo crear la sala.");
        }
    };

    return (
        <div className="form-crear-sala-container">
            <form className="formulario-sala" onSubmit={handleSubmit}>
                <div className="input-group-neon">
                    <label htmlFor="titulo">Título de la sala</label>
                    <div className="input-wrapper">
                        <Type className="input-icon" size={20} />
                        <input type="text" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej: React Avanzado" required />
                    </div>
                </div>

                <div className="input-group-neon">
                    <label htmlFor="habilidad">Habilidad</label>
                    <div className="input-wrapper">
                        <Book className="input-icon" size={20} />
                        <input type="text" id="habilidad" name="habilidad" value={formData.habilidad} onChange={handleChange} placeholder="Ej: Programación" required />
                    </div>
                </div>

                <div className="input-group-neon">
                    <label htmlFor="capacidad_maxima">Capacidad de Estudiantes (Min 2 - Max 10)</label>
                    <div className="input-wrapper">
                        <Users className="input-icon" size={20} />
                        <input 
                            type="number" 
                            id="capacidad_maxima" 
                            name="capacidad_maxima" 
                            value={formData.capacidad_maxima} 
                            onChange={handleChange} 
                            min="2" 
                            max="10"
                            required 
                        />
                    </div>
                    <small className="input-hint">El mentor no cuenta en este límite.</small>
                </div>

                <div className="form-action-right">
                    <button type="submit" className="primary-btn-neon btn-crear-sala">Crear Sala</button>
                </div>
            </form>
        </div>
    );
};

export default FormCrearSala;