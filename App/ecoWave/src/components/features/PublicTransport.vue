<template>
    <div class="public-transport">
      <h3>Public Transport Options</h3>
      <ul>
        <li v-for="route in routes" :key="route.id">{{ route.mode }} - {{ route.duration }} mins</li>
      </ul>
    </div>
  </template>
  
  <script>
  import { ref, watchEffect } from 'vue';
  
  export default {
    name: 'PublicTransport',
    props: {
      start: Object,
      end: Object
    },
    setup(props) {
      const routes = ref([]);
  
      const getPublicTransportRoutes = async (startLocation, endLocation) => {
        const start = `${startLocation.latitude},${startLocation.longitude}`;
        const end = `${endLocation.latitude},${endLocation.longitude}`;
  
        const response = await fetch(`https://api.sbb.ch/api/travel/v1/connections?from=${start}&to=${end}`, {
          headers: {
            'Authorization': `Bearer YOUR_API_KEY`
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch public transport routes');
        }
  
        const data = await response.json();
  
        return data.connections.map((connection, index) => ({
          id: index + 1,
          mode: connection.sections[0].journey.category,
          duration: connection.duration / 60 // Convert to minutes
        }));
      };
  
      watchEffect(async () => {
        if (props.start && props.end) {
          routes.value = await getPublicTransportRoutes(props.start, props.end);
        }
      });
  
      return {
        routes
      };
    }
  }
  </script>
  
  <style>
  .public-transport {
    margin-top: 10px;
  }
  </style>
  