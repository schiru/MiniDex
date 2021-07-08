<template>
	<div class="no-pokemon-selected">
		<p>Please select a Pokemon to see details here</p>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	name: 'Home',
})
</script>

<style scoped>
div.no-pokemon-selected {
	top: 50%;
	position: fixed;
}
</style>
