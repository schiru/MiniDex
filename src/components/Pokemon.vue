<template>
  <div class="detail-view position-fixed" id="pokemon">
    <router-link to="/" style="position: sticky">Hide</router-link>
    <h1>{{ $route.params.name }} (#{{ rawInfo.order }})</h1>
    <h1 v-if="error == true">I've got no pokemon for you today</h1>
    <article v-else>
      Abilities:
      <ul
        v-bind:key="ability.ability.name"
        v-for="ability in rawInfo.abilities"
      >
        <li>{{ ability.ability.name }}</li>
      </ul>

      Types:
      <ul v-bind:key="type" v-for="type in rawInfo.types">
        <li>{{ type.slot }} {{ type.type.name }}</li>
      </ul>

      Stats:
      <ul v-bind:key="stat" v-for="stat in rawInfo.stats">
        <li>
          {{ stat.stat.name }}, base: {{ stat.base_stat }}, effor:
          {{ stat.effort }}
        </li>
      </ul>

      <a
        class="btn btn-primary"
        data-bs-toggle="collapse"
        href="#collapseExample"
        role="button"
        aria-expanded="false"
        aria-controls="collapseExample"
      >
        Show/Hide Moves
      </a>
      <ul
        class="collapse"
        id="collapseExample"
        v-bind:key="move.move.name"
        v-for="move in rawInfo.moves"
      >
        <li>{{ move.move.name }}</li>
      </ul>
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      info: "",
      rawInfo: {
        order: 42,
        abilities: [
          {
            ability: {
              name: "overgrow",
              url: "https://pokeapi.co/api/v2/ability/65/",
            },
            is_hidden: false,
            slot: 1,
          },
        ],
        types: [
          {
            slot: 1,
            type: { name: "bug", url: "https://pokeapi.co/api/v2/type/7/" },
          },
        ],
        stats: [
          {
            base_stat: 45,
            effort: 0,
            stat: { name: "hp", url: "https://pokeapi.co/api/v2/stat/1/" },
          },
        ],
        moves: [
          {
            move: {
              name: "mega-punch",
              url: "https://pokeapi.co/api/v2/move/5/",
            },
          },
        ],
      },
      error: false,
    };
  },
  computed: {
    test() {
      return "bla blu";
    },
  },
  methods: {
    fetch_pokemon(name) {
      if (typeof name !== "string") {
        return;
      }

      let baseUrl = "https://pokeapi.co/api/v2/pokemon/";
      let pokemonUrl = baseUrl + name;

      fetch(pokemonUrl)
        .then((response) => {
          console.log(response);

          if (response.status != 200) {
            this.error = true;
            throw "could not fetch pokemon";
          } else {
            this.error = false;
          }

          return response.json();
        })
        .then((json) => {
          console.log("fetched pokemon", json);
          this.info = JSON.stringify(json);
          this.rawInfo = json;
        });

      let poke = document.querySelector("#pokemon");
      poke.scrollTop = 0;
    },
  },
  watch: {
    $route(to, from) {
      from;

      this.fetch_pokemon(to.params.name);
    },
  },
  mounted() {
    this.fetch_pokemon(this.$route.params.name);
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
