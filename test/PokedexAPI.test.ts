import * as Model from '../src/api/model'
import PokedexAPIFactory from '../src/api/PokedexAPIFactory'

const api = PokedexAPIFactory.getPokedexAPI()

describe("MiniPokedexAPI", () => {
    test("correctly returns localization", () => {
        const names = [
            { name: "english", language: { name: "en" }},
            { name: "german", language: { name: "de" }},
            { name: "japanese", language: { name: "jp" }}
        ] as Model.Name[]

        expect(api.localize(names, 'de')).toBe('german')
    })

    test("correctly falls back to english localization if given localization does not exist", () => {
        const names = [
            { name: "english", language: { name: "en" }},
            { name: "german", language: { name: "de" }},
            { name: "japanese", language: { name: "jp" }}
        ] as Model.Name[]

        expect(api.localize(names, 'fr')).toBe('english')
    })

    test("correctly returns an error string if no matching localization was found", () => {
        const names = [] as Model.Name[]

        expect(api.localize(names, 'fr')).toBe("Localization Error")
    })
})
