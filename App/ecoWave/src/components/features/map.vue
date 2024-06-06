<script>
import tt from '@tomtom-international/web-sdk-maps';

export function initializeMap(containerId, centerCoords) {
  const map = tt.map({
    key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG', // Replace this with your actual TomTom API config
    container: containerId,
    style: 'tomtom://vector/1/basic-main',
    center: centerCoords,
    zoom: 15
  });

  map.addControl(new tt.NavigationControl());
  return map;
}
</script>