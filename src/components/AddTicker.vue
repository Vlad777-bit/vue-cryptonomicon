<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
            v-focus
            v-model="ticker"
            @keydown.enter="addTicker(ticker)"
          />
        </div>
        <template v-if="ticker.length && coinList.length">
          <div class="flex bg-white shadow-md p-1 rounded-md flex-wrap">
            <span
              class="
                inline-flex
                items-center
                px-2
                m-1
                rounded-md
                text-xs
                font-medium
                bg-gray-300
                text-gray-800
                cursor-pointer
              "
              v-for="(coin, idx) in gettingHint"
              :key="idx"
              @click="ticker = coin"
            >
              {{ coin }}
            </span>
          </div>
        </template>
        <div class="text-sm text-red-600" v-if="isIncluding">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button
      class="my-4 py-2 px-4"
      @click="addTicker"
      :disabled="disabled"
    />
  </section>
</template>

<script>
import { getCoinData } from "@/min-api";

import AddButton from "@/components/UI/AddButton.vue";
export default {
  components: {
    AddButton,
  },

  data() {
    return {
      ticker: "",

      coinList: [],

      isLoading: true,
      isIncluding: false,
    };
  },

  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },

    tickers: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
  },

  emits: {
    "add-ticker": (val) => typeof val === "string" && val.length > 0,
    load: (val) => typeof val === "boolean" && val === false,
  },

  watch: {
    ticker() {
      this.isIncluding = false;

      if (this.havingTicker) {
        this.isIncluding = true;
      }
    },
  },

  methods: {
    addTicker() {
      if (this.ticker.length === 0) {
        return;
      }

      if (!this.disabled && !this.isIncluding) {
        this.$emit("add-ticker", this.ticker);
        this.ticker = "";
      }
    },

    async setCoinInfoToArray() {
      try {
        this.coinList = await getCoinData();
      } catch (e) {
        throw new Error(`Ошибка при записи данных криптовалюты: ${e.message}`);
      } finally {
        this.isLoading = false;
      }
    },
  },

  computed: {
    gettingHint() {
      return this.coinList
        .map((key) => key.symbol)
        .filter((el) => el.includes(this.ticker.toUpperCase()))
        .sort()
        .slice(0, 4);
    },

    havingTicker() {
      return this.tickers
        .map((t) => t.title)
        .includes(this.ticker.toUpperCase());
    },
  },

  async created() {
    await this.setCoinInfoToArray();
    this.$emit("load", this.isLoading);
  },
};
</script>
