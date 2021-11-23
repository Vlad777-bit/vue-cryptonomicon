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
    },
  },

  emits: {
    "remove-graph": null,
  },

  data() {
    return {
      graph: [],
      maxGraphElements: 1,
      widthGraphElement: 1,
    };
  },

  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  },

  watch: {
    selectedTicker() {
      this.graph = [];
    },
  },

  computed: {
    normalizedGraph() {
      const minVal = Math.min(...this.graph);
      const maxVal = Math.max(...this.graph);

      if (minVal == maxVal) {
        return this.graph.map(() => 50);
      }

      return this.graph.map(
        (price) => 5 + ((price - minVal) * 95) / (maxVal - minVal),
      );
    },
  },

  methods: {
    removeGraph() {
      this.$emit("remove-graph");
    },

    updateGraph() {
      if (this.selectedTicker) {
        this.graph.push(this.selectedTicker.price);

        if (this.graph.length > this.maxGraphElements) {
          this.graph = this.graph.splice(1, this.maxGraphElements);
        }

        this.$nextTick()
          .then(this.setWidthGraphEl)
          .then(this.calculateMaxGraphElements);
      }
    },

    calculateMaxGraphElements() {
      if (!this.$refs.graph) {
        return;
      }

      this.maxGraphElements =
        this.$refs.graph.clientWidth / this.widthGraphElement;
    },

    setWidthGraphEl() {
      if (!this.$refs.graphElement) {
        return;
      }

      this.widthGraphElement = parseInt(
        getComputedStyle(this.$refs.graphElement).width,
      );
    },
  },
};
</script>
