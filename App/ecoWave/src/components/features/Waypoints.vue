  <script>
  import { onMounted, ref, nextTick, watch } from 'vue';
  import { createSearchBox, calculateRoute, state } from './features/routing.vue';
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
      const travelMode = ref('car'); 
      let map;
  
      const waypoints = ref([
        { position: undefined, searchBox: null, icon: '-start' }, 
        { position: undefined, searchBox: null, icon: '-finish' } 
      ]);
  
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
  
      const createSearchBoxForWaypoint = (index) => {
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
          document.querySelector(`.searchbox-container:nth-of-type(${index})`);
        container.appendChild(searchBox.getSearchBoxHTML());
  
        searchBox.on('tomtom.searchbox.resultselected', (event) => {
          if (event.data && event.data.result) {
            waypoints.value[index].position = event.data.result.position;
            calculateRouteForWaypoints();
          }
        });
  
        searchBox.on('tomtom.searchbox.resultscleared', () => {
          waypoints.value[index].position = undefined;
          calculateRouteForWaypoints();
        });
  
        waypoints.value[index].searchBox = searchBox;
      };
  
      const calculateRouteForWaypoints = () => {
        const tt = window.tt;
        if (map.getLayer('route')) {
          map.removeLayer('route');
          map.removeSource('route');
        }
  
        const locations = waypoints.value
          .map(waypoint => waypoint.position)
          .filter(position => position)
          .map(position => `${position.lng},${position.lat}`)
          .join(':');
  
        if (locations) {
          tt.services.calculateRoute({
            key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
            locations,
            travelMode: travelMode.value,
          }).then((response) => {
            const geojson = response.toGeoJson();
            map.addLayer({
              id: 'route',
              type: 'line',
              source: {
                type: 'geojson',
                data: geojson,
              },
              paint: {
                'line-color': '#2faaff',
                'line-width': 6,
              },
            });
  
            const coordinates = geojson.features[0].geometry.coordinates;
            const bounds = new tt.LngLatBounds();
            coordinates.forEach((point) => bounds.extend(tt.LngLat.convert(point)));
  
            map.fitBounds(bounds, { padding: 100 });
          });
        }
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
          createSearchBoxForWaypoint(0); 
          createSearchBoxForWaypoint(waypoints.value.length - 1);    
          
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
        updateTravelMode,
        waypoints,
        addWaypoint,
        removeWaypoint,
        getPlaceholder
      };
    }
  }
  </script>
  