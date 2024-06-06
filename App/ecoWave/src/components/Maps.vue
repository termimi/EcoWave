<template>
  <div>
    <h1>Main Map</h1>
    <div class="map" ref="mapRef"></div>
    <div id="foldable" class="tt-overlay-panel -left-top -medium js-foldable">
      <form id="form">
        <div id="startSearchBox" class="searchbox-container">
          <div class="tt-icon tt-icon-size icon-spacing-right -start"></div>
        </div>
        <div id="finishSearchBox" class="searchbox-container">
          <div class="tt-icon tt-icon-size icon-spacing-right -finish"></div>
        </div>
        <div class="traffic-controls">
          <label for="trafficFlowToggle">Show Traffic Flow</label>
          <input type="checkbox" id="trafficFlowToggle" v-model="trafficFlow" @change="toggleTrafficFlow">
          <label for="trafficIncidentsToggle">Show Traffic Incidents</label>
          <input type="checkbox" id="trafficIncidentsToggle" v-model="trafficIncidents" @change="toggleTrafficIncidents">
        </div>
        <TravelMode @travelModeChanged="updateTravelMode" />
      </form>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import { createSearchBox, updateRouteAddress, calculateRoute, state } from './features/routing.vue';
import TravelMode from './features/TravelMode.vue';

export default {
  name: 'Map',
  components: {
    TravelMode
  },
  setup() {
    const mapRef = ref(null);
    const trafficFlow = ref(true);
    const trafficIncidents = ref(true);
    const errorLoadingMap = ref(null);
    const travelMode = ref('car'); // Define the travel mode reactive property
    let map;

    const getUserLocation = () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    };

    const addMarker = (map, latitude, longitude) => {
      const location = [longitude, latitude];
      const marker = new tt.Marker().setLngLat(location).addTo(map);
      const popup = new tt.Popup({ offset: 25 }).setText('You are here');
      marker.setPopup(popup).togglePopup();
    };

    const toggleTrafficFlow = () => {
      if (trafficFlow.value) {
        map.setTrafficFlowLayerVisibility(true);
      } else {
        map.setTrafficFlowLayerVisibility(false);
      }
    };

    const toggleTrafficIncidents = () => {
      if (trafficIncidents.value) {
        map.setTrafficIncidentsLayerVisibility(true);
      } else {
        map.setTrafficIncidentsLayerVisibility(false);
      }
    };

    const updateRoute = () => {
      if (state.start && state.finish) {
        calculateRoute(map, state, travelMode.value);
      }
    };

    const updateTravelMode = (mode) => {
      travelMode.value = mode;
      updateRoute();
    };

    onMounted(async () => {
      try {
        const userLocation = await getUserLocation();
        const tt = window.tt;
        map = tt.map({
          key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
          container: mapRef.value,
          style: 'tomtom://vector/1/basic-main',
          zoom: 15,
          center: [userLocation.longitude, userLocation.latitude],
          stylesVisibility: {
            trafficFlow: trafficFlow.value,
            trafficIncidents: trafficIncidents.value
          }
        });
        map.addControl(new tt.FullscreenControl());
        map.addControl(new tt.NavigationControl());
        addMarker(map, userLocation.latitude, userLocation.longitude);
        createSearchBox('start', map, travelMode.value);
        createSearchBox('finish', map, travelMode.value);
        
        watch(travelMode, updateRoute);
      } catch (error) {
        console.error('Error loading map:', error);
        errorLoadingMap.value = true;
      }
    });

    return {
      mapRef,
      trafficFlow,
      trafficIncidents,
      errorLoadingMap,
      travelMode,
      updateTravelMode
    };
  }
}
</script>

<style>
.map {
  height: 50vh;
  width: 50vw;
}
.tt-overlay-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  padding: 10px;
  z-index: 1;
}
.searchbox-container {
  display: flex;
}
.route-marker {
  align-items: center;
  background-color: #4a90e2;
  border: solid 3px #2faaff;
  border-radius: 50%;
  display: flex;
  height: 32px;
  justify-content: center;
  transition:
    width 0.1s,
    height 0.1s;
  width: 32px;
}
.traffic-controls {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
</style>
