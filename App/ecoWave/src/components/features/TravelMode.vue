<template>
  <div class="travel-mode">
    <label for="travelModeSelect">Travel Mode:</label>
    <select id="travelModeSelect" v-model="selectedMode" @change="emitTravelModeChange">
      <option value="car">Car</option>
      <option value="bus">Bus</option>
      <option value="bicycle">Bicycle</option>
      <option value="pedestrian">Marche</option>
      <option value="motorcycle">Motorcycle</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'TravelMode',
  data() {
    return {
      selectedMode: 'car'
    };
  },
  methods: {
    emitTravelModeChange() {
      this.$emit('travelModeChanged', this.selectedMode);
    }
  }
}
</script>

<style scoped>
.travel-mode {
  margin-top: 10px;
}
</style>
