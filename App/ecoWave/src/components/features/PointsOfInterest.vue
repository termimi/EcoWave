<template>
  <div v-if="pointsOfInterest.length" class="points-of-interest">
    <h3>Points of Interest</h3>
    <ul>
      <li v-for="poi in pointsOfInterest" :key="poi.id">{{ poi.name }} - {{ poi.category }}</li>
    </ul>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';

export default {
  name: 'PointsOfInterest',
  props: {
    coordinates: Array
  },
  setup(props) {
    const pointsOfInterest = ref([]);

    const getPointsOfInterest = async (coordinates) => {
      const tt = window.tt;
      const poiData = await tt.services.poiSearch({
        key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
        query: 'restaurant, hotel, gas station, park',
        limit: 10,
        bbox: new tt.LngLatBounds(coordinates).toBBoxString()
      });
      return poiData.results.map(result => ({
        id: result.id,
        name: result.poi.name,
        category: result.poi.categories[0]
      }));
    };

    watchEffect(async () => {
      if (props.coordinates.length) {
        pointsOfInterest.value = await getPointsOfInterest(props.coordinates);
      }
    });

    return {
      pointsOfInterest
    };
  }
}
</script>

<style>
.points-of-interest {
  margin-top: 10px;
}
</style>
