<template>
  <div>
    <h1>רשימת משקיעים</h1>
    <p v-if="loading">טוען נתונים...</p>
    <p v-if="error">{{ error }}</p>
    <table v-if="investors.length > 0">
      <thead>
        <tr>
          <th v-for="key in Object.keys(investors[0])" :key="key">
            {{ key }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="investor in investors" :key="investor.Investor_ID">
          <td v-for="value in investor" :key="value">
            {{ value }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!loading && investors.length === 0">לא נמצאו משקיעים.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const investors = ref([]);
const loading = ref(true);
const error = ref(null);

async function fetchInvestors() {
  try {
    // Using a relative path which will be handled by the Vite proxy
    const response = await fetch('/api/investors');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    investors.value = data;
  } catch (e) {
    error.value = 'Failed to fetch investors data. Is the backend server running?';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchInvestors();
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
  text-align: left;
}
</style> 