# Coliseum

Una experiencia interactiva para descubrir la arquitectura y la historia del Coliseo de Roma. El desplazamiento controla una escena tridimensional continua: la fachada, las galerías, el graderío, el velarium y la maquinaria del hipogeo.

**[Abrir la experiencia](https://arcas0803.github.io/coliseum/)**

## Características

- Catorce capítulos con fechas y fuentes históricas enlazadas.
- Corte arquitectónico, cubierta desplegable y montacargas animados.
- Navegación mediante scroll, teclado e indicadores de capítulo.
- Modo claro y oscuro con preferencia persistente.
- Diseño adaptable y soporte para movimiento reducido.
- Geometría procedural con Three.js y página estática con Astro.

## Desarrollo

Requiere Node.js 24 y npm.

```sh
npm ci
npm run dev
```

| Comando | Función |
| --- | --- |
| `npm run check` | Comprobar los tipos de TypeScript |
| `npm run build` | Generar la web estática en `dist/` |
| `npm run preview` | Revisar la compilación localmente |

## Estructura

- `src/lib/architecture-world.ts`: geometría y renderizado.
- `src/lib/tour.ts`: encuadres y coreografía del recorrido.
- `src/lib/experience.ts`: navegación, contenido y tema.
- `src/lib/historical-copy.ts`: textos y fuentes por capítulo.
- `src/styles/experience.css`: presentación y adaptación a pantallas.

## Publicación

Cada cambio en `main` ejecuta la comprobación de tipos, compila la web y la despliega en GitHub Pages. El flujo también puede iniciarse manualmente desde Actions. No necesita claves ni servicios externos.

La compilación en GitHub utiliza `/coliseum/` como ruta base. Para reproducirla localmente:

```sh
GITHUB_ACTIONS=true npm run build
npm run preview -- --base /coliseum
```

## Fuentes y alcance

Las referencias históricas proceden del [Parco archeologico del Colosseo](https://colosseo.it/en/area/colosseo/) y se enlazan junto a cada explicación. La ilustración publicada en [Arkiplus](https://www.arkiplus.com/el-coliseo-romano) sirvió como referencia visual del corte; la web construye la geometría y no distribuye esa imagen.

La maqueta es didáctica: combina elementos de distintas etapas y simplifica galerías, cimentación y maquinaria. La apertura completa de la arena permite estudiar el subsuelo y no representa una maniobra histórica. No constituye una restitución arqueológica exacta.

La exploración inicial tomó como referencia [Anatomy](https://github.com/wheresryan22/anatomy). El renderizador publicado utiliza Three.js. La tipografía [Cinzel](https://fonts.google.com/specimen/Cinzel), de Natanael Gama, se distribuye a través de Fontsource bajo la SIL Open Font License; las dependencias mantienen sus respectivas licencias.
