<script>
import { ref } from 'vue';

let autoNav = ref(false);
export const state = {
  start: undefined,
  finish: undefined,
  marker: {
    start: undefined,
    finish: undefined,
  },
};

const emissionFactors = {
  car: 0.12, // kg CO2 per km
  bus: 0.06, // kg CO2 per km
  bicycle: 0, // kg CO2 per km
  pedestrian: 0, // kg CO2 per km
  motorcycle: 0.09, // kg CO2 per km
};

export const calculateCarbonFootprint = (mode, distanceInMeters) => {
  const distanceInKm = distanceInMeters / 1000;
  return (distanceInKm * emissionFactors[mode]).toFixed(2);
};

const drawMarker = (type, map) => {
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

  updateBounds(map);
};

const updateBounds = (map) => {
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

const updateRoutesBounds = (coordinates, map) => {
  const tt = window.tt;
  const bounds = new tt.LngLatBounds();

  coordinates.forEach((point) => {
    bounds.extend(tt.LngLat.convert(point));
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { duration: 0, padding: 50 });
  }
};

const setMapOptions = (map, state) => {
  const zoom = 18;
  const bearing = 130;
  map.setCenter(state['start']);
  map.setZoom(zoom);
  map.setBearing(bearing);
};

const calculateRoute = (map, state) => {
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
      traffic: true,
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
        updateRoutesBounds(coordinates, map);
        setMapOptions(map, state);
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};

export const onResultSelected = (result, type, map, userPosition) => {
  const pos = result.position;
  state[type] = [pos.lng, pos.lat];
  if (state.start === undefined) {
    state['start'] = [userPosition.lng, userPosition.lat];
    autoNav = true;
  } else {
    autoNav = false;
  }
  drawMarker(type, map);
  calculateRoute(map, state);
};

export const onResultCleared = (type, map) => {
  state[type] = undefined;
  if (autoNav) {
    map.removeLayer('route');
    map.removeSource('route');
  }

  if (state.marker[type]) {
    state.marker[type].remove();
    state.marker[type] = undefined;
    updateBounds();
  }

  calculateRoute(map, state);
};

export const createSearchBox = (type, map, userPosition) => {
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
        onResultSelected(event.data.result, type, map, userPosition);
      }
    });

    searchBox.on('tomtom.searchbox.resultscleared', function () {
      onResultCleared(type, map);
    });
  } catch (error) {
    console.log(error);
  }
};
</script>