<template>
  <div class="tt-overlay-panel" style="width: 320px;">
    <div class="tt-form-label">
      Travel mode
      <select :value="travelMode" @change="handleTravelModeChange" class="tt-select">
        <option value="pedestrian">Pedestrian</option>
        <option value="car">Car</option>
        <option value="truck">Truck</option>
        <option value="bicycle">Bicycle</option>
        <option value="bus">Bus</option>
        <option value="van">Van</option>
        <option value="motorcycle">Motorcycle</option>
        <option value="taxi">Taxi</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TravelModeSelector',
  props: {
    travelMode: {
      type: String,
      required: true
    }
  },
  methods: {
    handleTravelModeChange(event) {
      this.$emit('update:travelMode', event.target.value);
      this.$emit('travel-mode-changed', event.target.value);
    }
  }
};
</script>

<style scoped>
.tt-overlay-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  padding: 10px;
  z-index: 1;
}
.tt-form-label {
  margin-bottom: 10px;
}
.tt-select {
  width: 100%;
  padding: 5px;
}
</style>
