<template>
  <div>
    <h1>Traffic Map</h1>
    <div ref="mapRef" class="map"></div>
    <div class="controls">
      <label>
        <input type="checkbox" v-model="showIncidents" />
        Show Traffic Incidents
      </label>
      <label>
        <input type="checkbox" v-model="showFlow" />
        Show Traffic Flow
      </label>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'

export default {
  name: 'TrafficMap',
  setup() {
    const mapRef = ref(null)
    const map = ref(null)
    const showIncidents = ref(true)
    const showFlow = ref(true)

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

    const initializeMap = async () => {
      const tt = window.tt
      let userLocation;

      try {
        userLocation = await getUserLocation();
      } catch (error) {
        userLocation = { latitude: 51.50276, longitude: -0.12634 }; // Default location if geolocation fails
      }

      map.value = tt.map({
        key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
        container: mapRef.value,
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 13,
        stylesVisibility: {
          trafficIncidents: true,
          trafficFlow: true
        }
      })

      map.value.addControl(new tt.FullscreenControl())
      map.value.addControl(new tt.NavigationControl())
    }

    watch(showIncidents, (newValue) => {
      if (map.value) {
        if (newValue) {
          map.value.showTrafficIncidents()
        } else {
          map.value.hideTrafficIncidents()
        }
      }
    })

    watch(showFlow, (newValue) => {
      if (map.value) {
        if (newValue) {
          map.value.showTrafficFlow()
        } else {
          map.value.hideTrafficFlow()
        }
      }
    })

    onMounted(() => {
      if (window.tt) {
        initializeMap()
      } else {
        console.error('TomTom SDK not loaded')
      }
    })

    return {
      mapRef,
      showIncidents,
      showFlow
    }
  }
}
</script>

<style>
.map {
  height: 50vh;
  width: 50vw;
}
.controls {
  margin-top: 10px;
}
</style>
