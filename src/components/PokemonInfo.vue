<template>
	<div ref="self" class="detail-view position-fixed" id="pokemon">
		<!-- class d-md-none hides button on all size classes larger than or equal to medium
			source: https://getbootstrap.com/docs/5.0/utilities/display/ -->
		<router-link
			class="d-md-none"
			id="pokemon-hide-button"
			to="/"
			aria-label="Back to pokemon list"
		></router-link>
		<h1 v-if="loading === true">Loading...</h1>
		<h1 v-if="error == true">
			Failed to load Pokemon, please try again later.
		</h1>
		<article v-else-if="basicInfo !== null">
			<p class="pokemon-image">
				<img v-bind:src="basicInfo.sprites.front_default" />
			</p>

			<p></p>

			<h1>
				{{ localize(basicInfo.species.names) }} (#{{ basicInfo.orderNumber }})
			</h1>

			<ul class="pokemon-types">
				<li v-bind:key="type" v-for="type in basicInfo.types">
					{{ localize(type.type.names) }}
				</li>
			</ul>

			<table>
				<tr v-bind:key="stat" v-for="stat in basicInfo.stats">
					<td>{{ localize(stat.stat.names) }}</td>
					<td>{{ stat.base_stat }}</td>
				</tr>
			</table>

			<h2>Abilities</h2>
			<ul>
				<li
					v-bind:key="ability.ability.name"
					v-for="ability in basicInfo.abilities"
				>
					{{ localize(ability.ability.names) }}
				</li>
			</ul>

			<h2>Evolutions</h2>
			<ul class="pokemon-evolutions">
				<li
					v-bind:class="{ current: species.name == basicInfo.species.name }"
					v-bind:key="species.name"
					v-for="species in evolutions"
				>
					{{ localize(species.names) }}
				</li>
			</ul>

			<h2>Moves</h2>
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
			return this.api.localize(names, this.lang)
		},
		async fetchPokemon(name: string) {
			let pokemon = document.querySelector('#pokemon')
			let pokemonMoves = document.querySelector('#pokemonMoves')
			if (pokemonMoves !== null) pokemonMoves.classList.remove('show')

			this.loading = true
			this.error = false
			try {
				this.basicInfo = await this.api.getBasicInfo(name)
			} catch (error) {
				console.error('Fetching pokemon failed, error:', error)
				this.error = true
			} finally {
				this.loading = false
			}

			this.fetchEvolutions()

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
		changeSizeToFitParent() {
			const selfNode = this.$refs.self
			if (selfNode !== null && selfNode.parentNode !== null) {
				if (window.innerWidth < 768) {
					selfNode.style.width = 'inherit'
					return
				}

				console.log('setting width', this.$refs.bla)
				let dimensions = getComputedStyle(selfNode.parentNode)
				let innerWidth =
					selfNode.parentNode.clientWidth -
					parseInt(dimensions.paddingLeft) -
					parseInt(dimensions.paddingRight)
				selfNode.style.width = innerWidth + 'px'
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

		this.changeSizeToFitParent()
		window.addEventListener('resize', () => {
			this.changeSizeToFitParent()
		})

		console.log('REFS', this.$refs.self)
	},
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#pokemon {
	padding: 20px;
}

#pokemon-hide-button {
	position: fixed;
	top: 20px;
	right: 20px;
	text-decoration: none;
	font-weight: bold;
	color: black;
	width: 32px;
	height: 32px;
	margin: 0;
	padding: 0;
	background-image: url('../assets/iconmonstr-x-mark.png');
	background-size: 32px;
	background-repeat: no-repeat;
}

p.pokemon-image {
	padding-top: 50px;
	text-align: center;
}

h1 {
	text-align: center;
}

h2 {
	text-align: center;
	font-size: 1.5em;
	margin-top: 30px;
}

.pokemon-types {
	list-style-type: none;
	text-align: center;
	padding: 0;
}

.pokemon-types li {
	display: inline-block;
	padding: 3px 10px;
	margin: 5px;
	border: 1px solid black;
	border-radius: 5px;
}

ul.pokemon-evolutions {
	display: flex;
	list-style-type: none;
	margin: 0;
	margin-top: 20px;
	padding: 0;
}

.pokemon-evolutions li {
	flex-grow: 1;
	flex-basis: 0;
	text-align: center;
}

.pokemon-evolutions li.current {
	font-weight: bold;
}

table {
	width: 100%;
	margin: 10px 0;
	padding: 20px;
}

table tr td:nth-child(2) {
	text-align: right;
}
</style>
