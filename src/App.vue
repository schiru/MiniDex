<template>
	<div class="row">
		<div class="col-sm-12 col-md-7">
			<h1>MiniDex</h1>
			<Search
				@search="performSearch"
				placeholderText="Filter by Name"
				textValue=""
			></Search>
			<div id="pokemon-list">
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
				<span v-if="!loadedAll && !error">
					<button
						@click="loadMore()"
						class="btn btn-warning pokemon-list-loading-button"
						type="button"
						:disabled="isLoading"
					>
						<span
							class="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
							v-if="isLoading"
						></span>
						{{ loadingButtonText }}
					</button>
					<span v-if="!isLoading">
						<button
							@click="loadAll()"
							class="btn btn-warning pokemon-list-loading-button"
							type="button"
							:disabled="isLoading"
						>
							<span
								class="spinner-border spinner-border-sm"
								role="status"
								aria-hidden="true"
								v-if="isLoading"
							></span>
							Load all (takes a while)
						</button>
					</span>
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
			pokemonCount: 50,
			loadMoreCount: 50,
			api: PokedexAPIFactory.getPokedexAPI(),
			lang: 'de',
			error: false,
			isLoading: false,
			loadedAll: false,
		}
	},
	computed: {
		filteredPokemon() {
			if (this.filterText.length > 0) {
				return this.pokemons.filter(pokemon => {
					return pokemon.species.name.indexOf(this.filterText) > -1
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
		loadMore() {
			this.pokemonCount += this.loadMoreCount
		},
		async loadAll() {
			try {
				await this.fetchPokemon(this.pokemonCount, 10000)
			} catch (error) {
				console.log('failed to load all pokemon, error', error)
				this.error = true
				return
			}

			this.loadedAll = true
		},
		async fetchPokemon(offset, count) {
			this.isLoading = true
			try {
				const morePokemon = await this.api.getPokemonList(offset, count)
				this.pokemons = this.pokemons.concat(morePokemon)
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

<style>
#pokemon-list {
	display: flex;
	flex-wrap: wrap;
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
}

@media screen and (max-width: 1023px) {
	.pokemon-list-item {
		flex-basis: 50%;
	}
}
</style>
