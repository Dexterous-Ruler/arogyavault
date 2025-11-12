/**
 * React Query hook for nearby clinics
 */
import { useQuery } from "@tanstack/react-query";
import { getNearbyClinics, type Clinic } from "@/lib/api/clinics";
import { useLocation, type Location } from "@/hooks/useLocation";
import { useEffect } from "react";

export function useNearbyClinics(radius: number = 5000, providedLocation?: Location | null) {
  // Use provided location if available, otherwise use hook
  const locationHook = useLocation();
  const location = providedLocation !== undefined ? providedLocation : locationHook.location;
  const locationLoading = providedLocation !== undefined ? false : locationHook.loading;
  const locationError = providedLocation !== undefined ? null : locationHook.error;

  const query = useQuery({
    queryKey: ["nearby-clinics", location?.latitude, location?.longitude, radius],
    queryFn: async () => {
      if (!location) {
        throw new Error("Location not available");
      }
      console.log(`[useClinics] Fetching clinics for location: ${location.latitude}, ${location.longitude} (radius: ${radius}m)`);
      const result = await getNearbyClinics(location.latitude, location.longitude, radius);
      console.log(`[useClinics] Clinics API response:`, result);
      return result;
    },
    enabled: !!location && !locationLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Allow 1 retry
    refetchOnWindowFocus: false,
  });
  
  // Debug: Log query state
  useEffect(() => {
    console.log(`[useClinics] Query state:`, {
      enabled: !!location && !locationLoading,
      hasLocation: !!location,
      locationLoading,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      data: query.data,
      error: query.error,
      status: query.status,
    });
  }, [location, locationLoading, query.isLoading, query.isFetching, query.data, query.error, query.status]);

  // Debug logging
  useEffect(() => {
    if (location) {
      console.log(`[useClinics] Location available: ${location.latitude}, ${location.longitude}`);
    }
    if (locationError) {
      console.error(`[useClinics] Location error:`, locationError);
    }
    if (query.error) {
      console.error(`[useClinics] Query error:`, query.error);
    }
    if (query.data) {
      console.log(`[useClinics] Found ${query.data.clinics?.length || 0} clinics`);
    }
  }, [location, locationError, query.error, query.data]);

  // Combine location error with query error
  return {
    ...query,
    error: locationError || query.error,
  };
}

