const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>App Responsive con Tailwind</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 text-gray-800 font-sans">
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-6 sm:p-10 rounded-lg shadow-lg text-center">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Hola desde Express + Tailwind</h1>
          <button id="miBoton" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition">
            Haz clic aquí
          </button>
          <p id="mensaje" class="mt-4 text-lg text-green-600 font-medium"></p>
        </div>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const boton = document.getElementById('miBoton');
          const mensaje = document.getElementById('mensaje');

          boton.addEventListener('click', () => {
            mensaje.textContent = '¡Has hecho clic en el botón!';
          });
        });
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(\`Servidor corriendo en http://localhost:\${PORT}\`);
});
