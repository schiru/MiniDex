<template>
	<div class="row">
		<div class="col-sm-12 col-md-7">
			<header class="row align-items-end">
				<div class="col">
					<h1 style="float: left">MiniDex</h1>
				</div>
				<div class="col-12 col-sm-6 col-lg-5 col-xl-4 pokemon-filter">
					<Search
						@search="performSearch"
						placeholderText="Filter by Name"
						textValue=""
					></Search>
				</div>
			</header>
			<div class="row" id="pokemon-list">
				<router-link
					v-bind:to="{
						name: 'Pokemon',
						params: { name: pokemon.species.name },
					}"
					custom
					:key="pokemon"
					v-for="pokemon in filteredPokemon"
					v-slot="{ navigate }"
				>
					<div
						class="pokemon-list-item"
						v-bind:class="{
							selected: pokemon.species.name == selectedPokemonName,
						}"
						@click="navigate"
					>
						<img v-bind:src="pokemon.sprites.front_default" loading="lazy" />

						{{ localize(pokemon.species.names) }}
						<span class="pokemon-list-item-order-number"
							>#{{ pokemon.orderNumber }}</span
						>
					</div>
				</router-link>
			</div>

			<div id="pokemon-list-bottom-info">
				<p v-if="error">
					An error occurred while fetching Pokemon, please reload the page to
					try again.
				</p>
				<p v-if="!isLoading">Showing {{ pokemonCount }} Pokemon</p>
				<span v-if="isLoading">
					<button
						class="btn btn-warning pokemon-list-loading-button"
						type="button"
						disabled
					>
						<span
							class="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
							v-if="isLoading"
						></span>
						{{ loadingButtonText }}
					</button>
				</span>
			</div>
		</div>
		<div id="sidebar" class="col-sm-12 col-md-5">
			<router-view />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PokedexAPIFactory from './api/PokedexAPIFactory'
import { Name } from '@/api/model'
import Search from './components/Search.vue'
import Constants from './Constants'

export default defineComponent({
	name: 'App',
	components: {
		Search,
	},
	data() {
		return {
			pokemons: [],
			selectedPokemonName: '',
			filterText: '',
			api: PokedexAPIFactory.getPokedexAPI(),
			lang: Constants.lang,
			error: false,
			isLoading: false,
		}
	},
	computed: {
		/**
		 * Important limitation: currently only filters the internal (i.e. english names, not the localization!!)
		 */
		filteredPokemon() {
			if (this.filterText.length > 0) {
				return this.pokemons.filter(pokemon => {
					// all internal names are lowercase -> convert search to lowercase
					let filterTextLowercase = this.filterText.toLowerCase()
					return pokemon.species.name.indexOf(filterTextLowercase) > -1
				})
			}
			return this.pokemons
		},
		loadingButtonText(): string {
			if (this.isLoading) {
				return 'Loading Pokemon...'
			}

			return `Load ${this.loadMoreCount} more`
		},
	},
	methods: {
		localize(names: [Name]): string {
			return this.api.localize(names, this.lang)
		},
		performSearch(val) {
			console.log('input changed', val)
			this.filterText = val
		},
		async fetchPokemon(offset, count) {
			this.isLoading = true
			try {
				this.pokemons = await this.api.getPokemonList(offset, count)
				this.pokemonCount = this.pokemons.length
			} catch (error) {
				console.error('failed to fetch pokemon list, error: ', error)
				this.error = true
			} finally {
				this.isLoading = false
			}
		},
	},
	watch: {
		async pokemonCount(to, from) {
			const diff = to - from
			this.fetchPokemon(from, diff)
		},
		$route(to) {
			const selectedPokemon = to.params.name
			if (typeof selectedPokemon === 'string') {
				this.selectedPokemonName = selectedPokemon
			}
		},
	},
	mounted() {
		this.fetchPokemon(0, this.pokemonCount)
	},
})
</script>

<style scoped>
header {
	margin: 20px 0 15px 0;
	padding-left: 10px;
}

header h1 {
	margin: 0;
	font-size: 3em;
}

.pokemon-filter {
	text-align: right;
	padding: 10px;
}
</style>

<style>
#pokemon-list {
	display: flex;
	flex-wrap: wrap;
	padding-left: 10px;
}

#pokemon-list-bottom-info {
	text-align: center;
	padding: 30px;
}

.pokemon-list-loading-button {
	margin: 10px;
}

.pokemon-list-item {
	flex-basis: 33%;
	border-radius: 10px;
	cursor: pointer;
}

.pokemon-list-item:hover {
	background: #f4f4f4;
}

.pokemon-list-item.selected {
	background: #eee;
}

.pokemon-list-item a {
	color: black;
	text-decoration-line: none;
}

.pokemon-list-item img {
	width: 48px;
	height: 48px;
	margin: 5px;
}

.pokemon-list-item-order-number {
	color: #888;
	padding-left: 8px;
}

.detail-view {
	/* border: 2px solid fuchsia !important; */
	top: 0px;
	bottom: 0px;
	overflow: scroll;
	margin-right: 10px;
	background-color: #f8f8f8; /* rgba(255, 255, 255, 0.4); */
}

@media screen and (max-width: 767px) {
	.detail-view {
		background-color: #fff; /* rgba(255, 255, 255, 0.4); */

		overflow: scroll;
		position: fixed;
		top: 0px !important;
		left: 0px;
		bottom: 0px;
		right: 0px;
		padding: 20px;
	}

	.pokemon-list-item {
		flex-basis: 100% !important;
		font-size: 120%;
	}
}

@media screen and (max-width: 1023px) {
	.pokemon-list-item {
		flex-basis: 50%;
	}
}
</style>
