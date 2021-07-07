<template>
	<div class="detail-view position-fixed" id="pokemon">
		<router-link to="/" style="position: sticky">Hide</router-link>
		<h1>{{ pokemonName }} (#{{ rawInfo.order }})</h1>
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

			Evolutions:
			<ul
				v-bind:key="evolution"
				v-for="evolution in rawInfo.evolutions_resolved"
			>
				<li>
					{{ evolution }}
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
import { defineComponent } from 'vue'
import MiniPokedexAPI from '../api/MiniPokedexAPI'

export default defineComponent({
	name: 'HelloWorld',
	props: {
		msg: String,
	},
	data() {
		return {
			api: new MiniPokedexAPI(),
			info: '',
			basicInfo: '',
			pokemonName: 'test',
			rawInfo: {
				order: 42,
				abilities: [
					{
						ability: {
							name: 'overgrow',
							url: 'https://pokeapi.co/api/v2/ability/65/',
						},
						is_hidden: false,
						slot: 1,
					},
				],
				types: [
					{
						slot: 1,
						type: {
							name: 'bug',
							url: 'https://pokeapi.co/api/v2/type/7/',
						},
					},
				],
				stats: [
					{
						base_stat: 45,
						effort: 0,
						stat: {
							name: 'hp',
							url: 'https://pokeapi.co/api/v2/stat/1/',
						},
					},
				],
				moves: [
					{
						move: {
							name: 'mega-punch',
							url: 'https://pokeapi.co/api/v2/move/5/',
						},
					},
				],
				species: {
					name: 'test',
					url: 'https://example.com',
				},
				evolutions_resolved: ['test'],
			},
			error: false,
		}
	},
	computed: {
		test() {
			return 'bla blu'
		},
	},
	methods: {
		fetch_pokemon(name: string) {
			let baseUrl = 'https://pokeapi.co/api/v2/pokemon/'
			let pokemonUrl = baseUrl + name
			console.log('pokemon url: ', pokemonUrl)

			fetch(pokemonUrl)
				.then(response => {
					console.log(response)

					if (response.status != 200) {
						this.error = true
						throw 'could not fetch pokemon'
					} else {
						this.error = false
					}

					return response.json()
				})
				.then(json => {
					console.log('fetched pokemon', json)
					this.info = JSON.stringify(json)
					this.rawInfo = json

					this.fetch_evolutions()
				})

			let poke = document.querySelector('#pokemon')
			if (poke != null) {
				poke.scrollTop = 0
			}
		},
		async fetch_evolutions() {
			// proof of concept:

			const speciesUrl = this.rawInfo.species.url
			console.log('species url: ', speciesUrl)

			let species = (await (await fetch(speciesUrl)).json()) as any
			let chainUrl = species['evolution_chain'].url
			console.log('species', species)

			// chain is recursive, format: {chain: {evolves_to: chain, species: {name, url}}}
			let chain = (await (await fetch(chainUrl)).json()) as any
			chain = chain.chain
			console.log('chain:', chain)

			let evolutions: string[] = []
			let currentEvolution = chain.evolves_to
			let currentSpecies = chain.species

			evolutions.push(currentSpecies.name)

			while (currentEvolution.length > 0) {
				currentSpecies = currentEvolution[0].species
				currentEvolution = currentEvolution[0].evolves_to

				evolutions.push(currentSpecies.name)
			}

			console.log('evolutions: ', evolutions)

			this.rawInfo.evolutions_resolved = evolutions
		},
	},
	watch: {
		async $route(to, from) {
			from // avoid warining that `from` is unused
			console.log('route destination changed')
			if (typeof to.params.name === 'string') {
				this.fetch_pokemon(to.params.name)

				let a = this.api as MiniPokedexAPI
				let baseInfo = await a.getBasicInfo(this.$route.params.name)
				this.baseInfo = baseInfo

				for (let name of baseInfo.species.names) {
					if (name.language.name == 'de') {
						console.log('found name', name.language.name)
						this.pokemonName = name.name
					}
				}
			}
		},
	},
	async mounted() {
		if (typeof this.$route.params.name === 'string') {
			this.fetch_pokemon(this.$route.params.name)

			let a = this.api as MiniPokedexAPI
			let baseInfo = await a.getBasicInfo(this.$route.params.name)
			this.baseInfo = baseInfo

			for (let name of baseInfo.species.names) {
				if (name.language.name == 'de') {
					console.log('found name', name.language.name)
					this.pokemonName = name.name
				}
			}
			// console.log('base info:', baseInfo)
		} else {
			this.error = true
		}
	},
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
