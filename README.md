# Juego de Memoria — IF7102 Multimedios

Proyecto Personal · UCR Sede Guanacaste · I Ciclo 2026

**Framework:** Vue 3 + Vite  
**Opción:** 5 — Juego Educativo de Un Nivel  
**Tipo:** Juego de memoria con pares imagen-audio

---

## Descripción

_[Describir brevemente el tema del juego aquí]_

---

## Capturas de pantalla

_[Agregar capturas de las tres pantallas: inicio, juego y resultado]_

---

## Instalación y ejecución

```sh
pnpm install
pnpm dev
```

El proyecto corre en `http://localhost:5173` por defecto.

---

## Estructura del proyecto

```
src/
├── assets/
│   └── main.css            # Variables CSS y estilos globales
├── components/
│   ├── StartScreen.vue     # Pantalla de inicio
│   ├── GameBoard.vue       # Tablero del juego con temporizador
│   ├── MemoryCard.vue      # Carta individual (reutilizable)
│   ├── ResultScreen.vue    # Pantalla de resultados
│   └── AudioPlayer.vue     # Reproductor de audio (reutilizable)
├── App.vue                 # Raíz: maneja estado global y navegación entre pantallas
└── main.js                 # Entrada de la app

public/
├── data/
│   └── cards.json          # Datos del juego (cargados con fetch)
├── audio/                  # Efectos de sonido (.mp3)
└── images/                 # Imágenes de las cartas
```

---

## Medios incluidos

| Archivo | Descripción | Licencia |
|---|---|---|
| _Por completar_ | | |

---

Estudiante: Aaron Salazar Mata
