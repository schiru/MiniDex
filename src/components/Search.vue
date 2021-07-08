<template>
	<input
		class="form-control"
		type="search"
		aria-label="Search"
		@keyup="onSearch"
		:placeholder="placeholderText"
		v-model="searchText"
	/>
	<!-- {{ searchText }} -->
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	name: 'Search',
	data() {
		return {
			searchText: this.textValue,
		}
	},
	emits: ['search'],
	methods: {
		onSearch() {
			this.$emit('search', this.searchText)
		},
	},
	props: {
		textValue: String,
		placeholderText: String,
	},
})
</script>

<style></style>
