Vue.component('productDetails', {
  props: {
    details:{
      required: true
    }
  },
  template: `
  <div>
    <span>Details</span>
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  </div>
  `,
});

Vue.component('productTabs', {
  props: {
    reviews: {
      type: Array
    }
  },
  template: `
    <div>
      <span
        class="tab"
        :class = "{ activeTab: selectedTab === tab}"
        v-for="(tab, index) in tabs" :key="index"
        @click="selectedTab = tab"
        >
        {{ tab }}
      </span>
      <div class="reviews" v-show="selectedTab === 'Reviews'">
          <ul>
            <li v-for="review in productReviews">
              {{ review.name }} <br />
              {{ review.rating }} <br />
              {{ review.review }}
              {{ review.recommend ? 'Yes' : 'No' }}
            </li>
          </ul>
      </div>
      <div class="" v-show="selectedTab === 'Make a Review'">
        <productReview @review-submited="addReview"></productReview>
      </div>
    </div>
  `,
  data(){
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews',
      productReviews: [],
    }
  },
  methods:{
    addReview(review){
      this.productReviews.push(review);
    },
  }
})
Vue.component('productReview', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
          <ul>
            <li class="error" v-for="error in errors"> {{ error }} </li>
          </ul>
        </p>
        <p>
          <label for="name">Name</label>
          <input type="text" id="name" v-model="name">
        </p>
        <p>
          <label for="review">Review</label>
          <input type="text" id="review" v-model="review">
        </p>
        <p>
          <label for="name">Rating</label>
          <select id="rating"  v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
          </select>
        </p>
        <p>
          <h5>Would you recommend this product?</h5>
          <label for="recommendYes">
            <input type="radio" id="recommendYes" value="1" v-model="recommend">
            Yes
          </label>
          <label for="recommendNo">
          <input type="radio" id="recommendNo" value="0" v-model="recommend">
            No
          </label>
        </p>
        <p>
          <input type="submit" value="Submit">
        </p>
    </form>
  `,
  data(){
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    }
  },
  methods: {
    onSubmit(){
        if(this.name && this.review && this.rating){
          let productReview={
            name: this.name,
            review: this.review,
            rating: this.rating,
            recommend: this.recommend,
          };
          this.$emit('review-submited', productReview);
          this.name = null;
          this.review = null;
          this.rating = null;
          this.errors = [];
        }else{
          this.errors = [];
          if(!this.name) this.errors.push("Name Required");
          if(!this.review) this.errors.push("Review Required");
          if(!this.rating) this.errors.push("Rating Required");
          if(!this.recommend) this.errors.push("Recommend Required");
        }
    }
  }
})

Vue.component('product', {
    props: {
      premium:{
        type: Boolean,
        required: true
      }
    },
    template: `
    <div class="product">
      <div class="product-image">
        <img v-bind:src="image" alt="" >
      </div>
      <div class="product-info">
        <h1><a v-bind:href="link" target="_blank">{{ title }}</a></h1>
        <p>{{ description }}</p>
        <p v-if="quantity > 10">In Stock</p>
        <p v-else-if="quantity < 10 && quantity > 0">Soon Finishing</p>
        <p v-else :class="{outOfStock: (quantity < 10)}">Out of Stock</p>
        <span v-if="onSale">On Sale</span>
        <br />
        <span>{{ shipping }}</span>
        <br />
        <productDetails :details="details"></productDetails>
        <span>Sizes:</span>
        <ul>
          <li v-for="size in sizes">{{ size }}</li>
        </ul>
        <div
          v-for="(variant, index) in variants"
          :key="variant.variantId"
          class="color-box"
          :style="{backgroundColor: variant.variantColor}"
          @mouseover="updateProduct(index)">
        </div>
        <button
            type="button"
            name="button"
            v-on:click="addToCart"
            :disabled="!inStock"
            :class="{disabledButton: !inStock}">
            Add To Cart
        </button>
        <button type="button" name="button" @click="reduceFromCart">Decrement Cart</button>
        <p class="tabs">
          <productTabs></productTabs>
        </p>
      </div>
    </div>`,
    data(){
      return {
        product: "Socks",
        brand: "Shakogele",
        description: "Pair of warm, fuzzy socks",
        selectedVariant: 0,
        link: 'https://www.google.com',
        quantity: 8,
        details: ["80% Cotton", "20% Polyster", 'Gender-neutral'],
        sizes: ["10", "20", '33'],
        variants: [
          {
            variantId: 2234,
            variantColor: "Green",
            variantImage: './assets/images/vmSocks-green.jpeg',
            variantQuantity: 9,
          },
          {
            variantId: 2235,
            variantColor: "Blue",
            variantImage: './assets/images/vmSocks-blue.jpeg',
            variantQuantity: 0,
          }
        ]
      }
    },
    methods: {
      addToCart(){
        this.$emit('add-to-card', this.variants[this.selectedVariant].variantId);
      },
      updateProduct(index){
        this.selectedVariant = index;
      },
      reduceFromCart(){
        this.$emit('remove-from-card', this.variants[this.selectedVariant].variantId);
      },
    },

    computed: {
      title() {
        return this.brand + " " + this.product;
      },
      image() {
        return this.variants[this.selectedVariant].variantImage;
      },
      inStock() {
        return this.variants[this.selectedVariant].variantQuantity > 0;
      },
      onSale() {
        return this.quantity < 10 && this.quantity > 0;
      },
      shipping() {
        return this.premium ? 'Free Shipping' : 2.99;
      }
    }
})
var app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: []
  },
  methods:{
    updateCart(id){
      this.cart.push(id);
    },
    reduceFromCart(id){
      index = this.cart.indexOf(id);
      this.cart.splice(index, 1);
    }
  },
  computed:{
    cardSize(){
      return this.cart.length;
    }
  }
})
