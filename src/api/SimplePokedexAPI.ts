import * as Model from "./model"
import PokedexAPI from "./PokedexAPI"
import { Pokedex } from "pokeapi-js-wrapper"
import Constants from "../Constants"

const debug = Constants.debug

export default class SimplePokedexAPI implements PokedexAPI {
	private P: Pokedex

	constructor (P: Pokedex) {
		this.P = P
	}

	async getPokemonList(offset: number = 0, limit = 10000): Promise<Model.PokemonBasicInfo[]> {
		const fetchedInfos = await (await fetch('pokedex_minimal.json.min')).json() as Model.PokemonBasicInfo[]

		debug && console.log('fetched', fetchedInfos)
		debug && console.log(JSON.stringify(fetchedInfos))

		return fetchedInfos
	}

	async getBasicInfo(name: string, fetchCharacteristics: boolean = true): Promise<Model.PokemonBasicInfo> {
		const pokemon = await this.P.getPokemonByName(name)

		debug && console.log('POKEMON', pokemon)


		const sprites = pokemon.sprites
		const species = await this.P.getPokemonSpeciesByName(pokemon.species.name) as Model.PokemonSpecies
		const stats = fetchCharacteristics ? await this.resolveStats(pokemon.stats) : []
		const types = fetchCharacteristics ? await this.resolveTypes(pokemon.types) : []
		const abilities = fetchCharacteristics ? await this.resolveAbilities(pokemon.abilities) : []

		if (debug) {
			console.log('SPECIES:', species)
			console.log('STATS:', stats)
			console.log('TYPES:', types)
			console.log('ABILITIES', abilities)
		}

		return {
			id: pokemon.id,
			is_default: pokemon.is_default,
			orderNumber: pokemon.order,
			sprites,
			species,
			stats,
			types,
			abilities,
		}
	}

	async getMoves(pokemonName: string): Promise<Model.PokemonMove[]> {
		const pokemon = await this.P.getPokemonByName(pokemonName)
		const moves = await this.resolveMoves(pokemon.moves)

		debug && console.log('MOVES', moves)
		return moves
	}

	async getEvolutions(species: Model.PokemonSpecies): Promise<Model.PokemonSpecies[]> {
		const chainUrl = species.evolution_chain.url

		// chain is recursive, format: {chain: {evolves_to: chain, species: {name, url}}}
		const chainLink = (await (await fetch(chainUrl)).json()).chain as Model.EvolutionChainLink
		const evolutions = await this.getEvolutionsRecursive(chainLink, [])

		debug && console.log('EVOLUTIONS', evolutions)

		return evolutions
	}

	localize(names: Model.Name[], lang: string): string {
			return this.findLocalizedName(names, lang) || this.findLocalizedName(names, 'en') || "Localization Error"
	}

	// Private:

	private findLocalizedName(names: Model.Name[], lang: string): string | null {
		let resolvedString = null

		for (const name of names) {
			if (name.language.name === lang) {
				resolvedString = name.name
			}
		}

		return resolvedString
	}

	/**
	 * IMPORTANT: This method does not consider tree-like evolutions.
	 * For simplicity reasons, it always follows the first evolution if multiple ones exist
	 */
	private async getEvolutionsRecursive(chainLink: Model.EvolutionChainLink, currentEvolutions: Model.PokemonSpecies[]): Promise<Model.PokemonSpecies[]> {
		if (debug) {
			console.log('current:', currentEvolutions)
			console.log('chain link', chainLink)
		}

		const resolvedSpecies = await this.P.getPokemonSpeciesByName(chainLink.species.name) as Model.PokemonSpecies

		debug && console.log('resolved', resolvedSpecies)

		currentEvolutions.push(resolvedSpecies)

		if (chainLink.evolves_to.length > 0) {
			return this.getEvolutionsRecursive(chainLink.evolves_to[0], currentEvolutions)
		} else {
			return currentEvolutions
		}
	}

	/**
	 * Resolves stats objects.
	 *
	 * Input:
	 * stats: [
					{
						base_stat: 45,
						effort: 0,
						stat: {
							name: 'hp',
							url: 'https://pokeapi.co/api/v2/stat/1/',
						},
					},
				]

	 * Converts the stat reference received from the API to a resolved stat object
	 */
	private async resolveStats(stats: any): Promise<Model.PokemonStat[]> {
		return Promise.all(
			stats.map(stat => this.resolveStat(stat))
		)
	}

	/** Takes one stat entry (see resolveStat) and resolves the included stats reference */
	private async resolveStat(stat: any): Promise<Model.PokemonStat> {
		console.log('STAT:', stat, stat.stat)
		const resolved_stat = await this.P.getStatByName(stat.stat.name) as Model.PokemonStatInfo
		stat.stat = resolved_stat

		return stat
	}

	/** Analogous to resolveStats */
	private async resolveTypes(types: any): Promise<Model.PokemonType[]> {
		return Promise.all(
			types.map(type => this.resolveType(type))
		)
	}

	/** Analogous to resolveStat */
	private async resolveType(type: any): Promise<Model.PokemonType> {
		console.log('TYPE: ', type)
		const resolved_type = await this.P.getTypeByName(type.type.name) as Model.PokemonTypeInfo
		type.type = resolved_type

		return type
	}

	/** Analogous to resolveStats */
	private async resolveAbilities(abilities: any): Promise<Model.PokemonAbility[]> {
		return Promise.all(
			abilities.map(ability => this.resolveAbility(ability))
		)
	}

	/** Analogous to resolveStat */
	private async resolveAbility(ability: any): Promise<Model.PokemonAbility> {
		const resolved_ability = await this.P.getAbilityByName(ability.ability.name) as Model.PokemonAbilityInfo
		ability.ability = resolved_ability

		return ability
	}

	/** Analogous to resolveStats */
	private async resolveMoves(moves: any): Promise<Model.PokemonMove[]>  {
		return Promise.all(moves.map(move => {
			return this.P.getMoveByName(move.move.name)
		})) as Promise<Model.PokemonMove[]>
	}
}
