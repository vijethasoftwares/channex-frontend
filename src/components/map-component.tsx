import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapProps {
  containerStyle?: React.CSSProperties;
  coordinate: Coordinates;
  coordinates?: Coordinates[];
  className?: string;
}

const MapComponent: FC<MapProps> = ({
  containerStyle,
  coordinates,
  coordinate,
  className,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map",
    googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && (coordinates?.length ?? 0) > 0) {
      const bounds = new google.maps.LatLngBounds();
      coordinates?.forEach((coord) => {
        bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
      });
      map.fitBounds(bounds);
    }
  }, [map, coordinates]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      mapContainerClassName={className || ""}
      center={{ lat: coordinate.lat, lng: coordinate.lng }}
      zoom={20}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM, // position of the zoom control
        },
        disableDefaultUI: true,
      }}
    >
      {coordinates &&
        coordinates.map((coord, index) => (
          <Marker key={index} position={{ lat: coord.lat, lng: coord.lng }} />
        ))}

      {/* Child components, such as markers, info windows, etc. */}
      {/* add custom zoom button */}
      <div className="flex flex-col items-center absolute right-4 bottom-4 gap-1.5">
        <button
          className="flex justify-center items-center bg-white w-10 h-10 rounded-[40px] border text-xl text-black shadow-md hover:bg-zinc-50 active:scale-95 duration-100"
          onClick={() => {
            if (map?.getZoom() === 20) return;
            if (map) {
              if (map) {
                map.setZoom((map.getZoom() ?? 0) + 1);
              }
            }
          }}
        >
          +
        </button>
        <button
          className="flex justify-center items-center bg-white w-10 h-10 rounded-[40px] text-xl border text-black shadow-md hover:bg-zinc-50 active:scale-95 duration-100"
          onClick={() => {
            if (map?.getZoom() === 1) return;
            if (map) {
              if (map) {
                map.setZoom((map.getZoom() ?? 0) - 1);
              }
            }
          }}
        >
          -
        </button>
      </div>

      {coordinate && (
        <>
          <Marker
            onClick={() => {
              map?.setZoom(20);
              map?.setCenter({ lat: coordinate.lat, lng: coordinate.lng });
            }}
            position={{ lat: coordinate.lat, lng: coordinate.lng }}
          />
        </>
      )}
    </GoogleMap>
  ) : (
    <div className="px-5 py-10 flex justify-center items-center w-full h-full">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
};

export default MapComponent;
