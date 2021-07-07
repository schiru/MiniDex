<template>
	<div class="detail-view position-fixed" id="pokemon">
		<router-link to="/" style="position: sticky">Hide</router-link>
		<h1 v-if="loading === true">Loading...</h1>
		<h1 v-if="error == true">I've got no pokemon for you today</h1>
		<article v-else-if="basicInfo !== null">
			<h1>
				{{ localize(basicInfo.species.names) }} (#{{ basicInfo.orderNumber }})
			</h1>
			Abilities:
			<ul
				v-bind:key="ability.ability.name"
				v-for="ability in basicInfo.abilities"
			>
				<li>{{ localize(ability.ability.names) }}</li>
			</ul>

			Types:
			<ul v-bind:key="type" v-for="type in basicInfo.types">
				<li>{{ localize(type.type.names) }}</li>
			</ul>

			Stats:
			<ul v-bind:key="stat" v-for="stat in basicInfo.stats">
				<li>
					{{ localize(stat.stat.names) }}, base: {{ stat.base_stat }}, effort:
					{{ stat.effort }}
				</li>
			</ul>

			Evolutions:
			<ul v-bind:key="species.name" v-for="species in evolutions">
				<li>
					{{ localize(species.names) }}
				</li>
			</ul>

			<a
				class="btn btn-primary"
				data-bs-toggle="collapse"
				href="#pokemonMoves"
				role="button"
				aria-expanded="false"
				aria-controls="pokemonMoves"
			>
				Show/Hide Moves
			</a>
			<ul class="collapse" id="pokemonMoves">
				<li v-if="movesLoading">Loading...</li>
				<li v-if="movesError">An error occurred, please reload the page.</li>

				<li v-bind:key="move.move.name" v-for="move in moves">
					{{ localize(move.move.names) }}
				</li>
			</ul>
		</article>
	</div>
</template>

<script lang="ts">
import {
	Name,
	PokemonBasicInfo,
	PokemonSpecies,
	PokemonMove,
} from '@/api/model'
import { defineComponent } from 'vue'
import MiniPokedexAPI from '../api/MiniPokedexAPI'

export default defineComponent({
	name: 'PokemonInfo',
	props: {
		// the language to display
		lang: String,
	},
	data() {
		return {
			api: new MiniPokedexAPI(),
			basicInfo: null as PokemonBasicInfo,
			evolutions: [] as PokemonSpecies[],
			moves: [] as PokemonMove[],
			abilities: '',
			movesLoading: false,
			loading: false,
			movesError: false,
			error: false,
		}
	},
	computed: {},
	methods: {
		/** convenience method for template */
		localize(names: [Name]): string {
			return (
				this.findLocalizedName(names, this.lang) ?? 'Could not resolve name'
			)
		},
		findLocalizedName(names: [Name], lang: string): string | null {
			for (const name of names) {
				if (name.language.name === lang) {
					return name.name
				}
			}

			return null
		},
		async fetchPokemon(name: string) {
			let pokemon = document.querySelector('#pokemon')
			let pokemonMoves = document.querySelector('#pokemonMoves')
			if (pokemonMoves !== null) pokemonMoves.classList.remove('show')

			this.loading = true
			try {
				this.basicInfo = await this.api.getBasicInfo(name)
			} catch (error) {
				console.error('Fetching pokemon failed, error:', error)
				this.error = true
			} finally {
				this.loading = false
			}

			this.fetchEvolutions()
			this.fetchMoves(name)

			if (pokemon != null) {
				pokemon.scrollTop = 0
			}
		},
		async fetchEvolutions() {
			this.evolutions = []
			this.evolutions = await this.api.getEvolutions(this.basicInfo.species)
		},
		async fetchMoves(name: string) {
			this.moves = []
			this.movesLoading = true
			this.movesError = false

			try {
				this.moves = await this.api.getMoves(name)
			} catch (error) {
				console.error('failed to load moves, error:', error)
				this.movesError = true
			} finally {
				this.movesLoading = false
			}
		},
	},
	watch: {
		$route(to, from) {
			from // avoid warining that `from` is unused
			console.log('route destination changed')
			if (typeof to.params.name === 'string') {
				this.fetchPokemon(to.params.name)
			}
		},
	},
	async mounted() {
		console.log('route destination changed')
		if (typeof this.$route.params.name === 'string') {
			this.fetchPokemon(this.$route.params.name)
		} else {
			this.error = true
		}
	},
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
