<template>
	<div
		v-bind:class="{ 'd-none': noPokemonSelected }"
		ref="self"
		class="detail-view position-fixed d-md-block"
		id="pokemon"
	>
		<div v-if="noPokemonSelected" class="no-pokemon-selected">
			<p>Please select a Pokemon to see details here</p>
		</div>
		<button
			v-if="loading === true"
			class="loading-pokemon btn btn-warning"
			type="button"
			disabled
		>
			<span
				class="spinner-border spinner-border-sm"
				role="status"
				aria-hidden="true"
			></span>
			<span class="visually-hidden">Updating...</span>
		</button>
		<!-- class d-md-none hides button on all size classes larger than or equal to medium
			source: https://getbootstrap.com/docs/5.0/utilities/display/ -->
		<router-link
			class="d-md-none"
			id="pokemon-hide-button"
			to="/"
			aria-label="Back to pokemon list"
			@click="scrollToTop"
		></router-link>
		<p class="error" v-if="error == true">
			Failed to load Pokemon, please try again later.
		</p>
		<article v-else-if="basicInfo !== null && !noPokemonSelected">
			<p class="pokemon-image">
				<img alt="Pokemon Image" v-bind:src="basicInfo.sprites.front_default" />
			</p>

			<h1>
				{{ localize(basicInfo.species.names) }}
				<span class="order-number">#{{ basicInfo.id }}</span>
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
					<router-link
						v-bind:to="{
							name: 'Pokemon',
							params: { name: species.name },
						}"
						>{{ localize(species.names) }}</router-link
					>
				</li>
			</ul>

			<h2>Moves</h2>
			<p class="button-pokemon-moves" v-if="!movesLoaded">
				<button
					@click="fetchMoves"
					class="btn btn-warning"
					type="button"
					:disabled="movesLoading"
				>
					<span
						class="spinner-border spinner-border-sm"
						role="status"
						aria-hidden="true"
						v-if="movesLoading"
					></span>
					Load all possible moves
				</button>
			</p>

			<ul id="pokemonMoves">
				<li v-if="movesError">
					Moves could not be fetched. Please try again later.
				</li>

				<li v-bind:key="move.name" v-for="move in moves">
					{{ localize(move.names) }}
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
import PokedexAPIFactory from '../api/PokedexAPIFactory'

export default defineComponent({
	name: 'PokemonInfo',
	props: {
		// the language to display
		lang: String,
	},
	data() {
		return {
			noPokemonSelected: false,
			api: PokedexAPIFactory.getPokedexAPI(),
			basicInfo: null as PokemonBasicInfo,
			evolutions: [] as PokemonSpecies[],
			moves: [] as PokemonMove[],
			loading: false,
			movesLoading: false,
			movesLoaded: false,
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
		scrollToTop() {
			let pokemon = document.querySelector('#pokemon')

			if (pokemon != null) {
				pokemon.scrollTop = 0
			}
		},
		async fetchPokemon(name: string) {
			this.scrollToTop()

			this.moves = []
			this.movesLoading = false
			this.movesLoaded = false
			this.movesError = false

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
		},
		async fetchEvolutions() {
			this.evolutions = []
			this.evolutions = await this.api.getEvolutions(this.basicInfo.species)
		},
		async fetchMoves() {
			this.moves = []
			this.movesLoading = true
			this.movesError = false

			try {
				this.moves = await this.api.getMoves(this.basicInfo.species.name)
				this.movesLoaded = true
			} catch (error) {
				console.error('failed to load moves, error:', error)
				this.movesError = true
			} finally {
				this.movesLoading = false
			}
		},
		/**
		 * Since this componnent is displayed "position: fixed" so that it does not scroll with the page,
		 * it does also not inherit the size of it's containing grid column.
		 * Thus, this method manually makes the component as wide as its parent.
		 */
		changeSizeToFitParent() {
			const selfNode = this.$refs.self
			if (selfNode !== null && selfNode.parentNode !== null) {
				// no need to adjust width in mobile view, since PokemonInfo component is fullscreen
				if (window.innerWidth < 768) {
					selfNode.style.width = 'inherit'
					return
				}

				let dimensions = getComputedStyle(selfNode.parentNode)
				let innerWidth =
					selfNode.parentNode.clientWidth -
					parseInt(dimensions.paddingLeft) -
					parseInt(dimensions.paddingRight)
				selfNode.style.width = innerWidth + 'px'
			}
		},
		reload(pokemonName: any) {
			if (typeof pokemonName === 'string') {
				this.noPokemonSelected = false
				this.fetchPokemon(pokemonName)
			} else {
				this.noPokemonSelected = true
			}
		},
	},
	watch: {
		$route(to) {
			this.reload(to.params.name)
		},
	},
	async mounted() {
		this.reload(this.$route.params.name)

		this.changeSizeToFitParent()
		window.addEventListener('resize', () => {
			this.changeSizeToFitParent()
		})
	},
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#pokemon {
	padding: 20px;
}

.order-number {
	color: #888;
	padding-left: 5px;
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

div.no-pokemon-selected {
	top: 50%;
	left: 0;
	right: 0;
	text-align: center;
	position: absolute;
}

.loading-pokemon {
	position: absolute;
	transform: translate(-50%, -50%);
	left: 50%;
	top: 190px;
	opacity: 1 !important;
}

p.pokemon-image {
	padding: 0;
	margin: 0;
	text-align: center;
}

/** Makes image big and pixely */
p.pokemon-image img {
	height: 300px;
	width: 300px;

	image-rendering: optimizeSpeed; /* STOP SMOOTHING, GIVE ME SPEED  */
	image-rendering: -moz-crisp-edges; /* Firefox                        */
	image-rendering: -o-crisp-edges; /* Opera                          */
	image-rendering: -webkit-optimize-contrast; /* Chrome (and eventually Safari) */
	image-rendering: pixelated; /* Chrome */
	image-rendering: optimize-contrast; /* CSS3 Proposed                  */
	-ms-interpolation-mode: nearest-neighbor; /* IE8+ */
}

h1 {
	text-align: center;
}

p.error {
	position: absolute;
	text-align: center;
	top: 50%;
	left: 0;
	right: 0;
	padding: 50px;
	transform: translateY(-50%);
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

.pokemon-evolutions li a {
	color: black;
}

.pokemon-evolutions li.current {
	font-weight: bold;
}

.pokemon-evolutions li.current a {
	color: black;
	text-decoration: none;
}

.button-pokemon-moves {
	text-align: center;
	padding: 15px;
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
