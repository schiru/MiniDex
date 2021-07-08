import SimplePokedexAPI from "./SimplePokedexAPI"
import PokedexAPI from "./PokedexAPI"
import { Pokedex } from "pokeapi-js-wrapper"

export default class PokedexAPIFactory {
	private static api = new Pokedex()

	static getPokedexAPI(): PokedexAPI {
		return new SimplePokedexAPI(PokedexAPIFactory.api)
	}
}
