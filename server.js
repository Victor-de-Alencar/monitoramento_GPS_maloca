const express = require("express");

const app = express();

let gpsData = { lat: 0, lon: 0 }; // Última localização
let routeHistory = []; // Histórico da rota
let outBounds = false;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Localização da Ambulância</title>
        <meta http-equiv="refresh" content="5">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map;
          var marker;
          var outBounds = ${outBounds}; // Variável que indica se está fora da área

          var polyline;

          function initMap() {
            var location = { lat: ${gpsData.lat}, lon: ${gpsData.lon} };
            var routeHistory = ${JSON.stringify(routeHistory)}; // Histórico da rota
            
            // Inicializa o mapa
            map = L.map('map').setView(location, 15);
            
            // Usa o OpenStreetMap como camada base
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Se o marcador já existir, remova-o
            if (marker) {
              marker.remove();
            }

            // Adiciona um marcador no mapa
            marker = L.marker(location).addTo(map)
              .bindPopup("<b>Localização Atual da Ambulância</b>")
              .openPopup();

            
            // Se a ambulância estiver fora da área, exibe um alerta na página
            if (outBounds) {
              alert("ALERTA: Ambulância fora da área!");
            }
          }

          // Chama a função de inicialização do mapa assim que a página carregar
          window.onload = initMap;
        </script>
      </head>
      <body>
        <h1>Localização Atual</h1>
        <p>Latitude: ${gpsData.lat}</p>
        <p>Longitude: ${gpsData.lon}</p>
        <p><strong>${outBounds ? "ALERTA: Ambulância fora da área!" : "Ambulância dentro da área."}</strong></p>
        <a href="https://www.openstreetmap.org/?mlat=${gpsData.lat}&mlon=${gpsData.lon}#map=15/${gpsData.lat}/${gpsData.lon}" target="_blank">Abrir no OpenStreetMap</a>]
        <div id="map" style="width: 100%; height: 500px;"></div>
      </body>
    </html>
  `);
});

app.get("/checkbounds", (req, res) => {
  if (req.query.out !== undefined) { // Verifica se o parâmetro 'out' foi passado
    let out = req.query.out === "true"; // Converte o valor para booleano
    outBounds = out; // Atualiza a variável 'outBounds'
    console.log(`Status de fora da área: ${outBounds ? "Fora da área" : "Dentro da área"}`);
    res.send(`Status de fora da área atualizado para: ${outBounds ? "Fora da área" : "Dentro da área"}`);
  } else {
    res.status(400).send("Erro: O parâmetro 'out' não foi passado.");
  }
});

app.get("/update", (req, res) => {
  if (req.query.lat && req.query.lon) {
    let lat = parseFloat(req.query.lat);
    let lon = parseFloat(req.query.lon);
    
    gpsData = { lat, lon }; // Atualiza a posição atual
    routeHistory.push([lat, lon]); // Armazena no histórico da rota
    console.log(`Nova localização: ${lat}, ${lon}`);
    
    res.send(`Localização atualizada e armazenada na rota! ${gpsData.lat} e ${gpsData.lon}`);
  } else {9
    res.send("Erro: Passe os parâmetros lat e lon.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));