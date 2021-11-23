<template>
  <section class="relative" v-if="selectedTicker">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ selectedTicker.title }} - USD
    </h3>
    <div
      class="flex items-end border-gray-600 border-b border-l h-64"
      ref="graph"
    >
      <div
        class="bg-purple-800 border w-10"
        v-for="(bar, idx) in normalizedGraph"
        :key="idx"
        ref="graphElement"
        :style="{ height: `${bar}%` }"
      ></div>
    </div>
    <remove-button @click="removeGraph" />
  </section>
</template>

<script>
import RemoveButton from "@/components/UI/RemoveButton.vue";

export default {
  components: {
    RemoveButton,
  },

  props: {
    selectedTicker: {
      type: Object,
      required: false,
      default() {
        return null;
      },
    },
  },

  emits: {
    removeGraph: null,
  },

  data() {
    return {
      graph: [],
      maxGraphElements: 1,
      widthGraphElement: 1,
    };
  },

  methods: {
    removeGraph() {
      this.$emit("removeGraph");
    },
  },
};
</script>
