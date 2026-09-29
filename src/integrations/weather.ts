export interface WeatherLocation {
  readonly label: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

export interface WeatherSnapshot {
  readonly location: WeatherLocation;
  readonly observedAt: string;
  readonly temperatureCelsius: number;
  readonly condition: string;
  readonly highCelsius?: number;
  readonly lowCelsius?: number;
  readonly precipitationProbability?: number;
}

export interface WeatherProviderStatus {
  readonly connected: boolean;
  readonly message: string;
}

export interface WeatherProvider {
  getStatus(): Promise<WeatherProviderStatus>;
  getCurrent(location: WeatherLocation): Promise<WeatherSnapshot | null>;
}

export class UnavailableWeatherProvider implements WeatherProvider {
  async getStatus(): Promise<WeatherProviderStatus> {
    return {
      connected: false,
      message: "A weather provider is not connected in this Development source foundation.",
    };
  }

  async getCurrent(_location: WeatherLocation): Promise<WeatherSnapshot | null> {
    return null;
  }
}
