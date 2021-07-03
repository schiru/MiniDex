<template>
  <Search @search="performSearch" textValue=""></Search>
  <ul>
    <li :key="pokemon" v-for="pokemon in filteredPokemon">
      {{ pokemon.name }}
      <img v-bind:src="pokemon.url" loading="lazy" />
    </li>
  </ul>
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
        console.log(json);
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
