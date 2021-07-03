<template>
  <p>
    <input
      @input="onSearch"
      placeholder="Find Pokemon by name"
      v-model="searchText"
      type="text"
    />
    <!-- {{ searchText }} -->
  </p>
</template>

<script>
export default {
  name: "Search",
  data() {
    return {
      searchText: this.textValue,
    };
  },
  emits: ["search"],
  methods: {
    onSearch() {
      this.$emit("search", this.searchText);
    },
  },
  props: {
    textValue: String,
  },
};
</script>

<style>
</style>
