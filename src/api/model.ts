export type Name = {
	/**
	 * The name in the language specified by the contained language object
	 */
	name: string
	language: {
		/**
		 * The name of the language, e.g. 'de'
		 */
		name: string }
}

export type PokemonStat = {
	base_stat: number,
	effort: number,
	stat: PokemonStatInfo
}

export type PokemonStatInfo = {
	/**
	 * the identifying name on pokeapi
	 */
	name: string

	/**
	 * names in different languages
	 */
	names: Name[]
	// could be extended
}

export type PokemonType = {
	slot: number,
	type: PokemonTypeInfo
}

export type PokemonTypeInfo = {
	/**
	 * the identifying name on pokeapi
	 */
	name: string

	/**
	 * names in different languages
	 */
	names: Name[]
	// could be extended
}

export type PokemonAbility = {
	slot: number
	is_hidden: boolean
	ability: PokemonAbilityInfo
}

export type PokemonAbilityInfo = {
	/**
	 * the identifying name on pokeapi
	 */
	name: string

	/**
	 * names in different languages
	 */
	names: Name[]
	// could be extended
}

export type PokemonMove = {
	/**
	 * the identifying name on pokeapi
	 */
	name: string

	/**
	 * names in different languages
	 */
	names: Name[]
	// could be extended
}

export type Evolution = {
	/**
	 * the identifying name on pokeapi
	 */
	name: string,
	names: Name[],
}

export type EvolutionChainLink = {
	evolves_to: [EvolutionChainLink]
	species: PokemonSpecies
}

export type PokemonSpecies = {
	name: string
	names: Name[]
	evolution_chain: { url: string }
}

/**
 * Contains URLs to images of the pokemon
 */
export type PokemonSprites = {
	front_default: string
	// can be extended
}

export interface PokemonBasicInfo {
	id: number
	is_default: boolean
	orderNumber: number
	species: PokemonSpecies
	sprites: PokemonSprites
	stats: PokemonStat[]
	types: PokemonType[]
	abilities: PokemonAbility[]
}
