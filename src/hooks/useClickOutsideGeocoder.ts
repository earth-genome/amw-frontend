import { useEffect, RefObject } from "react";

const useGeocoderClickOutside = (
  isGeocoderHidden: boolean,
  geocoderContainerRef: RefObject<HTMLElement>,
  setIsGeocoderHidden: (_state: boolean) => void,
) => {
  useEffect(() => {
    if (isGeocoderHidden) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // check if outside
      if (
        geocoderContainerRef.current &&
        !geocoderContainerRef.current.contains(target) &&
        !target.closest(".mapboxgl-ctrl-geocoder")
      ) {
        geocoderContainerRef.current.classList.add("geocoder-hidden");
        setIsGeocoderHidden(true);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isGeocoderHidden, geocoderContainerRef, setIsGeocoderHidden]);
};

export default useGeocoderClickOutside;
