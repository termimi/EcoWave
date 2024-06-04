<script>
import { onMounted,ref } from 'vue';
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
  } 
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
