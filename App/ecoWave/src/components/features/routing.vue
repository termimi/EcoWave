<script>
import { onMounted, ref } from 'vue';

export const state = {
  start: undefined,
  finish: undefined,
  marker: {
    start: undefined,
    finish: undefined
  }
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

  state.marker[type] = new tt.Marker({ element: marker }).setLngLat(state[type]).addTo(map);

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

const routeColors = {
  pedestrian: '#ff0000',
  car: '#f66606',
  truck: '#f06368',
  bicycle: '#666666',
  bus: '#004b7f',
  van: '#008d8d',
  motorcycle: '#e94743',
  taxi: '#5fb935'
};

export const calculateRoute = (map, state, travelMode) => {
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

    tt.services
      .calculateRoute({
        key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG',
        traffic: true,
        locations: `${startPos}:${finalPos}`,
        travelMode: travelMode
      })
      .then((response) => {
        const geojson = response.toGeoJson();
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          paint: {
            'line-color': routeColors[travelMode],
            'line-width': 8
          }
        });

        const coordinates = geojson.features[0].geometry.coordinates;
        updateRoutesBounds(coordinates, map);
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};

export const onResultSelected = (result, type, map, travelMode) => {
  const pos = result.position;
  state[type] = [pos.lng, pos.lat];

  drawMarker(type, map);
  calculateRoute(map, state, travelMode);
};

export const onResultCleared = (type, map, travelMode) => {
  state[type] = undefined;

  if (state.marker[type]) {
    state.marker[type].remove();
    state.marker[type] = undefined;
    updateBounds();
  }

  calculateRoute(map, state, travelMode);
};

export const createSearchBox = (type, map, travelMode) => {
  const tt = window.tt;
  try {
    const searchBox = new tt.plugins.SearchBox(tt.services, {
      showSearchButton: false,
      searchOptions: {
        key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG'
      },
      labels: {
        placeholder: type === 'start' ? 'Start Location' : 'End Location'
      }
    });

    document.getElementById(`${type}SearchBox`).appendChild(searchBox.getSearchBoxHTML());

    searchBox.on('tomtom.searchbox.resultselected', function (event) {
      if (event.data && event.data.result) {
        onResultSelected(event.data.result, type, map, travelMode);
      }
    });

    searchBox.on('tomtom.searchbox.resultscleared', function () {
      onResultCleared(type, map, travelMode);
    });
  } catch (error) {
    console.log(error);
  }
};

export function updateRouteAddress(map, travelMode) {
  if (map.getLayer('route')) {
    map.setPaintProperty('route', 'line-color', routeColors[travelMode]);
  }
}
</script>
