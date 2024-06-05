<script>
import { onMounted, ref, watch } from 'vue'

export default {
  name: 'TrafficMap',
  setup() {
    const mapRef = ref(null)
    const map = ref(null)
    const showIncidents = ref(true)
    const showFlow = ref(true)

    const initializeMap = () => {
      const tt = window.tt
      map.value = tt.map({
        key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG', // Votre clé API TomTom
        container: mapRef.value,
        center: [-0.12634, 51.50276], // Coordonnées initiales de la carte
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