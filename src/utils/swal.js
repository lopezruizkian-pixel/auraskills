import Swal from 'sweetalert2';

/**
 * ConfiguraciÃ³n base para SweetAlert2 con estilo Cyber-Luxury de AuraSkill
 */
const AuraSwal = Swal.mixin({
  background: '#0d0d1a',
  color: '#ffffff',
  confirmButtonColor: '#ff00ff', // Magenta neÃ³n
  cancelButtonColor: 'rgba(255, 255, 255, 0.1)',
  customClass: {
    popup: 'aura-swal-popup',
    title: 'aura-swal-title',
    htmlContainer: 'aura-swal-text',
    confirmButton: 'aura-swal-confirm',
    cancelButton: 'aura-swal-cancel',
    icon: 'aura-swal-icon'
  },
  buttonsStyling: true,
  backdrop: `rgba(0,0,0,0.8) backdrop-filter: blur(8px)`
});

/**
 * ConfiguraciÃ³n para notificaciones rÃ¡pidas (Toasts)
 */
export const AuraToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#0d0d1a',
  color: '#ffffff',
  customClass: {
    popup: 'aura-swal-toast-popup',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

export default AuraSwal;
