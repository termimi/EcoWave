<template>
  <div>
    <h1>Main Map</h1>
    <div class="map" ref="mapRef"></div>
    <div id="foldable" class="tt-overlay-panel -left-top -medium js-foldable">
      <form id="form">
        <div class="route-input-container">
          <div class="tt-icon tt-icon-size -start"></div>
          <div id="startSearchBox" class="searchbox-container"></div>
        </div>
        <div v-for="(waypoint, index) in waypoints.slice(1, -1)" :key="index" class="route-input-container">
          <div class="tt-icon tt-icon-size -waypoint"></div>
          <div :id="'waypointSearchBox' + index" class="searchbox-container"></div>
          <button class="remove-btn" @click="removeWaypoint(index + 1)">🗑️</button>
        </div>
        <div class="route-input-container">
          <div class="tt-icon tt-icon-size -finish"></div>
          <div id="finishSearchBox" class="searchbox-container"></div>
        </div>
        <button class="add-stop-btn" @click.prevent="addWaypoint">ADD STOP</button>
        <TravelMode @travelModeChanged="updateTravelMode" />
        <div class="route-info" v-if="routeDuration">
          Estimated Travel Time: {{ routeDuration }}
        </div>
        <div class="carbon-footprint" v-if="carbonFootprint">
          Estimated Carbon Footprint: {{ carbonFootprint }} kg CO2
        </div>

        <button @click.prevent="toggleTrafficFlow">Toggle Traffic Flow</button>
        <button @click.prevent="toggleTrafficIncidents">Toggle Traffic Incidents</button>

        <button @click.prevent="navigateToTripHistory">View Trip History</button>
      </form>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import TravelMode from './features/TravelMode.vue';
import PointsOfInterest from './features/PointsOfInterest.vue';
import Traffic from './features/Traffic.vue';
import PublicTransport from './features/PublicTransport.vue';
import TripHistory from './features/TripHistoryPage.vue';

export default {
  name: 'Map',
  components: {
    TravelMode,
    PointsOfInterest,
    Traffic,
    PublicTransport,
    TripHistory
  },
  setup() {
    const mapRef = ref(null);
    const trafficFlow = ref(true);
    const trafficIncidents = ref(true);
    const errorLoadingMap = ref(null);
    const travelMode = ref('car');
    const routeDuration = ref('');
    const carbonFootprint = ref(null);
    const coordinates = ref([]);
    const startLocation = ref(null);
    const endLocation = ref(null);
    const tripHistory = ref([]);
    let map;
    let startMarker = null;
    let finishMarker = null;
    let userLocationMarker = null;
    let userLocation = null;
    const router = useRouter();

    const waypoints = ref([
      { position: undefined, searchBox: null, icon: '-start' },
      { position: undefined, searchBox: null, icon: '-finish' }
    ]);

    const routeColors = {
      car: '#2faaff',
      bus: '#f66606',
      bicycle: '#666666',
      pedestrian: '#ff0000',
      motorcycle: '#986555'
    };

    const addWaypoint = async () => {
      waypoints.value.splice(waypoints.value.length - 1, 0, {
        position: undefined,
        searchBox: null,
        icon: '-waypoint'
      });
      await nextTick();
      createSearchBoxForWaypoint(waypoints.value.length - 2);
    };

    const removeWaypoint = (index) => {
      if (index > 0 && index < waypoints.value.length - 1) {
        waypoints.value.splice(index, 1);
        updateIcons();
        calculateRouteForWaypoints();
      }
    };

    const updateIcons = () => {
      waypoints.value.forEach((waypoint, index) => {
        if (index === 0) {
          waypoint.icon = '-start';
        } else if (index === waypoints.value.length - 1) {
          waypoint.icon = '-finish';
        } else {
          waypoint.icon = '-waypoint';
        }
      });
    };

    const createSearchBoxForWaypoint = async (index) => {
      await nextTick();
      const tt = window.tt;
      const searchBox = new tt.plugins.SearchBox(tt.services, {
        showSearchButton: false,
        searchOptions: {
          key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
        },
        labels: {
          placeholder: getPlaceholder(index),
        },
      });

      const container = index === 0 ? document.getElementById('startSearchBox') :
        index === waypoints.value.length - 1 ? document.getElementById('finishSearchBox') :
        document.getElementById(`waypointSearchBox${index}`);
      if (container) {
        container.appendChild(searchBox.getSearchBoxHTML());

        searchBox.on('tomtom.searchbox.resultselected', (event) => {
          if (event.data && event.data.result) {
            waypoints.value[index].position = event.data.result.position;
            if (index === 0) {
              addStartMarker(event.data.result.position);
              startLocation.value = event.data.result.position;
            } else if (index === waypoints.value.length - 1) {
              addFinishMarker(event.data.result.position);
              endLocation.value = event.data.result.position;
            }
            calculateRouteForWaypoints();
          }
        });

        searchBox.on('tomtom.searchbox.resultscleared', () => {
          waypoints.value[index].position = undefined;
          if (index === 0) {
            removeStartMarker();
          } else if (index === waypoints.value.length - 1) {
            removeFinishMarker();
          }
          calculateRouteForWaypoints();
        });

        waypoints.value[index].searchBox = searchBox;
      }
    };

    const addStartMarker = (position) => {
      if (startMarker) {
        startMarker.remove();
      }
      startMarker = new window.tt.Marker().setLngLat([position.lng, position.lat]).addTo(map);
    };

    const removeStartMarker = () => {
      if (startMarker) {
        startMarker.remove();
        startMarker = null;
      }
    };

    const addFinishMarker = (position) => {
      if (finishMarker) {
        finishMarker.remove();
      }
      finishMarker = new window.tt.Marker().setLngLat([position.lng, position.lat]).addTo(map);
    };

    const removeFinishMarker = () => {
      if (finishMarker) {
        finishMarker.remove();
        finishMarker = null;
      }
    };

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
      const marker = new window.tt.Marker().setLngLat(location).addTo(map);
      const popup = new window.tt.Popup({ offset: 25 }).setText('You are here');
      marker.setPopup(popup).togglePopup();
      return marker;
    };

    const geocode = async (lat, lng) => {
      const response = await fetch(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG`);
      const data = await response.json();
      return data.addresses[0]?.address?.freeformAddress || `${lat}, ${lng}`;
    };

    const calculateRouteForWaypoints = () => {
      const tt = window.tt;
      if (map.getLayer('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }

      let locations = waypoints.value
        .map(waypoint => waypoint.position)
        .filter(position => position)
        .map(position => `${position.lng},${position.lat}`);

      if (!waypoints.value[0].position && userLocation) {
        locations.unshift(`${userLocation.longitude},${userLocation.latitude}`);
      }

      if (locations.length > 1) {
        tt.services.calculateRoute({
          key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
          locations: locations.join(':'),
          travelMode: travelMode.value,
        }).then(async (response) => {
          const geojson = response.toGeoJson();
          map.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: geojson,
            },
            paint: {
              'line-color': routeColors[travelMode.value],
              'line-width': 6,
            },
          });

          const coordinatesArray = geojson.features[0].geometry.coordinates;
          const bounds = new tt.LngLatBounds();
          coordinatesArray.forEach((point) => bounds.extend(tt.LngLat.convert(point)));

          map.fitBounds(bounds, { padding: 100 });

          const routeSummary = response.routes[0].summary;
          const durationInSeconds = routeSummary.travelTimeInSeconds;
          routeDuration.value = formatDuration(durationInSeconds);

          const distanceInMeters = routeSummary.lengthInMeters;
          carbonFootprint.value = calculateCarbonFootprint(travelMode.value, distanceInMeters);

          coordinates.value = coordinatesArray;

          const startAddress = await geocode(startLocation.value.lat, startLocation.value.lng);
          const endAddress = await geocode(endLocation.value.lat, endLocation.value.lng);

          saveTrip({
            date: new Date().toISOString(),
            route: `${startAddress} to ${endAddress}`,
            travelMode: travelMode.value,
            carbonFootprint: carbonFootprint.value
          });

        }).catch((error) => {
          console.error('Error calculating route:', error);
        });
      } else {
        if (map.getLayer('route')) {
          map.removeLayer('route');
          map.removeSource('route');
        }
      }
    };

    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hrs ${remainingMinutes} mins`;
    };

    const getPlaceholder = (index) => {
      switch (index) {
        case 0:
          return 'Start Location';
        case waypoints.value.length - 1:
          return 'End Location';
        default:
          return 'Waypoint';
      }
    };

    const toggleTrafficFlow = () => {
      trafficFlow.value = !trafficFlow.value;
      map.getStyle().layers.forEach((layer) => {
        if (layer.id.includes('traffic')) {
          map.setLayoutProperty(layer.id, 'visibility', trafficFlow.value ? 'visible' : 'none');
        }
      });
    };

    const toggleTrafficIncidents = () => {
      trafficIncidents.value = !trafficIncidents.value;
      map.getStyle().layers.forEach((layer) => {
        if (layer.id.includes('incidents')) {
          map.setLayoutProperty(layer.id, 'visibility', trafficIncidents.value ? 'visible' : 'none');
        }
      });
    };

    const saveTrip = (trip) => {
      let tripHistory = JSON.parse(localStorage.getItem('tripHistory')) || [];
      trip.id = tripHistory.length + 1;
      tripHistory.push(trip);
      localStorage.setItem('tripHistory', JSON.stringify(tripHistory));
    };

    const loadTripHistory = () => {
      return JSON.parse(localStorage.getItem('tripHistory')) || [];
    };

    const calculateCarbonFootprint = (mode, distance) => {
      const emissions = {
        car: 0.12, // kg CO2 per km
        bus: 0.06, // kg CO2 per km
        bicycle: 0, // kg CO2 per km
        pedestrian: 0, // kg CO2 per km
        motorcycle: 0.09 // kg CO2 per km
      };
      return (emissions[mode] * (distance / 1000)).toFixed(2); // distance in km
    };

    const updateTravelMode = (mode) => {
      travelMode.value = mode;
      calculateRouteForWaypoints();
    };

    const navigateToTripHistory = () => {
      router.push('/trip-history');
    };

    onMounted(async () => {
      try {
        userLocation = await getUserLocation();
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
        userLocationMarker = addMarker(map, userLocation.latitude, userLocation.longitude);
        createSearchBoxForWaypoint(0);
        createSearchBoxForWaypoint(waypoints.value.length - 1);

        watch(travelMode, updateTravelMode);

        tripHistory.value = loadTripHistory();

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
      updateTravelMode,
      waypoints,
      addWaypoint,
      removeWaypoint,
      getPlaceholder,
      routeDuration,
      carbonFootprint,
      coordinates,
      startLocation,
      endLocation,
      tripHistory,
      toggleTrafficFlow,
      toggleTrafficIncidents,
      navigateToTripHistory
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
  transition: width 0.1s, height 0.1s;
  width: 32px;
}
.traffic-controls {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
.waypoints {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  max-width: 400px;
  margin: auto;
}

.route-input-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

.searchbox-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin-left: 10px;
}

.searchbox-container {
  flex-grow: 1;
  display: flex;
}

.tt-icon {
  margin-right: 10px;
}

.tt-icon.-start::before {
  content: '🛴';
  font-size: 20px;
}

.tt-icon.-finish::before {
  content: '🏁';
  font-size: 20px;
}

.tt-icon.-waypoint::before {
  content: '🛑';
  font-size: 20px;
}

.remove-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #ff4d4d;
  margin-left: 10px;
}

.add-stop-btn {
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
  margin-top: 10px;
  width: 100%;
  text-align: center;
  transition: background-color 0.3s;
}

.add-stop-btn:hover {
  background-color: #0056b3;
}

.searchbox-container > * {
  flex-grow: 1;
}
.route-info {
  margin-top: 10px;
  font-size: 16px;
}
.carbon-footprint {
  margin-top: 10px;
  font-size: 16px;
  color: green;
}
.points-of-interest {
  margin-top: 10px;
}
.trip-history {
  margin-top: 10px;
}
</style>
