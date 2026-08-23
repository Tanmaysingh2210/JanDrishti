import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon URLs broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Fallback coordinates for known Jharkhand districts
const DISTRICT_COORDS = {
  ranchi:         [23.3441, 85.3096],
  dhanbad:        [23.7957, 86.4304],
  jamshedpur:     [22.8046, 86.2029],
  bokaro:         [23.6693, 86.1511],
  hazaribagh:     [23.9925, 85.3637],
  giridih:        [24.1853, 86.3042],
  deoghar:        [24.4853, 86.6940],
  dumka:          [24.2673, 87.2478],
  palamu:         [24.0300, 84.0700],
  garhwa:         [24.1581, 83.7782],
  lohardaga:      [23.4363, 84.6830],
  gumla:          [23.0440, 84.5374],
  simdega:        [22.6080, 84.5098],
  chaibasa:       [22.5500, 85.8100],
  seraikela:      [22.4985, 85.9965],
  khunti:         [23.0718, 85.2785],
  ramgarh:        [23.6346, 85.5115],
  koderma:        [24.4640, 85.5960],
  chatra:         [24.2064, 84.8742],
  latehar:        [23.7436, 84.5000],
  pakur:          [24.6375, 87.8437],
  godda:          [24.8280, 87.2121],
  sahibganj:      [25.2433, 87.6344],
  jamtara:        [23.9610, 86.8025],
  east_singhbhum: [22.8046, 86.2029],
  west_singhbhum: [22.5500, 85.8100],
};

function getCoords(issue) {
  if (issue.location?.latitude && issue.location?.longitude) {
    return [issue.location.latitude, issue.location.longitude];
  }
  // fallback by district name
  const district = (issue.location?.district || '').toLowerCase().replace(/\s+/g, '_');
  return DISTRICT_COORDS[district] || DISTRICT_COORDS[district.replace('_', '')] || null;
}

function MapController({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      try {
        map.fitBounds(points, { padding: [48, 48], maxZoom: 10 });
      } catch (_) {}
    }
  }, [points.length]);
  return null;
}

function LegendControl() {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div');
      div.style.cssText = `
        background:rgba(255,255,255,0.95);border-radius:10px;padding:8px 12px;
        font-size:10px;font-family:sans-serif;box-shadow:0 2px 10px rgba(0,0,0,0.18);
        display:flex;flex-direction:column;gap:4px;min-width:120px;
      `;
      div.innerHTML = `
        <div style="font-weight:700;font-size:11px;color:#191c1e;margin-bottom:3px">Issue Status</div>
        ${[
          ['#F36F56','Submitted'],
          ['#8B5CF6','Assigned'],
          ['#3B82F6','In Progress'],
          ['#10B981','Resolved'],
        ].map(([c, l]) =>
          `<div style="display:flex;align-items:center;gap:6px">
            <div style="width:10px;height:10px;border-radius:50%;background:${c};flex-shrink:0"></div>
            <span style="color:#58423d">${l}</span>
          </div>`
        ).join('')}
      `;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map]);
  return null;
}

const STATUS_COLOR = {
  resolved:    '#10B981',
  in_progress: '#3B82F6',
  assigned:    '#8B5CF6',
};
const defaultStatusColor = '#F36F56';

export default function IssueMap({ issues = [], height = 370 }) {
  const plotted = issues
    .map((issue) => ({ issue, coords: getCoords(issue) }))
    .filter(({ coords }) => coords !== null);

  const points = plotted.map(({ coords }) => coords);
  const defaultCenter = [23.6102, 85.2799];

  const getColor = (status) =>
    STATUS_COLOR[(status || '').toLowerCase()] || defaultStatusColor;

  return (
    <div style={{ width: '100%', height }}>
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.length > 0 && <MapController points={points} />}
        <LegendControl />

        {plotted.map(({ issue, coords }, idx) => (
          <CircleMarker
            key={issue._id || idx}
            center={coords}
            radius={11}
            pathOptions={{
              color: '#fff',
              weight: 2.5,
              fillColor: getColor(issue.status),
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              <div style={{ minWidth: 170, fontFamily: 'sans-serif', padding: '2px 0' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#191c1e', marginBottom: 3 }}>
                  {issue.title}
                </div>
                <div style={{ fontSize: 10, color: '#58423d', marginBottom: 4 }}>
                  📍 {[issue.location?.address, issue.location?.district, issue.location?.state]
                    .filter(Boolean).join(', ') || 'Jharkhand'}
                </div>
                <span style={{
                  display: 'inline-block',
                  background: getColor(issue.status),
                  color: '#fff',
                  borderRadius: 4,
                  padding: '1px 7px',
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {issue.status || 'submitted'}
                </span>
                {!issue.location?.latitude && (
                  <span style={{ fontSize: 9, color: '#aaa', display: 'block', marginTop: 3 }}>
                    ⚠ District-level pin
                  </span>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
