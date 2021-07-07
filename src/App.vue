<template>
	<div class="row">
		<div class="col-sm-12 col-md-7" style="border: 1px solid blue">
			<Search @search="performSearch" textValue=""></Search>
			<div class="pokemon-list">
				<div :key="pokemon" v-for="pokemon in filteredPokemon">
					<router-link
						v-bind:to="{
							name: 'Pokemon',
							params: { name: pokemon.name },
						}"
						>{{ pokemon.name }}</router-link
					>
					<img v-bind:src="pokemon.url" loading="lazy" />
				</div>
			</div>
		</div>
		<div class="col-sm-12 col-md-5" style="border: 1px solid green">
			<router-view />
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue'
import Search from './components/Search.vue'

export default defineComponent({
	name: 'App',
	components: {
		Search,
	},
	data() {
		return {
			pokemons: ['pikatchu'],
			filterText: '',
		}
	},
	computed: {
		filteredPokemon() {
			if (this.filterText.length > 0) {
				return this.pokemons.filter(pokemon => {
					return pokemon.name.indexOf(this.filterText) > -1
				})
			}
			return this.pokemons
		},
	},
	methods: {
		performSearch(val) {
			console.log('input changed', val)
			this.filterText = val
		},
	},
	mounted() {
		fetch('https://pokeapi.co/api/v2/pokemon?limit=40&offset=20')
			.then(response => {
				return response.json()
			})
			.then(json => {
				console.log('fetched', json)
				let count = 1
				this.pokemons = json.results.map(pokemon => {
					return {
						index: count,
						url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${count++}.png`,
						name: pokemon.name,
					}
				})
			})
		this.pokemons = ['relaxo', 'albert']
	},
})
</script>

<style>
.detail-view {
	/* border: 2px solid fuchsia !important; */
	top: 0px;
	bottom: 0px;
	overflow: scroll;
	padding-right: 20px;
	margin-right: 10px;
}

@media screen and (max-width: 767px) {
	.detail-view {
		overflow: scroll;
		background-color: white; /* rgba(255, 255, 255, 0.4); */
		position: fixed;
		top: 0px !important;
		left: 0px;
		bottom: 0px;
		right: 0px;
		padding: 20px;
	}
}
</style>
