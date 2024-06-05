<script>
import { onMounted, ref } from 'vue';
 
export const state = {
  start: undefined,
  finish: undefined,
  marker: {
    start: undefined,
    finish: undefined,
  },
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
  const tt = window.tt;
  const location = [longitude, latitude];
  const marker = new tt.Marker().setLngLat(location).addTo(map);
  const popup = new tt.Popup({ offset: 25 }).setText('You are here');
  marker.setPopup(popup).togglePopup();
};
 
 
const drawMarker = (type) => {
  const tt = window.tt;
  if (state.marker[type]) {
    state.marker[type].remove();
  }
 
  const marker = document.createElement('div');
  const innerElement = document.createElement('div');
 
  marker.className = 'route-marker';
  innerElement.className = `icon tt-icon -white -${type}`;
  marker.appendChild(innerElement);
 
  state.marker[type] = new tt.Marker({ element: marker })
    .setLngLat(state[type])
    .addTo(map);
 
  updateBounds();
};
 
const updateBounds = () => {
  const tt = window.tt;
  const bounds = new tt.LngLatBounds();
 
  if (state.start) {
    bounds.extend(tt.LngLat.convert(state.start));
  }
  if (state.finish) {
    bounds.extend(tt.LngLat.convert(state.finish));
  }
 
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { duration: 0, padding: 50 });
  }
};
const updateRoutesBounds = (coordinates) => {
  const tt = window.tt;
  const bounds = new tt.LngLatBounds();
 
  coordinates.forEach((point) => {
    bounds.extend(tt.LngLat.convert(point));
  });
 
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { duration: 0, padding: 50 });
  }
};
 
const calculateRoute = (map,state) => {
  try {
    const tt = window.tt;
    if (map.getLayer('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }
 
    if (!state.start || !state.finish) {
      return;
    }
 
    const startPos = state.start.join(',');
    const finalPos = state.finish.join(',');
 
    tt.services.calculateRoute({
      key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
      traffic: false,
      locations: `${startPos}:${finalPos}`,
    })
      .then((response) => {
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
            'line-width': 8,
          },
        });
 
        const coordinates = geojson.features[0].geometry.coordinates;
        updateRoutesBounds(coordinates);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  catch(error){
    console.log(error)
  }
 
};
 
 
 
export const onResultSelected = (result, type, map) => {
  const pos = result.position;
  state[type] = [pos.lng, pos.lat];
 
  drawMarker(type);
  calculateRoute(map,state);
};
 
export const onResultCleared = (type, map) => {
  state[type] = undefined;
 
  if (state.marker[type]) {
    state.marker[type].remove();
    state.marker[type] = undefined;
    updateBounds();
  }
 
  calculateRoute(map,state);
};
export const createSearchBox = (type, map) => {
  const tt = window.tt;
  try {
    const searchBox = new tt.plugins.SearchBox(tt.services, {
      showSearchButton: false,
      searchOptions: {
        key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
      },
      labels: {
        placeholder: type === 'start' ? 'Start Location' : 'End Location',
      },
    });
 
    document.getElementById(`${type}SearchBox`).appendChild(searchBox.getSearchBoxHTML());
 
    searchBox.on('tomtom.searchbox.resultselected', function (event) {
      if (event.data && event.data.result) {
        onResultSelected(event.data.result, type, map);
      }
    });
 
    searchBox.on('tomtom.searchbox.resultscleared', function () {
      onResultCleared(type, map);
    });
  }
  catch (error) {
    console.log(error)
  }
 
};
 
export default {
  name: 'Map',
  setup() {
    const mapRef = ref(null);
    let map;
 
 
    const initializeMap = async () => {
      try {
        const userLocation = await getUserLocation();
        const tt = window.tt;
        map = tt.map({
          key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
          container: mapRef.value,
          style: 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.1/mapstyles/basic_main.json',
          center: [userLocation.longitude, userLocation.latitude],
          zoom: 15
        });
 
        map.addControl(new tt.FullscreenControl());
        map.addControl(new tt.NavigationControl());
        addMarker(map, userLocation.latitude, userLocation.longitude);
 
        createSearchBox('start');
        createSearchBox('finish');
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };
 
    onMounted(() => {
      if (window.tt) {
        initializeMap();
      } else {
        console.error('TomTom SDK not loaded');
      }
    });
 
    return {
      mapRef,
    };
  },
};
</script>
 