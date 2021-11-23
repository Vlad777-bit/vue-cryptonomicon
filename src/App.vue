<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      class="
        fixed
        w-100
        h-100
        opacity-80
        bg-purple-800
        inset-0
        z-50
        flex
        items-center
        justify-center
      "
      v-if="isLoading"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div class="container">
      <add-ticker
        @add-ticker="addTicker"
        @load="isLoadedCoins"
        :disabled="tooManyTickersAdded"
        :tickers="tickerCollection"
      />

      <template v-if="tickerCollection.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <button
          class="
            my-4
            inline-flex
            items-center
            py-2
            px-4
            border border-transparent
            shadow-sm
            text-sm
            leading-4
            font-medium
            rounded-full
            text-white
            bg-gray-600
            hover:bg-gray-700
            transition-colors
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:ring-gray-500
            mx-2
          "
          v-if="page > 1"
          @click="page = page - 1"
        >
          Назад
        </button>
        <button
          class="
            my-4
            inline-flex
            items-center
            py-2
            px-4
            border border-transparent
            shadow-sm
            text-sm
            leading-4
            font-medium
            rounded-full
            text-white
            bg-gray-600
            hover:bg-gray-700
            transition-colors
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:ring-gray-500
            mx-2
          "
          v-if="hasNextPage"
          @click="page = page + 1"
        >
          Вперёд
        </button>

        <div>
          Фильтр:
          <input
            type="text"
            class="
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            v-model="filter"
          />
        </div>

        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
            v-for="t in paginatedTickers"
            :key="t.title"
            @click="selected(t)"
            :class="{
              'border-4': selectedTicker === t,
              'bg-red-100': checkTicker(t),
            }"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.title }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
              @click.stop="removeTicker(t)"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <show-graph
        :selectedTicker="selectedTicker"
        @remove-graph="selectedTicker = null"
      />
    </div>
  </div>
</template>

<script>
import {
  subscribeToTicker,
  unsubscribeFromTicker,
  notValidTickers,
} from "@/api";

import AddTicker from "@/components/AddTicker.vue";
import ShowGraph from "@/components/ShowGraph.vue";

export default {
  name: "App",

  components: {
    AddTicker,
    ShowGraph,
  },

  data() {
    return {
      filter: "",

      tickerCollection: [],
      selectedTicker: null,
      maxCountOfTickers: 20,

      isLoading: true,

      page: 1,
    };
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickerCollection.filter((ticker) =>
        ticker.title.includes(this.filter.toUpperCase()),
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.endIndex < this.filteredTickers.length;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },

    checkingTickers() {
      return notValidTickers;
    },

    tooManyTickersAdded() {
      return this.tickerCollection.length > this.maxCountOfTickers;
    },
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries(),
    );

    const VALID_KEYS = ["filter", "page"];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    const tickersData = localStorage.getItem("cryptonomicon-list");

    if (tickersData) {
      this.tickerCollection = JSON.parse(tickersData);

      this.tickerCollection.forEach((ticker) =>
        subscribeToTicker(ticker.title, (newPrice) =>
          this.updateTicker(ticker.title, newPrice),
        ),
      );
    }

    setInterval(this.updateTickers, 5000);
  },

  watch: {
    tickerCollection() {
      localStorage.setItem(
        "cryptonomicon-list",
        JSON.stringify(this.tickerCollection),
      );

      if (!this.isIncluding) {
        this.page = this.endIndex;
      }
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`,
      );
    },
  },

  methods: {
    updateTicker(tickerTitle, price) {
      this.tickerCollection
        .filter((t) => t.title === tickerTitle)
        .forEach((t) => {
          t.price = price;
        });
    },

    formatPrice(price) {
      if (price === "-") {
        return price;
      }

      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    addTicker(ticker) {
      const currentTicker = {
        title: ticker.toUpperCase(),
        price: "-",
      };

      this.tickerCollection = [...this.tickerCollection, currentTicker];
      this.filter = "";

      subscribeToTicker(currentTicker.title, (newPrice) =>
        this.updateTicker(currentTicker.title, newPrice),
      );
    },

    removeTicker(ticker) {
      this.tickerCollection = this.tickerCollection.filter((t) => t !== ticker);
      if (ticker === this.selectedTicker) {
        this.selectedTicker = null;
      }

      unsubscribeFromTicker(ticker.title);
    },

    selected(ticker) {
      this.selectedTicker = ticker;
    },

    checkTicker(t) {
      return this.checkingTickers.includes(t.title);
    },

    isLoadedCoins(data) {
      if (typeof data !== "boolean") {
        return;
      }

      this.isLoading = data;
    },
  },
};
</script>
