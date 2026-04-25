/**
 * Utilidad para ofuscar IDs numéricos en las URLs.
 * Esto no es una encriptación de grado militar, pero cumple con el objetivo
 * de ocultar los IDs secuenciales de la base de datos en la barra del navegador.
 */

// Una pequeña clave para hacer el base64 un poco menos obvio
const SALT = "aura-skill-v1";

/**
 * Codifica un ID numérico a una cadena alfanumérica
 */
export const encodeId = (id) => {
  if (!id) return null;
  try {
    // Convertimos a string y añadimos un prefijo sutil antes de pasar a Base64
    const str = `${SALT}:${id}`;
    return btoa(str).replace(/=/g, ""); // Quitamos los padding '=' para que se vea más limpio
  } catch (e) {
    return id;
  }
};

/**
 * Decodifica una cadena ofuscada de vuelta al ID original
 */
export const decodeId = (encodedId) => {
  if (!encodedId) return null;
  try {
    // Restauramos el Base64 y decodificamos
    const decoded = atob(encodedId);
    const parts = decoded.split(":");
    
    // Verificamos que tenga nuestro SALT y devolvemos el ID
    if (parts[0] === SALT) {
      return parts[1];
    }
    return encodedId; // Si no tiene el SALT, devolvemos el original por si acaso
  } catch (e) {
    return encodedId;
  }
};
