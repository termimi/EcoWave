<script>
import { onMounted,ref } from 'vue';
let userLongitude = ref(null);
let userLatitude = ref(null);
let errorLoadingMap = ref(null);
const getUserLocation = () =>{
    return new Promise((resolve,reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            userLatitude.value = position.coords.latitude;
            userLongitude.value = position.coords.longitude
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
    //reverseGeocoding(marker, popup); 
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
                center:[userLongitude.value,userLatitude.value]
            }); 
            map.addControl(new tt.FullscreenControl()); 
            map.addControl(new tt.NavigationControl());
            console.log(userLatitude.value)
            AddMarker(map,userLatitude.value,userLongitude.value);
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
</style> 

<template>
    <h1>Maps</h1>
    <div class="map" ref="mapRef">
        
    </div>
    
</template>
