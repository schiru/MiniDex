import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PokemonInfo from '../components/PokemonInfo.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: PokemonInfo,
		props: {
			lang: 'de' // could be made dynamic so that UI can show different languages
		}	},
	{
		path: '/pokemon/:name',
		name: 'Pokemon',
		component: PokemonInfo,
		props: {
			lang: 'de' // could be made dynamic so that UI can show different languages
		}
	},
]

const router = createRouter({
	history: createWebHashHistory(),
	routes,
})

export default router
