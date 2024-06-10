<template>
    <div class="traffic-controls">
      <button @click="toggleTrafficFlow">Toggle Traffic Flow</button>
      <button @click="toggleTrafficIncidents">Toggle Traffic Incidents</button>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'Traffic',
    props: {
      map: Object
    },
    setup(props) {
      const trafficFlow = ref(true);
      const trafficIncidents = ref(true);
  
      const toggleTrafficFlow = () => {
        trafficFlow.value = !trafficFlow.value;
        if (props.map) {
          props.map.getStyle().layers.forEach((layer) => {
            if (layer.id.includes('traffic')) {
              props.map.setLayoutProperty(layer.id, 'visibility', trafficFlow.value ? 'visible' : 'none');
            }
          });
        }
      };
  
      const toggleTrafficIncidents = () => {
        trafficIncidents.value = !trafficIncidents.value;
        if (props.map) {
          props.map.getStyle().layers.forEach((layer) => {
            if (layer.id.includes('incidents')) {
              props.map.setLayoutProperty(layer.id, 'visibility', trafficIncidents.value ? 'visible' : 'none');
            }
          });
        }
      };
  
      return {
        toggleTrafficFlow,
        toggleTrafficIncidents
      };
    }
  }
  </script>
  
  <style>
  .traffic-controls {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
  }
  </style>
  