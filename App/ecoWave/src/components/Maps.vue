<script>
import { onMounted,ref } from 'vue';
let errorLoadingMap = ref(null);
let userPosition = ref({
  lat:null,
  lng:null
});
import { createSearchBox} from './features/routing.vue';
const getUserLocation = () =>{
    return new Promise((resolve,reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            userPosition.lat = position.coords.latitude;
            userPosition.lng = position.coords.longitude
            resolve();
        },
        (error) => {
            reject(error)
        },
        {
            enableHighAccuracy: true, // Demander une haute précision
            timeout: 10000,           // Temps maximum pour obtenir la position (en millisecondes)
            maximumAge: 0             // Empêcher la mise en cache de la position
        });
    }) 
}
const AddMarker =(map,latitude,longitude)=>{
    const tt = window.tt;
    var location = [longitude, latitude]; 
    var popupOffset = 25; 
    var marker = new tt.Marker().setLngLat(location).addTo(map); 
    var popup = new tt.Popup({ offset: popupOffset }); 
    marker.setPopup(popup).togglePopup(); 
}
export default { 
  name: 'Map', 
  setup() { 
    const mapRef = ref(null);
    onMounted(async () => { 
        try{
            await getUserLocation()
            const tt = window.tt; 
            var map = tt.map({ 
                key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG', 
                container: mapRef.value, 
                style: 'tomtom://vector/1/basic-main',
                zoom:15,
                center:[userPosition.lng,userPosition.lat],
              }); 
            map.addControl(new tt.FullscreenControl()); 
            map.addControl(new tt.NavigationControl());
            AddMarker(map,userPosition.lat,userPosition.lng);

            createSearchBox('start',map,userPosition);
            createSearchBox('finish',map,userPosition);
        }
        catch{
            errorLoadingMap = true
        }
    }) 
    return { 
      mapRef, 
    }; 
  }, 
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
</style> 

<template>
    <h1>Maps</h1>
    <div class="map" ref="mapRef">
    
    </div>
    <div id="foldable" class="tt-overlay-panel -left-top -medium js-foldable">
      <form id="form">
        <div id="startSearchBox" class="searchbox-container">
          <div class="tt-icon tt-icon-size icon-spacing-right -start"></div>
        </div>
        <div id="finishSearchBox" class="searchbox-container">
          <div class="tt-icon tt-icon-size icon-spacing-right -finish"></div>
        </div>
      </form>
    </div>
    
</template>
