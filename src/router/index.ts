import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PokemonInfo from '../components/PokemonInfo.vue'
import Constants from '@/Constants'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: PokemonInfo,
		props: {
			lang: Constants.lang // could be made dynamic so that UI can show different languages
		}
	},
	{
		path: '/pokemon/:name',
		name: 'Pokemon',
		component: PokemonInfo,
		props: {
			lang: Constants.lang // could be made dynamic so that UI can show different languages
		}
	},
]

const router = createRouter({
	history: createWebHashHistory(),
	routes,
})

export default router
