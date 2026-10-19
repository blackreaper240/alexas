// Reemplaza con tu número real de WhatsApp con código de país
const TELEFONO_WHATSAPP = "50589060210";

// Lógica de colores según el color del producto y el tema activo (Claro u Oscuro)
function obtenerColorResplandor(titulo, tema) {
  const t = titulo.toLowerCase();

  // 1. Producto Lavanda (Efecto morado/lavanda)
  if (t.includes("lavanda")) {
    return "rgba(167, 139, 250, 0.55)";
  }

  // 2. Producto Verde Teal (Efecto turquesa/verde)
  if (t.includes("verde") || t.includes("teal")) {
    return "rgba(45, 212, 191, 0.55)";
  }

  // 3. Productos Blancos (Echo Show 5 Blanco)
  if (t.includes("blanco")) {
    return tema === "light" 
      ? "rgba(75, 85, 99, 0.35)" 
      : "rgba(255, 255, 255, 0.45)";
  }

  // 4. Todos los productos Negros (incluyendo Echo Dot con Reloj, Echo Show Negro, etc.)
  return tema === "light" 
    ? "rgba(0, 0, 0, 0.45)" 
    : "rgba(100, 116, 139, 0.45)";
}

// Actualiza las variables de color en todas las tarjetas de la pantalla
function actualizarResplandorTarjetas() {
  const temaActual = document.documentElement.getAttribute("data-theme") || "light";
  const tarjetas = document.querySelectorAll(".card-portfolio");

  tarjetas.forEach(card => {
    const titulo = card.getAttribute("data-titulo") || "";
    const colorGlow = obtenerColorResplandor(titulo, temaActual);
    card.style.setProperty("--glow-color", colorGlow);
  });
}

function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme") || "light";

  document.documentElement.setAttribute("data-theme", savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";

      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      
      // Recalcular los efectos de los productos blancos y negros al cambiar de tema
      actualizarResplandorTarjetas();
    });
  }
}

// --- Efecto de Texto Dinámico (Typing Effect) ---
function initTypingEffect() {
  const typedTextSpan = document.getElementById("typed-text");
  if (!typedTextSpan) return;

  const frases = [
    "Diseño, Estilo & Elegancia",
    "Tu Hogar Conectado"
  ];

  let fraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typingSpeed = 100;    // Velocidad al escribir (ms)
  const deletingSpeed = 50;   // Velocidad al borrar (ms)
  const delayNext = 2000;     // Tiempo de espera al completar la frase (ms)

  function type() {
    const currentFrase = frases[fraseIndex];

    if (isDeleting) {
      typedTextSpan.textContent = currentFrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedTextSpan.textContent = currentFrase.substring(0, charIndex + 1);
      charIndex++;
    }

    let currentSpeed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentFrase.length) {
      currentSpeed = delayNext;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      fraseIndex = (fraseIndex + 1) % frases.length;
      currentSpeed = 500;
    }

    setTimeout(type, currentSpeed);
  }

  type();
}

async function cargarProductos() {
  try {
    const respuesta = await fetch("data/productos.json");
    const productos = await respuesta.json();
    const contenedor = document.getElementById("grid-productos");

    if (!contenedor) return;
    contenedor.innerHTML = "";

    const temaInicial = document.documentElement.getAttribute("data-theme") || "light";

    productos.forEach((producto, index) => {
      const urlImagen = producto.imagen_url;
      const mensajeWA = encodeURIComponent(`Hola, estoy interesado en consultar sobre el dispositivo ${producto.titulo}.`);
      const urlWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensajeWA}`;

      const colorGlow = obtenerColorResplandor(producto.titulo, temaInicial);

      const listaSpecs = producto.especificaciones
        ? producto.especificaciones.map(spec => `<li>✓ ${spec}</li>`).join("")
        : "";

      const card = document.createElement("div");
      card.className = "card-portfolio";
      card.setAttribute("data-titulo", producto.titulo);
      card.style.animationDelay = `${index * 0.08}s`;
      card.style.setProperty("--glow-color", colorGlow);

      card.innerHTML = `
        <div class="card-image-container">
          <img src="${urlImagen}" alt="${producto.titulo}" loading="lazy" referrerpolicy="no-referrer">
          <div class="badge-tag">Original</div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${producto.titulo}</h3>
          <p class="card-description">${producto.descripcion}</p>
          
          <ul class="card-specs">
            ${listaSpecs}
          </ul>

          <div class="card-footer-info">
            <a href="${urlWhatsApp}" class="btn-action-wa" target="_blank" rel="noopener noreferrer">
              <span>Consultar</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      `;

      // Efecto táctil para móviles (al tocar la pantalla con el dedo)
      card.addEventListener("touchstart", () => {
        document.querySelectorAll(".card-portfolio").forEach(c => c.classList.remove("active-touch"));
        card.classList.add("active-touch");
      }, { passive: true });

      contenedor.appendChild(card);
    });

    // Quitar el brillo si se toca en otra parte fuera de las tarjetas en celular
    document.addEventListener("touchstart", (e) => {
      if (!e.target.closest(".card-portfolio")) {
        document.querySelectorAll(".card-portfolio").forEach(c => c.classList.remove("active-touch"));
      }
    }, { passive: true });

  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  cargarProductos();
  initTypingEffect();
});