/**
 * Utility functions for client-side code that need to be safely used in SSR contexts
 */

/**
 * Safely check if code is running on the client
 */
export const isClient = typeof window !== "undefined";

// Cache for date values to avoid multiple API calls
interface DateCache {
  date: string;
  year: string;
  timestamp: string;
  lastFetched: number;
}

let dateCache: DateCache | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch date information from the server
 * This ensures consistent date values between server and client
 */
async function fetchDateFromServer(): Promise<{
  date: string;
  year: string;
  timestamp: string;
}> {
  try {
    // Use relative URL to work in both development and production
    const response = await fetch("/api/date");
    if (!response.ok) {
      throw new Error("Failed to fetch date from server");
    }
    const data = await response.json();

    // Update cache
    dateCache = {
      date: data.date,
      year: data.year,
      timestamp: data.timestamp,
      lastFetched: Date.now(),
    };

    return data;
  } catch (error) {
    console.error("Error fetching date from server:", error);
    // Fallback to current date if API fails
    const now = new Date();
    const fallback = {
      date: now.toISOString().split("T")[0],
      year: now.getFullYear().toString(),
      timestamp: now.toISOString(),
    };

    // Update cache with fallback
    dateCache = {
      ...fallback,
      lastFetched: Date.now(),
    };

    return fallback;
  }
}

/**
 * Get date information, using cache if available and not expired
 */
async function getDateInfo(): Promise<{
  date: string;
  year: string;
  timestamp: string;
}> {
  // If we have cached data and it's not expired, use it
  if (dateCache && Date.now() - dateCache.lastFetched < CACHE_DURATION) {
    return {
      date: dateCache.date,
      year: dateCache.year,
      timestamp: dateCache.timestamp,
    };
  }

  // Otherwise fetch fresh data
  return fetchDateFromServer();
}

/**
 * Get the current date in YYYY-MM-DD format, safely for SSR
 * Uses server-provided date for consistency between server and client
 */
export const getTodayDate = (): string => {
  // If we're on the server or don't have cached data yet, use a fallback
  // This will be replaced with the actual date on the client
  if (!isClient || !dateCache) {
    // Initialize fetch on client if needed
    if (isClient && !dateCache) {
      getDateInfo().catch(console.error);
    }

    // Use current date as fallback
    const now = new Date();
    return now.toISOString().split("T")[0];
  }

  // Use cached date
  return dateCache.date;
};

/**
 * Get the current year as a string, safely for SSR
 * Uses server-provided year for consistency
 */
export const getCurrentYear = (): string => {
  // If we're on the server or don't have cached data yet, use a fallback
  if (!isClient || !dateCache) {
    // Initialize fetch on client if needed
    if (isClient && !dateCache) {
      getDateInfo().catch(console.error);
    }

    // Use current year as fallback
    return new Date().getFullYear().toString();
  }

  // Use cached year
  return dateCache.year;
};

/**
 * Get the current origin (URL), safely for SSR
 * Returns a fallback on server, actual origin on client
 */
export const getOrigin = (
  fallback: string = "http://localhost:3000"
): string => {
  if (!isClient) return fallback;
  return window.location.origin;
};

/**
 * Safely access localStorage, with fallbacks for server-side rendering
 */
export const safeLocalStorage = {
  getItem: (key: string, fallback: string = ""): string => {
    if (!isClient) return fallback;
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      console.warn("Error accessing localStorage:", e);
      return fallback;
    }
  },

  setItem: (key: string, value: string): void => {
    if (!isClient) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Error setting localStorage:", e);
    }
  },

  removeItem: (key: string): void => {
    if (!isClient) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Error removing from localStorage:", e);
    }
  },
};

// Initialize date cache on client
if (isClient) {
  getDateInfo().catch(console.error);
}
