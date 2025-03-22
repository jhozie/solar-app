// Shared analytics storage
export let analytics: any[] = [];

// Function to clear analytics
export function clearAnalytics() {
  analytics = [];
}

class AnalyticsStore {
  private data: any[] = [];

  addEntry(entry: any) {
    this.data.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
  }

  getData() {
    return this.data;
  }

  clear() {
    this.data = [];
  }
}

export const analyticsStore = new AnalyticsStore();