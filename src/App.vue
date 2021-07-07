<template>
	<div class="row">
		<div class="col-sm-12 col-md-7">
			<h1>MiniDex</h1>
			<Search @search="performSearch" textValue=""></Search>
			<div id="pokemon-list">
				<div
					class="pokemon-list-item"
					:key="pokemon"
					v-for="pokemon in filteredPokemon"
				>
					<img v-bind:src="pokemon.url" loading="lazy" />

					<router-link
						v-bind:to="{
							name: 'Pokemon',
							params: { name: pokemon.identifierName },
						}"
						>{{ pokemon.name }}</router-link
					>
				</div>
			</div>
		</div>
		<div id="sidebar" class="col-sm-12 col-md-5">
			<router-view />
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue'
import MiniPokedexAPI from './api/MiniPokedexAPI'
import Search from './components/Search.vue'

export default defineComponent({
	name: 'App',
	components: {
		Search,
	},
	data() {
		return {
			pokemons: [],
			filterText: '',
			api: new MiniPokedexAPI(),
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
		fetch('https://pokeapi.co/api/v2/pokemon?limit=100&offset=60')
			.then(response => {
				return response.json()
			})
			.then(json => {
				console.log('fetched', json)
				const _this = this
				json.results.forEach(pokemon => {
					this.api.getBasicInfo(pokemon.name).then(info => {
						_this.pokemons.push({
							// index: count,
							url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${info.species.id}.png`,
							name: info.species.names[5].name,
							identifierName: pokemon.name,
						})
					})
				})
			})
	},
})
</script>

<style>
#pokemon-list {
	display: flex;
	flex-wrap: wrap;
}

.pokemon-list-item {
	flex-basis: 33%;
}

.pokemon-list-item img {
	width: 48px;
	height: 48px;
	margin: 5px;
}

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

	.pokemon-list-item {
		flex-basis: 100%;
	}
}
</style>
