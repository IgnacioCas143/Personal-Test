// Actualización del DOM ocultando y mostrando contenido
function updateDOM(tabId, targetBtn) {
    // Retiro de clases activas en paneles
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    // Retiro de clases activas en botones
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    // Asignación de clases activas al objetivo
    document.getElementById(tabId).classList.add('active');
    targetBtn.classList.add('active');
    
    // Regreso del scroll a la posición inicial al cambiar de vista
    document.getElementById('app-content').scrollTo(0, 0);
}


function navigate(tabId, event) {
    const targetBtn = event.currentTarget;

    if (!document.startViewTransition) {
        updateDOM(tabId, targetBtn);
        return;
    }

    document.startViewTransition(() => updateDOM(tabId, targetBtn));
}

document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabId = btn.dataset.tab;
        navigate(tabId, e);
    });
});

document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const subTabId = btn.dataset.subtab;
        switchSubTab(subTabId, btn);
    });
});
function updateSubDOM(subTabId, targetBtn) {
    const container = document.querySelector('#inicio .toggle-box');
    const buttons = container.querySelectorAll('.toggle-btn');
    const indicator = container.querySelector('.toggle-indicator');

    // Quitar activos
    document.querySelectorAll('#inicio .sub-view')
        .forEach(v => v.classList.remove('active'));

    buttons.forEach(b => b.classList.remove('active'));

    // Activar seleccionados
    document.getElementById(subTabId).classList.add('active');
    targetBtn.classList.add('active');

    // 🔥 Mover indicador
    const index = Array.from(buttons).indexOf(targetBtn);

    indicator.style.width = `${95 / buttons.length}%`;
    indicator.style.transform = `translateX(${index * 105}%)`;
}



// Posicionar indicador al cargar
window.addEventListener('DOMContentLoaded', () => {
    const activeBtn = document.querySelector('#inicio .toggle-btn.active');

    if (activeBtn) {
        const onclickAttr = activeBtn.getAttribute('onclick');
        const match = onclickAttr.match(/'([^']+)'/);

        if (match) {
            updateSubDOM(match[1], activeBtn);
        }
    }
});

// Función para ejecutar la transición Morph en los botones superiores
function switchSubTab(subTabId, targetBtn) {
    // Validación de soporte de la API View Transitions
    if (!document.startViewTransition) {
        updateSubDOM(subTabId, targetBtn);
        return;
    }

    // Ejecución de la animación nativa al cambiar de sub-vista
    document.startViewTransition(() => updateSubDOM(subTabId, targetBtn));
}

function updatehora(){    
    const relojnum = document.getElementById('reloj')

    if (relojnum) {
        const now= new Date();
        
        let hora = now.getHours();
        let minutos = now.getMinutes();
        const ampm = hora >= 12 ? ' p.m.':' a.m.';
        hora = hora % 12;
        hora = hora ? hora : 12;
        const minutosFormateados = minutos < 10 ? '0' + minutos : minutos;

        relojnum.textContent = hora + ':' + minutosFormateados +ampm;
    }

}
updatehora();
setInterval(updatehora, 60000);