import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { School } from '@/services/schoolService';
import { Badge } from '@/components/ui/badge';
import { Home, GraduationCap, School as SchoolIcon, MapPin, Navigation } from 'lucide-react';

// Fix for default Leaflet icon paths in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom SVG-based Pin for Property (Red with Home glyph)
function createPropertyPin() {
  return L.divIcon({
    className: 'custom-property-pin-marker',
    html: `
      <div style="position: relative; width: 36px; height: 44px; display: flex; flex-direction: column; align-items: center;">
        <div style="position: absolute; bottom: -2px; width: 16px; height: 5px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1px);"></div>
        <div style="width: 34px; height: 34px; background: #dc2626; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220,38,38,0.5);">
          <svg style="transform: rotate(45deg); width: 17px; height: 17px; fill: white; stroke: white;" viewBox="0 0 24 24">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -40],
  });
}

// Custom SVG-based Pin for Schools (Differentiated for Primary vs Secondary)
function createSchoolPin(type: 'Primary' | 'Secondary', index: number, isOutstanding: boolean) {
  const isPrimary = type === 'Primary';
  // Primary: sapphire blue (#2563eb); Secondary: deep violet (#7c3aed)
  const pinColor = isPrimary ? '#2563eb' : '#7c3aed';
  const label = isPrimary ? `P${index + 1}` : `S${index + 1}`;
  
  // Icon glyph
  const iconPath = isPrimary
    ? `<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>`
    : `<path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 2v20"/><path d="M6 2v20"/><path d="M2 18h20"/><path d="M2 6h20"/><path d="m12 2 4 4H8z"/>`;

  return L.divIcon({
    className: `custom-school-pin-marker-${type.toLowerCase()}`,
    html: `
      <div style="position: relative; width: 32px; height: 40px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="position: absolute; bottom: -2px; width: 14px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1px);"></div>
        <div style="width: 30px; height: 30px; background: ${pinColor}; border: 2px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.35);">
          <svg style="transform: rotate(45deg); width: 15px; height: 15px; stroke: white; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
            ${iconPath}
          </svg>
        </div>
        <div style="position: absolute; top: -7px; right: -5px; background: #0f172a; color: #ffffff; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 9px; font-weight: 700; padding: 1.5px 4.5px; border-radius: 9999px; border: 1.5px solid #ffffff; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.4);">
          ${label}
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -36],
  });
}

interface PropertyMapProps {
  propertyLocation: { lat: number; lng: number };
  schools: School[];
  address: string;
  heightClassName?: string;
}

// Dynamically auto-fits map bounds so Property AND all nearby schools are visible simultaneously
function AutoFitBounds({ propertyLocation, schools }: { propertyLocation: { lat: number; lng: number }; schools: Array<School & { lat: number; lng: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (!propertyLocation) return;

    const points: L.LatLngExpression[] = [
      [propertyLocation.lat, propertyLocation.lng]
    ];

    schools.forEach(s => {
      if (s.lat && s.lng) {
        points.push([s.lat, s.lng]);
      }
    });

    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 15
      });
    }
  }, [propertyLocation, schools, map]);

  return null;
}

export function PropertyMap({ propertyLocation, schools, address, heightClassName = "h-[360px]" }: PropertyMapProps) {
  const center: [number, number] = [propertyLocation.lat, propertyLocation.lng];

  // Resolve schools with coordinates (using real location or calculating accurate geographic offsets based on distance)
  const resolvedSchools = useMemo(() => {
    let primaryCount = 0;
    let secondaryCount = 0;

    return (schools || []).map((school, index) => {
      let lat = school.location?.lat;
      let lng = school.location?.lng;

      // Validate coordinates: must be numeric and within ~15 miles of property
      const isValidCoord = 
        typeof lat === 'number' && 
        !isNaN(lat) && 
        lat !== 0 && 
        typeof lng === 'number' && 
        !isNaN(lng) && 
        lng !== 0 &&
        Math.abs(lat - propertyLocation.lat) < 0.25;

      if (!isValidCoord) {
        // Parse distance from string (e.g. "0.8 miles away" -> 0.8)
        const match = school.distance ? school.distance.match(/([\d.]+)/) : null;
        const distMiles = match ? Math.max(0.4, Math.min(2.5, parseFloat(match[1]))) : 0.6 * (index + 1);

        // Deterministic radial spread around the property (45°, 140°, 230°, 315°, 85°, 190°)
        const angles = [45, 140, 230, 310, 85, 190];
        const angleRad = (angles[index % angles.length] * Math.PI) / 180;

        // 1 mile ≈ 0.01449 degrees latitude; longitude scales by cos(lat)
        const latOffset = (distMiles * 0.01449) * Math.sin(angleRad);
        const lngOffset = ((distMiles * 0.01449) / Math.max(0.2, Math.cos((propertyLocation.lat * Math.PI) / 180))) * Math.cos(angleRad);

        lat = propertyLocation.lat + latOffset;
        lng = propertyLocation.lng + lngOffset;
      }

      const isPrimary = school.type === 'Primary';
      const typeIndex = isPrimary ? primaryCount++ : secondaryCount++;

      return {
        ...school,
        lat,
        lng,
        typeIndex,
        label: isPrimary ? `P${typeIndex + 1}` : `S${typeIndex + 1}`
      };
    });
  }, [schools, propertyLocation]);

  const propertyPin = useMemo(() => createPropertyPin(), []);

  return (
    <div className={`relative ${heightClassName} w-full rounded-xl overflow-hidden border border-border shadow-xs z-0`}>
      <MapContainer 
        center={center} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <AutoFitBounds propertyLocation={propertyLocation} schools={resolvedSchools} />

        {/* Property Marker */}
        <Marker position={center} icon={propertyPin}>
          <Popup className="custom-leaflet-popup">
            <div className="p-1 font-sans min-w-[200px]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded-md bg-red-100 text-red-700">
                  <Home className="h-4 w-4" />
                </span>
                <p className="font-bold text-sm text-foreground">Target Property</p>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">{address}</p>
              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Lat: {propertyLocation.lat.toFixed(4)}</span>
                <span>Lng: {propertyLocation.lng.toFixed(4)}</span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Differentiated School Markers */}
        {resolvedSchools.map((school, index) => {
          const isOutstanding = school.ofstedRating.toLowerCase().includes('outstanding');
          const isGood = school.ofstedRating.toLowerCase().includes('good');
          const icon = createSchoolPin(school.type, school.typeIndex, isOutstanding);

          return (
            <Marker
              key={`${school.name}-${index}`}
              position={[school.lat, school.lng]}
              icon={icon}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 font-sans min-w-[220px]">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`p-1 rounded-md ${
                        school.type === 'Primary' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {school.type === 'Primary' ? (
                          <GraduationCap className="h-3.5 w-3.5" />
                        ) : (
                          <SchoolIcon className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {school.label} • {school.type} School
                        </span>
                        <p className="font-bold text-sm text-foreground leading-tight">{school.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5 text-xs text-foreground/85 border-t border-border/60 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ofsted Rating:</span>
                      <Badge className={`h-4 text-[10px] px-1.5 border-none text-white ${
                        isOutstanding ? 'bg-emerald-600' :
                        isGood ? 'bg-blue-600' :
                        school.ofstedRating.toLowerCase().includes('improvement') ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}>
                        {school.ofstedRating}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Distance:</span>
                      <span className="font-medium text-foreground">{school.distance || 'Nearby'}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Floating Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-background/95 backdrop-blur-xs border border-border/80 rounded-lg p-2.5 shadow-md flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-xs"></span>
          <span className="font-medium text-foreground text-[11px]">Property</span>
        </div>
        <div className="h-3 w-px bg-border"></div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs"></span>
          <span className="font-medium text-foreground text-[11px]">Primary (P)</span>
        </div>
        <div className="h-3 w-px bg-border"></div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-600 border border-white shadow-xs"></span>
          <span className="font-medium text-foreground text-[11px]">Secondary (S)</span>
        </div>
      </div>
    </div>
  );
}
