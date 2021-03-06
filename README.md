# MiniDex

[![Preview image on desktop](https://user-images.githubusercontent.com/581540/126909756-8e85c098-28f7-46a4-9ea3-09429a77eba0.png)](https://minidex.onrender.com)

Simplistic Pokedex implementation using Vue.js, TypeScript and pokeapi.co.

A small side project by Thomas Jirout ([_schiru](https://twitter.com/_schiru)) to experiment with Vue.js.

**View it here: [minidex.onrender.com](https://minidex.onrender.com)**

## What it does
- Shows a list of pokemon
- User can select pokemon to view details (stats, abilities, evolutions,
moves)
- User can filter pokemon by name

## Technologies

- [TypeScript](https://www.typescriptlang.org/)
- [Vue.js](https://vuejs.org) v3
- [Vue.js router](https://router.vuejs.org/) v4
- [Bootstrap](https://getbootstrap.com/) v5
- Tests using [jest](https://jestjs.io/)
- [pokeapi.co](https://pokeapi.co) used as backend
- [pokeapi-js-wrapper](https://github.com/PokeAPI/pokeapi-js-wrapper) for automatic caching of API responses

## Features
- Responsive design
- Static page, no backend server required
- Prepared for i18n (visible pokemon data language currently controlled in Constants.ts)
- By using [pokeapi-js-wrapper](https://github.com/PokeAPI/pokeapi-js-wrapper), API responses are cached to improve performance over time
- In order to reduce the number of requests necessary to load the initial list of pokemon, this data is provided in a static file (pokedex_minimal.json.min). The file is only used for showing the Pokemon list - details about the user's selected Pokemon (abilities, etc.) are still fetched directly from the API when needed.


## Possible Improvements
- Add backend server that pre-fetches, caches and bundles data into one request to improve performance
- SEO
- Split UI into vue smaller components
- NPM dependency audit (`npm audit`) showed that dependencies contained 9 moderate severity vulnerabilities

## Project setup
Make sure Node.js and npm is installed (comes bundled) (tested with nodejs v14.17.3 and npm v6.14.13).

```
npm install
```

### Run during development
```
npm run serve
```

### Run Jest Tests
```
npm t
```

### Build for production
```
npm run build
```

This will create a ready-to-be-hosted app in the `dist` folder.

### Lint and fix files
```
npm run lint
```

# Licence

MIT (see [LICENCE](LICENCE))
