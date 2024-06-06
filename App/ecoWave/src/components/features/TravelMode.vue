<template>
    <div>
      <label for="travelModeSelect">Travel Mode:</label>
      <select id="travelModeSelect" v-model="travelMode" @change="onTravelModeChange">
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
  </template>
  
  <script>
  import { ref, watch } from 'vue';
  
  export default {
    name: 'TravelMode',
    emits: ['travelModeChanged'],
    setup(props, { emit }) {
      const travelMode = ref('car');
  
      const onTravelModeChange = () => {
        emit('travelModeChanged', travelMode.value);
      };
  
      watch(travelMode, onTravelModeChange);
  
      return {
        travelMode,
        onTravelModeChange
      };
    }
  };
  </script>
  
  <style scoped>
  #travelModeSelect {
    margin-top: 10px;
  }
  </style>
  