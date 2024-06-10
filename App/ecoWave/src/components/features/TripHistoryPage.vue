<template>
  <div>
    <h1>Trip History</h1>
    <ul>
      <li v-for="trip in tripHistory" :key="trip.id">
        <strong>Date:</strong> {{ trip.date }}<br>
        <strong>Route:</strong> {{ trip.route }}<br>
        <strong>Carbon Footprint:</strong> {{ trip.carbonFootprint }} kg CO2<br>
        <strong>Travel Mode:</strong> {{ trip.travelMode }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'TripHistoryPage',
  setup() {
    const tripHistory = ref([]);

    onMounted(() => {
      tripHistory.value = JSON.parse(localStorage.getItem('tripHistory')) || [];
    });

    return {
      tripHistory
    };
  }
}
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #f9f9f9;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

strong {
  display: block;
  margin-bottom: 5px;
}
</style>
