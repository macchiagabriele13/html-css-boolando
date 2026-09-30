# Hitster di Gabri e Carla

Web app pubblicata su https://hitster-gabri-carla.netlify.app (progetto Netlify `hitster-gabri-carla`).

- `public/` — l'app (pagina, canzoni in `data.js`, icone, manifest, service worker per l'installazione)
- `netlify/functions/room.mts` — partite online da 2 a 6 giocatori (sala d'attesa, poi turni a giro): `GET /api/room?code=ABCD`, `POST /api/room` con `op: create | update`
- `netlify/functions/played.mts` — canzoni già uscite condivise tra i telefoni: `GET/POST /api/played`
- I dati sono salvati in Netlify Blobs (store `hitster`).

Per pubblicare, fare il deploy di questa cartella sul progetto Netlify esistente: contiene sia l'app sia le funzioni, quindi un deploy senza questa cartella completa disattiva la modalità online.
