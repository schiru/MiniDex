export default interface PokedexAPI {
	/**
	 * Fetches multiple pokemon at once
	 * @param offset Use this parameter for fetching one subset at a time (e.g. pagination)
	 * @param limit Limits the returned number of pokemon
	 */
	getPokemonList(offset: number, limit): Promise<Model.PokemonBasicInfo[]>

	/**
	 * Fetches basic info about a pokemon
	 * @param name The pokeapi name of the to-be-fetched pokemon
	 * @param fetchCharacteristics If set to false, only the species will be included in the result (no stats, types, abilities)
	 * @returns
	 */
	getBasicInfo(name: string, fetchCharacteristics: boolean): Promise<Model.PokemonBasicInfo>

	/**
	 * As pokemon can usually have many moves,
	 * it can take a while to return from this method.
	 */
	getMoves(pokemonName: string): Promise<Model.PokemonMove[]>

	/**
	 * IMPORTANT: This method does not consider tree-like evolutions.
	 * For simplicity reasons, it always follows the first evolution if multiple ones exist
	 */
	getEvolutions(species: Model.PokemonSpecies): Promise<Model.PokemonSpecies[]>

	/**
	 * Resolves a specific locale from a given array of localization names
	 * @param names The names retrieved by the API
	 * @param lang The language to localize, e.g. 'en'
	 * @returns Localized name in the given language, or english if the given language was not found. If not even the fallback is provided, this method returns an error string
	 */
	localize(names: Model.Name[], lang: string): string
}
