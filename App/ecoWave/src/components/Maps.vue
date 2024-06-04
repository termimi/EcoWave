<script>
import { onMounted,ref } from 'vue';
let userLongitude = ref(null);
let userLatitude = ref(null);
let latitude =ref(null);
const getLocationOfUser = async ()=>{
    
}
const AddMarker =(map,latitude,longitude)=>{
    const tt = window.tt; 
    var location = [longitude, latitude]; 
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
        console.log("lattt :" + userLatitude.value);
        navigator.geolocation.getCurrentPosition((position) => {
            userLatitude.value = position.coords.latitude;
            userLongitude.value = position.coords.longitude;
            AddMarker(map,userLatitude.value,userLongitude.value);
        })
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
