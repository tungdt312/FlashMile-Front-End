import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from "react";
import { MAPBOX_TOKEN } from "../constants/securityConstant.ts";
import mapboxgl from 'mapbox-gl';
import {MapPin} from "lucide-react";

interface MapProps {
    initialData?: {
        lng: number;
        lat: number;
    }; // Nếu có id -> Edit Mode
    onCoordinatesChange?: (coords: { lng: number; lat: number }) => void;
}

const Map = ({initialData, onCoordinatesChange}: MapProps ) => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // State to hold the current center coordinates
    const [coords, setCoords] = useState(initialData? initialData: { lng: -71.06776, lat: 42.35816 });

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [coords.lng, coords.lat],
            zoom: 12
        });

        mapRef.current = map;

        // --- 1. GET INITIAL DEVICE LOCATION ---
        navigator.geolocation.getCurrentPosition((pos) => {
            const { longitude, latitude } = pos.coords;
            map.flyTo({ center: [longitude, latitude], zoom: 14 });
            const newCoords = { lng: longitude, lat: latitude };
            setCoords(newCoords);
            onCoordinatesChange?.(newCoords);
        });

        // --- 2. LISTEN FOR SCROLL/DRAG ---
        map.on('move', () => {
            const center = map.getCenter();
            const newCoords = {
                lng: Number(center.lng.toFixed(5)),
                lat: Number(center.lat.toFixed(5))
            };
            setCoords(newCoords);
            onCoordinatesChange?.(newCoords);
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div className="relative w-full h-full">
            {/* Displaying the coordinates over the map */}
            <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground caption p-2 rounded shadow-md font-mono text-sm">
                Longitude: {coords.lng} | Latitude: {coords.lat}
            </div>

            {/* Visual Center Crosshair (Optional but helpful) */}
            <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
               <MapPin className={"size-6 text-destructive"}/>
            </div>

            <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
        </div>
    );
}

export default Map;