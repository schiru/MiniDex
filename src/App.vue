<template>
  <div class="row">
    <div class="col">
      <Search @search="performSearch" textValue=""></Search>
      <ul>
        <li :key="pokemon" v-for="pokemon in filteredPokemon">
          <router-link
            v-bind:to="{ name: 'Pokemon', params: { name: pokemon.name } }"
            >{{ pokemon.name }}</router-link
          >
          <img v-bind:src="pokemon.url" loading="lazy" />
        </li>
      </ul>
    </div>
    <div class="col">
      Router content:
      <router-view />
    </div>
  </div>
</template>

<script>
import Search from "./components/Search.vue";

export default {
  name: "App",
  components: {
    Search,
  },
  data() {
    return {
      pokemons: ["pikatchu"],
      filterText: "",
    };
  },
  computed: {
    filteredPokemon() {
      if (this.filterText.length > 0) {
        return this.pokemons.filter((pokemon) => {
          return pokemon.name.indexOf(this.filterText) > -1;
        });
      }
      return this.pokemons;
    },
  },
  methods: {
    performSearch(val) {
      console.log("input changed", val);
      this.filterText = val;
    },
  },
  mounted() {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=0")
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        console.log("fetched", json);
        let count = 1;
        this.pokemons = json.results.map((pokemon) => {
          return {
            index: count,
            url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${count++}.png`,
            name: pokemon.name,
          };
        });
      });
    this.pokemons = ["relaxo", "albert"];
  },
};
</script>

<style>
</style>
