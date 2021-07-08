import { Pokedex } from "pokeapi-js-wrapper"
import * as Model from "./model"

const P = new Pokedex()

export default class MiniPokedexAPI {
	async getPokemonList(offset: number = 0, limit = 10000): Promise<Model.PokemonBasicInfo[]> {
		const unresolvedPokemonList = (await P.getPokemonsList({ offset, limit })).results

		console.log('UNRESOLVED', unresolvedPokemonList)
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

	/**
	 * Fetches basic info about a pokemon
	 * @param name The pokeapi name of the to-be-fetched pokemon
	 * @param fetchCharacteristics If set to false, only the species will be included in the result (no stats, types, abilities)
	 * @returns
	 */
	async getBasicInfo(name: string, fetchCharacteristics: boolean = true): Promise<Model.PokemonBasicInfo> {
		const pokemon = await P.getPokemonByName(name)

		console.log('POKEMON', pokemon)

		const sprites = pokemon.sprites
		const species = await P.getPokemonSpeciesByName(pokemon.species.name) as Model.PokemonSpecies
		const stats = fetchCharacteristics ? await this.resolveStats(pokemon.stats) : []
		const types = fetchCharacteristics ? await this.resolveTypes(pokemon.types) : []
		const abilities = fetchCharacteristics ? await this.resolveAbilities(pokemon.abilities) : []

		console.log('SPECIES:', species)
		console.log('STATS:', stats)
		console.log('TYPES:', types)
		console.log('ABILITIES', abilities)

		return {
			orderNumber: pokemon.order,
			sprites,
			species,
			stats,
			types,
			abilities,
		}
	}

	/**
	 * As pokemon can usually have many moves,
	 * it can take a while to return from this method.
	 */
	async getMoves(pokemonName: string): Promise<Model.PokemonMove[]> {
		const pokemon = await P.getPokemonByName(pokemonName)
		const moves = await this.resolveMoves(pokemon.moves)

		console.log('MOVES', moves)
		return moves
	}

	/**
	 * IMPORTANT: This method does not consider tree-like evolutions.
	 * For simplicity reasons, it always follows the first evolution if multiple ones exist
	 */
	async getEvolutions(species: Model.PokemonSpecies): Promise<Model.PokemonSpecies[]> {
		const chainUrl = species.evolution_chain.url

		// chain is recursive, format: {chain: {evolves_to: chain, species: {name, url}}}
		const chainLink = (await (await fetch(chainUrl)).json()).chain as Model.EvolutionChainLink
		const evolutions = await this.getEvolutionsRecursive(chainLink, [])

		console.log('EVOLUTIONS', evolutions)

		return evolutions
	}

	/**
	 * IMPORTANT: This method does not consider tree-like evolutions.
	 * For simplicity reasons, it always follows the first evolution if multiple ones exist
	 */
	async getEvolutionsRecursive(chainLink: Model.EvolutionChainLink, currentEvolutions: Model.PokemonSpecies[]): Promise<Model.PokemonSpecies[]> {
		console.log('current:', currentEvolutions)
		console.log('chain link', chainLink)

		const resolvedSpecies = await P.getPokemonSpeciesByName(chainLink.species.name) as Model.PokemonSpecies

		console.log('resolved', resolvedSpecies)

		currentEvolutions.push(resolvedSpecies)

		if (chainLink.evolves_to.length > 0) {
			return this.getEvolutionsRecursive(chainLink.evolves_to[0], currentEvolutions)
		} else {
			return currentEvolutions
		}
	}

	/**
	 * Resolves a specific locale from a given array of localization names
	 * @param names The names retrieved by the API
	 * @param lang The language to localize, e.g. 'en'
	 * @returns Localized name in the given language, or english if the given language was not found
	 */
	localize(names: [Model.Name], lang: string): string {
		return this.findLocalizedName(names, lang)
	}

	findLocalizedName(names: [Model.Name], lang: string): string {
		let resolvedString = null

		for (const name of names) {
			if (name.language.name === lang) {
				resolvedString = name.name
			}
		}

		if (resolvedString == null) {
			// fall back to english locale if desired language was not found
			resolvedString = this.findLocalizedName(names, 'en')
		}

		return resolvedString
	}

	// Private:

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
	private async resolveStats(stats: any): Promise<[Model.PokemonStat]> {
		for (const statIndex in stats) {
			const resolved_stat = await P.getStatByName(stats[statIndex].stat.name) as Model.PokemonStatInfo
			stats[statIndex].stat = resolved_stat
		}

		return stats
	}

	/** Analogous to resolveStats */
	private async resolveTypes(types: any): Promise<[Model.PokemonType]> {
		for (const typeIndex in types) {
				const resolved_type = await P.getTypeByName(types[typeIndex].type.name) as Model.PokemonTypeInfo
				types[typeIndex].type = resolved_type
			}

			return types
	}

	/** Analogous to resolveStats */
	private async resolveAbilities(abilities: any): Promise<[Model.PokemonAbility]> {
		for (const abilityIndex in abilities) {
				const resolved = await P.getAbilityByName(abilities[abilityIndex].ability.name) as Model.PokemonAbilityInfo
				abilities[abilityIndex].ability = resolved
			}

			return abilities
	}

	/** Analogous to resolveStats */
	private async resolveMoves(moves: any): Promise<Model.PokemonMove[]>  {
		return Promise.all(moves.map(move => {
			return P.getMoveByName(move.move.name)
		})) as Promise<Model.PokemonMove[]>
	}
}
