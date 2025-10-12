import { createApp } from 'vue';
import './style.css';
import SchedulePage from './components/SchedulePage.vue';
import axios from 'axios';

// Configure axios globally
axios.defaults.withCredentials = true; // Enable cookies for session-based auth

// Set baseURL only if VITE_API_BASE_URL is defined
// Development: Empty string (use Vite proxy)
// Production: Full API URL (e.g., https://api.your-domain.com)
const apiBaseURL = import.meta.env.VITE_API_BASE_URL;
if (apiBaseURL) {
  axios.defaults.baseURL = apiBaseURL;
}

const app = createApp(SchedulePage);

app.mount('#app');
