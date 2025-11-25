import type { GolfRound } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return result.data as T;
  }

  // Alle Runden abrufen (mit optionalem Type-Filter)
  async getRounds(type?: 'official' | 'training'): Promise<GolfRound[]> {
    const query = type ? `?type=${type}` : '';
    return this.request<GolfRound[]>(`/rounds${query}`);
  }

  // Einzelne Runde abrufen
  async getRound(id: string): Promise<GolfRound> {
    return this.request<GolfRound>(`/rounds/${id}`);
  }

  // Neue Runde erstellen
  async createRound(round: Omit<GolfRound, 'differentialScore'>): Promise<GolfRound> {
    return this.request<GolfRound>('/rounds', {
      method: 'POST',
      body: JSON.stringify(round),
    });
  }

  // Runde aktualisieren
  async updateRound(id: string, round: Partial<GolfRound>): Promise<GolfRound> {
    return this.request<GolfRound>(`/rounds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(round),
    });
  }

  // Runde löschen
  async deleteRound(id: string): Promise<void> {
    await this.request<void>(`/rounds/${id}`, {
      method: 'DELETE',
    });
  }

  // Statistiken abrufen
  async getStatistics(): Promise<any> {
    return this.request<any>('/statistics');
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.json();
  }
}

export const apiService = new ApiService();
