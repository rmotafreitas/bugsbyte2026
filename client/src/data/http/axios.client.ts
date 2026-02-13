import axios, { AxiosInstance } from "axios";
import { HttpRequestError } from "../../core/errors/http.error";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "../../constants/config";

class AxiosHttpClient {
  public readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: CONFIG.API.BASE_URL,
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CONFIG.APP.STORAGE_COOKIE_NAME);
    } catch (error) {
      console.error("Error getting token from AsyncStorage:", error);
      return null;
    }
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        // Set Authorization header if token exists in AsyncStorage
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
        console.log("[Request] Headers:", config.headers);
        console.log("[Request] Body:", config.data);

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (axios.isAxiosError(error)) {
          return Promise.reject(
            new HttpRequestError(
              error.message,
              error.response?.status || 500,
              error.config,
              error.response,
            ),
          );
        }
        return Promise.reject(error);
      },
    );
  }
}

const { client: api } = new AxiosHttpClient();

export { api };
