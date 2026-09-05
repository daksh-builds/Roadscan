"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";

type Road = {
  id: number;
  name: string;
  road_type?: string;
  latitude?: number;
  longitude?: number;
};

type Defect = {
  id: number;
  inspection_id: number;
  defect_type: string;
  confidence: number;
  severity: number;
  priority_score: number;
  status: string;
  road_name?: string;
  latitude?: number;
  longitude?: number;
};

type RoadMapProps = {
  roads: Road[];
  defects: Defect[];
};

function MapAutoFit({
  roads,
  defects,
}: RoadMapProps) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];

    roads.forEach((road) => {
      if (
        road.latitude !== undefined &&
        road.longitude !== undefined
      ) {
        points.push([
          Number(road.latitude),
          Number(road.longitude),
        ]);
      }
    });

    defects.forEach((defect) => {
      if (
        defect.latitude !== undefined &&
        defect.longitude !== undefined
      ) {
        points.push([
          Number(defect.latitude),
          Number(defect.longitude),
        ]);
      }
    });

    if (points.length > 0) {
      map.fitBounds(points, {
        padding: [40, 40],
      });
    }
  }, [map, roads, defects]);

  return null;
}

function getPriority(score: number) {
  if (score >= 80) {
    return "Urgent";
  }

  if (score >= 50) {
    return "High";
  }

  return "Medium";
}

function getPriorityColor(score: number) {
  if (score >= 80) {
    return "#ef4444";
  }

  if (score >= 50) {
    return "#f97316";
  }

  return "#eab308";
}

export default function RoadMap({
  roads,
  defects,
}: RoadMapProps) {
  const roadPoints = roads.filter(
    (road) =>
      road.latitude !== undefined &&
      road.longitude !== undefined
  );

  const defectPoints = defects.filter(
    (defect) =>
      defect.latitude !== undefined &&
      defect.longitude !== undefined
  );

  delete (
  L.Icon.Default.prototype as unknown as {
    _getIconUrl?: unknown;
  }
)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        className="h-[500px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoFit
          roads={roads}
          defects={defects}
        />

        {/* Roads */}
        {roadPoints.map((road) => (
          <Marker
            key={`road-${road.id}`}
            position={[
              Number(road.latitude),
              Number(road.longitude),
            ]}
          >
            <Popup>
              <div>
                <strong>{road.name}</strong>

                <br />

                <span>
                  Road ID: {road.id}
                </span>

                {road.road_type && (
                  <>
                    <br />
                    <span>
                      Type: {road.road_type}
                    </span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Defects */}
        {defectPoints.map((defect) => {
          const score = Number(
            defect.priority_score
          );

          const color =
            getPriorityColor(score);

          return (
            <CircleMarker
              key={`defect-${defect.id}`}
              center={[
                Number(defect.latitude),
                Number(defect.longitude),
              ]}
              radius={10}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <div className="min-w-[180px]">

                  <strong>
                    {defect.defect_type}
                  </strong>

                  <br />

                  <span>
                    Defect #{defect.id}
                  </span>

                  <hr />

                  <span>
                    Confidence:{" "}
                    {(
                      Number(
                        defect.confidence
                      ) * 100
                    ).toFixed(1)}
                    %
                  </span>

                  <br />

                  <span>
                    Severity:{" "}
                    {defect.severity}/10
                  </span>

                  <br />

                  <span>
                    Priority Score:{" "}
                    {score}/100
                  </span>

                  <br />

                  <strong>
                    Priority:{" "}
                    {getPriority(score)}
                  </strong>

                  <br />

                  <span>
                    Status: {defect.status}
                  </span>

                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="flex flex-wrap gap-5 bg-slate-900 px-5 py-4 text-xs text-slate-300">

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          Urgent
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange-500" />
          High
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          Medium
        </div>

      </div>

      {roadPoints.length === 0 &&
        defectPoints.length === 0 && (
          <div className="bg-slate-900 px-5 py-4 text-sm text-slate-400">
            No GPS coordinates available
            yet. Create an inspection with
            location enabled to see it on the
            map.
          </div>
        )}
    </div>
  );
}