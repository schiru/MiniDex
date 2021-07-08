import * as Model from "./model"
import PokedexAPI from "./PokedexAPI"
import { Pokedex } from "pokeapi-js-wrapper"
import Constants from "@/Constants"

const debug = Constants.debug

export default class SimplePokedexAPI implements PokedexAPI {
	private P: Pokedex

	constructor (P: Pokedex) {
		this.P = P
	}

	async getPokemonList(offset: number = 0, limit = 10000): Promise<Model.PokemonBasicInfo[]> {
		const unresolvedPokemonList = (await this.P.getPokemonsList({ offset, limit })).results

		debug && console.log('UNRESOLVED', unresolvedPokemonList)

		const fetchedInfos = await Promise.all(
			unresolvedPokemonList.map(pokemon => {
				return this.getBasicInfo(pokemon.name, false)
			}) as Promise<Model.PokemonBasicInfo>[]
		)

		const sortedByOrderNumber = fetchedInfos.sort(
			(a, b) => a.orderNumber - b.orderNumber
		)

		return sortedByOrderNumber
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

	 * Converts the stat reference received from the API to an actual stat object
	 */
	private async resolveStats(stats: any): Promise<Model.PokemonStat[]> {
		for (const statIndex in stats) {
			const resolved_stat = await this.P.getStatByName(stats[statIndex].stat.name) as Model.PokemonStatInfo
			stats[statIndex].stat = resolved_stat
		}

		return stats
	}

	/** Analogous to resolveStats */
	private async resolveTypes(types: any): Promise<Model.PokemonType[]> {
		for (const typeIndex in types) {
				const resolved_type = await this.P.getTypeByName(types[typeIndex].type.name) as Model.PokemonTypeInfo
				types[typeIndex].type = resolved_type
			}

			return types
	}

	/** Analogous to resolveStats */
	private async resolveAbilities(abilities: any): Promise<Model.PokemonAbility[]> {
		for (const abilityIndex in abilities) {
				const resolved = await this.P.getAbilityByName(abilities[abilityIndex].ability.name) as Model.PokemonAbilityInfo
				abilities[abilityIndex].ability = resolved
			}

			return abilities
	}

	/** Analogous to resolveStats */
	private async resolveMoves(moves: any): Promise<Model.PokemonMove[]>  {
		return Promise.all(moves.map(move => {
			return this.P.getMoveByName(move.move.name)
		})) as Promise<Model.PokemonMove[]>
	}
}
