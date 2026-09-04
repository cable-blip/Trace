import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Radio, Car, ShieldAlert, Layers, ExternalLink, Globe, Compass, ArrowRight, Activity, Satellite } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Node } from '../../types';

interface GeoSpatialMapPanelProps {
  caseId: string;
  nodes: Node[];
  onSelectNode: (nodeId: string) => void;
}

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'CRIME_SCENE' | 'CELL_TOWER' | 'SUSPECT_HOME' | 'ANPR_HIT' | 'OFFSHORE_VAULT' | 'AIRPORT';
  description: string;
  associatedSuspects: string[];
}

const CASE_LOCATIONS: Record<string, MapLocation[]> = {
  'CASE-001': [
    {
      id: 'loc_nhava',
      name: 'Nhava Sheva Port, Container Yard 4',
      lat: 18.9514,
      lng: 72.9469,
      type: 'CRIME_SCENE',
      description: 'Primary contraband seizure site. Container #MUK-8891 intercepted with illicit cargo.',
      associatedSuspects: ['Victor Vance', 'Tariq Ahmed'],
    },
    {
      id: 'loc_wh17',
      name: 'Warehouse 17, Bhiwandi',
      lat: 19.2812,
      lng: 73.0489,
      type: 'SUSPECT_HOME',
      description: 'Storage facility owned by Tariq Ahmed. 18 celltower handoffs registered.',
      associatedSuspects: ['Tariq Ahmed', 'Devendra Sharma'],
    },
    {
      id: 'loc_tower9',
      name: 'Cell Tower #409 (Colaba Range)',
      lat: 18.9067,
      lng: 72.8147,
      type: 'CELL_TOWER',
      description: 'High-frequency burner phone call burst location between 02:00 and 04:00 AM.',
      associatedSuspects: ['Ramesh Kumar', 'Devendra Sharma'],
    },
    {
      id: 'loc_anpr1',
      name: 'ANPR Toll Gate #3 (Vashi Bridge)',
      lat: 19.0645,
      lng: 72.9961,
      type: 'ANPR_HIT',
      description: 'License plate MH-04-AB-1234 (Ramesh Kumar) logged passing toll at 03:14 AM.',
      associatedSuspects: ['Ramesh Kumar'],
    },
  ],
  'CASE-002': [
    {
      id: 'loc_vault9',
      name: 'Server Vault 09, Bengaluru',
      lat: 12.9716,
      lng: 77.5946,
      type: 'CRIME_SCENE',
      description: 'Core banking intrusion gateway and exploit payload command center.',
      associatedSuspects: ['Karan Mehra', 'Rahul Verma'],
    },
    {
      id: 'loc_ecity',
      name: 'Electronic City Tech Hub Safehouse',
      lat: 12.8399,
      lng: 77.6770,
      type: 'SUSPECT_HOME',
      description: 'Cryptocurrency OTC desk and mule cash dispersion center.',
      associatedSuspects: ['Ananya Roy'],
    },
    {
      id: 'loc_airport_blr',
      name: 'Kempegowda Int. Airport BLR Terminal 2',
      lat: 13.1986,
      lng: 77.7066,
      type: 'AIRPORT',
      description: 'Flight escape corridor monitored under Interpol blue notice.',
      associatedSuspects: ['Karan Mehra'],
    },
  ],
  'CASE-003': [
    {
      id: 'loc_mundra',
      name: 'Mundra Port Terminal 3, Gujarat',
      lat: 22.8397,
      lng: 69.7042,
      type: 'CRIME_SCENE',
      description: 'Sealed container #ARM-90 clearance and bribe delivery location.',
      associatedSuspects: ['Captain Kabir Rao', 'Feroz Khan'],
    },
    {
      id: 'loc_bhuj',
      name: 'Bhuj Highway Checkpoint (Rajasthan Corridor)',
      lat: 23.2420,
      lng: 69.6669,
      type: 'ANPR_HIT',
      description: 'Military-spec transport truck KA-01-MJ-9999 intercepted by tactical squad.',
      associatedSuspects: ['Captain Kabir Rao'],
    },
    {
      id: 'loc_jaisalmer',
      name: 'Jaisalmer Desert Depot Storage',
      lat: 26.9157,
      lng: 70.9083,
      type: 'SUSPECT_HOME',
      description: 'Underground desert depot used to cache arms shipments before cross-border transit.',
      associatedSuspects: ['Feroz Khan'],
    },
  ],
  'CASE-004': [
    {
      id: 'loc_calangute',
      name: 'Calangute Beach Dead-Drop (Goa)',
      lat: 15.5439,
      lng: 73.7553,
      type: 'CRIME_SCENE',
      description: 'Primary beach coordinates for synthetic package drop retrieval.',
      associatedSuspects: ['Zack Alva', 'Arjun Nair'],
    },
    {
      id: 'loc_anjuna',
      name: 'Anjuna Cliffside Safehouse',
      lat: 15.5869,
      lng: 73.7436,
      type: 'SUSPECT_HOME',
      description: 'DarkNet distribution hub and cryptocurrency hardware wallet storage.',
      associatedSuspects: ['Arjun Nair'],
    },
    {
      id: 'loc_dabolim',
      name: 'Goa Dabolim Air Cargo Terminal',
      lat: 15.3803,
      lng: 73.8314,
      type: 'AIRPORT',
      description: 'Intercepted air cargo shipment under forged postal courier stamps.',
      associatedSuspects: ['Zack Alva'],
    },
  ],
  'CASE-005': [
    {
      id: 'loc_zaveri',
      name: 'Zaveri Bazaar Refining Workshop (Mumbai)',
      lat: 18.9518,
      lng: 72.8306,
      type: 'SUSPECT_HOME',
      description: 'Induction furnace smelting facility used to melt smuggled gold paste into unmarked bars.',
      associatedSuspects: ['Sanjay Zaveri', 'Rashid Qureshi'],
    },
    {
      id: 'loc_bom_airport',
      name: 'Mumbai CSIA Airport Terminal 2 (Customs Belt)',
      lat: 19.0896,
      lng: 72.8656,
      type: 'AIRPORT',
      description: 'Flight EK-504 courier interception point. 8.5 kg concealed gold paste seized.',
      associatedSuspects: ['Fatima Al-Sayed'],
    },
    {
      id: 'loc_dubai',
      name: 'Dubai Gold Souk Overseas Logistics Hub',
      lat: 25.2697,
      lng: 55.2974,
      type: 'OFFSHORE_VAULT',
      description: 'Source procurement office operated by Sheikh Mansoor cartel.',
      associatedSuspects: ['Mansoor Merchant'],
    },
  ],
};

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const GeoSpatialMapPanel: React.FC<GeoSpatialMapPanelProps> = ({ caseId, nodes, onSelectNode }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'satellite' | 'street'>('satellite');

  const locations = CASE_LOCATIONS[caseId] || CASE_LOCATIONS['CASE-001'];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const firstLoc = locations[0] || { lat: 18.9514, lng: 72.9469 };
    const map = L.map(mapContainerRef.current, {
      center: [firstLoc.lat, firstLoc.lng],
      zoom: locations.length > 2 ? 11 : 9,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // High-Resolution No-Key Satellite & Vector Tiles
    if (mapMode === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &copy; Earthstar Geographics',
        maxZoom: 18,
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
    }

    const markersGroup = L.featureGroup();
    const newMarkers = new Map<string, L.Marker>();

    const createCustomIcon = (type: string, name: string) => {
      let color = '#00D2FF';
      if (type === 'CRIME_SCENE') color = '#FF0055';
      if (type === 'SUSPECT_HOME') color = '#9D4EDD';
      if (type === 'CELL_TOWER') color = '#FFB703';
      if (type === 'ANPR_HIT') color = '#00FF9D';
      if (type === 'AIRPORT') color = '#00F0FF';

      return L.divIcon({
        className: 'custom-geo-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: ${color}; box-shadow: 0 0 16px ${color}; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFFFF;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: #06070A;"></div>
            </div>
            <div style="position: absolute; top: 24px; white-space: nowrap; background: rgba(6,9,15,0.95); color: #FFF; font-family: monospace; font-size: 10px; font-weight: bold; padding: 2px 7px; border-radius: 4px; border: 1px solid ${color}; box-shadow: 0 4px 12px rgba(0,0,0,0.8); pointer-events: none;">
              ${name}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createCustomIcon(loc.type, loc.name),
      });

      marker.bindPopup(`
        <div style="background: #090B10; color: #FFF; font-family: monospace; padding: 6px; font-size: 11px; min-width: 200px;">
          <div style="color: #00D2FF; font-weight: bold; font-size: 12px; margin-bottom: 2px;">${loc.name}</div>
          <div style="color: #94A3B8; font-size: 10px; margin-bottom: 6px;">GPS: ${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E</div>
          <div style="color: #E2E8F0; font-family: sans-serif; font-size: 11px; line-height: 1.4; margin-bottom: 6px;">${loc.description}</div>
          <div style="color: #00FF9D; font-weight: bold;">Suspects: ${loc.associatedSuspects.join(', ')}</div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedLocId(loc.id);
      });

      marker.addTo(markersGroup);
      newMarkers.set(loc.id, marker);
    });

    markersRef.current = newMarkers;

    if (locations.length > 1) {
      const latlngs = locations.map(l => [l.lat, l.lng] as [number, number]);
      L.polyline(latlngs, {
        color: '#00D2FF',
        weight: 2.5,
        opacity: 0.75,
        dashArray: '8, 8',
      }).addTo(map);
    }

    markersGroup.addTo(map);
    map.fitBounds(markersGroup.getBounds().pad(0.35));
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [caseId, locations, mapMode]);

  // Smooth Fly-To Location on Selection
  const handleLocationClick = (loc: MapLocation) => {
    setSelectedLocId(loc.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
      const marker = markersRef.current.get(loc.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const selectedLoc = locations.find(l => l.id === selectedLocId) || locations[0];

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-hidden p-1">
      {/* Top Header */}
      <div className="card-3d p-3 rounded-xl border border-white/10 bg-[#090B10] flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                REAL-WORLD GIS SATELLITE
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">GPS OBJECTIFIED</span>
            </div>
            <h2 className="text-sm font-bold text-white uppercase">
              Tactical Geo Radar & Distance Corridors ({caseId})
            </h2>
          </div>
        </div>

        {/* Map Layer Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-black/80 border border-white/10 p-1 rounded-lg flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2 py-1 rounded transition flex items-center gap-1 text-[10px] font-bold ${
                mapMode === 'satellite' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="w-3 h-3" /> Satellite
            </button>
            <button
              onClick={() => setMapMode('street')}
              className={`px-2 py-1 rounded transition flex items-center gap-1 text-[10px] font-bold ${
                mapMode === 'street' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" /> Vector Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Real Leaflet Map + Distance Matrix Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Real Leaflet Map Container */}
        <div className="lg:col-span-8 h-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#06070A]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ background: '#06070A' }} />

          {/* Map Overlay Compass HUD */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-black/85 backdrop-blur-md border border-cyan-500/30 p-2.5 rounded-xl font-mono text-xs text-slate-300 space-y-1">
            <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" /> TACTICAL RADAR ACTIVE
            </div>
            <div className="text-[11px] text-slate-200">
              Focus: {selectedLoc?.lat.toFixed(4)}° N, {selectedLoc?.lng.toFixed(4)}° E
            </div>
          </div>
        </div>

        {/* Right: Location Dossiers & Distance Matrix (Clickable Redirect) */}
        <div className="lg:col-span-4 h-full flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Active Target Details Card */}
          <div className="card-3d p-4 rounded-xl border border-cyan-500/30 bg-[#0A0D14] space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                {selectedLoc?.type}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">PINPOINT TARGET</span>
            </div>

            <div>
              <h3 className="text-sm font-bold font-mono text-white">{selectedLoc?.name}</h3>
              <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">{selectedLoc?.description}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-xs space-y-1">
              <div className="text-slate-400 text-[10px] uppercase">Associated Operatives:</div>
              <div className="text-emerald-300 font-bold">{selectedLoc?.associatedSuspects.join(', ')}</div>
            </div>
          </div>

          {/* Clickable Geocoded Points List */}
          <div className="card-3d p-3 rounded-xl border border-white/10 bg-[#0A0D14] space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold px-1">
              Tap Location to Redirect & Center:
            </div>
            <div className="space-y-1.5">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => handleLocationClick(loc)}
                  className={`w-full text-left p-2.5 rounded-lg font-mono text-xs flex items-center justify-between border transition ${
                    selectedLoc?.id === loc.id
                      ? 'bg-cyan-500/15 border-cyan-400/60 text-white'
                      : 'bg-black/40 border-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="truncate">{loc.name}</span>
                  <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Objectified Distance Corridors Matrix */}
          <div className="card-3d p-4 rounded-xl border border-white/10 bg-[#0A0D14] space-y-3 shadow-lg flex-1">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 font-mono text-xs">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> OBJECTIFIED DISTANCE MATRIX
              </span>
              <span className="text-[10px] text-slate-400">Haversine</span>
            </div>

            <div className="space-y-2">
              {locations.map((locA, idx) => {
                if (idx === locations.length - 1) return null;
                const locB = locations[idx + 1];
                const dist = calculateDistanceKm(locA.lat, locA.lng, locB.lat, locB.lng);
                const travelTimeMin = Math.round((dist / 60) * 60);

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-xs space-y-1 hover:border-cyan-400/40 transition"
                  >
                    <div className="flex items-center justify-between text-slate-200 text-[11px]">
                      <span className="truncate max-w-[130px] text-cyan-300 font-bold">{locA.name.split(',')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 mx-1" />
                      <span className="truncate max-w-[130px] text-purple-300 font-bold">{locB.name.split(',')[0]}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                      <span className="text-emerald-400 font-bold">{dist} km</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Car className="w-3 h-3 text-amber-400" /> ~{travelTimeMin} mins
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
