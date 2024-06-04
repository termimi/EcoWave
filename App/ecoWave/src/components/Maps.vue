<script>
import { onMounted,ref } from 'vue';
const userLongitude = ref(null);
const userLatitude = ref(null);
const getLocationOfUser = ()=>{
    navigator.geolocation.getCurrentPosition((position) => {
        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;
    })
}
const AddMarker =(map)=>{
    const tt = window.tt; 
    var location = [-121.91595, 37.36729]; 
    var popupOffset = 25; 
 
    var marker = new tt.Marker().setLngLat(location).addTo(map); 
    var popup = new tt.Popup({ offset: popupOffset }); 
    reverseGeocoding(marker, popup); 
    marker.setPopup(popup).togglePopup(); 
}
export default { 
  name: 'Map', 
  setup() { 
    const mapRef = ref(null); 
    onMounted(() => { 
       
            const tt = window.tt; 
            var map = tt.map({ 
            key: 'R7dnyFDjCXpftwFLBGDFaklxWOOpPPsG', 
            container: mapRef.value, 
            style: 'tomtom://vector/1/basic-main', 
        }); 
        map.addControl(new tt.FullscreenControl()); 
        map.addControl(new tt.NavigationControl());  
        AddMarker(map);
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
</style> 

<template>
    <h1>Maps</h1>
    <div class="map" ref="mapRef">

    </div>
</template>
