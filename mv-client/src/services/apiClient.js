import axios from 'axios';
import { auth } from './firebaseAuth';
const apiClient = axios.create({ baseURL: 'https://api.movyra.com/v1', timeout: 10000 });
apiClient.interceptors.request.use(async (cfg) => {
  const user = auth.currentUser;
  if (user) { const t = await user.getIdToken(true); cfg.headers.Authorization = `Bearer ${t}`; }
  return cfg;
});
export default apiClient;
