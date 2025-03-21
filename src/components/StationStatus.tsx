"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface SlotInfo {
  slot: number;
  status: boolean;
}

interface Station {
  station: string;
  slots: SlotInfo[];
}

interface TopUnit {
  slot: number;
  status: boolean;
}

export function StationStatus() {
  const [stations, setStations] = useState<Station[]>([]);
  const [topUnits, setTopUnits] = useState<TopUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllStationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const stationsResponse = await axios.get(
          "https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve", 
          { params: { message: "BaseStationAvailability" } }
        );
        
        const stationMap: Record<string, SlotInfo[]> = {};
        stationsResponse.data.forEach((item: { station: string; status: boolean; slot: number }) => {
          if (!stationMap[item.station]) {
            stationMap[item.station] = [];
          }
          stationMap[item.station].push({
            slot: item.slot,
            status: item.status
          });
        });
        
        const formattedStations = Object.keys(stationMap).map(stationId => ({
          station: stationId,
          slots: stationMap[stationId].sort((a, b) => a.slot - b.slot)
        }));
        setStations(formattedStations);
        
        const topUnitResponse = await axios.get(
          "https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve", 
          { params: { message: "TopUnitAvailability" } }
        );
        
        const sortedTopUnits: TopUnit[] = topUnitResponse.data.map((unit: any) => ({
          slot: unit.slot,
          status: unit.status ?? false,
        }));
        sortedTopUnits.sort((a, b) => a.slot - b.slot);
        setTopUnits(sortedTopUnits);
      } catch (err) {
        console.error("Error fetching station data:", err);
        setError("Failed to load station data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllStationData();
    
    const intervalId = setInterval(fetchAllStationData, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading && stations.length === 0 && topUnits.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const sortedStations = [...stations].sort((a, b) => a.station.localeCompare(b.station));

  return (
    <div className="flex gap-6">
      {/* Base Stations Container */}
      <div className="bg-white border rounded-lg p-6 flex-1">
        <h2 className="text-xl font-bold text-center mb-6">Base Unit Availability</h2>
        
        <div className="flex justify-center gap-4">
          {sortedStations.map((station) => (
            <div key={station.station} className="bg-gray-100 rounded-lg p-4 text-center min-w-[90px]">
              <h3 className="font-semibold mb-3">{station.station}</h3>
              <div className="flex flex-col items-center gap-2">
                {station.slots.map((slot) => (
                  <div 
                    key={slot.slot} 
                    className={`
                      w-14 flex items-center justify-center rounded-md text-white font-bold
                      ${slot.status ? 'bg-green-500' : 'bg-red-500'}
                      ${slot.slot === 3 ? 'h-28 mb-0' : 'h-14'}
                    `}
                  >
                    {slot.slot}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Unit Container */}
      <div className="bg-white border rounded-lg p-6 flex-1">
        <h2 className="text-xl font-bold text-center mb-6">Top Unit Availability</h2>
        
        <div className="flex justify-center">
          <div className="grid grid-cols-2 gap-3 w-44">
            {/* First row: slots 1 and 4 */}
            <div 
              className={`
                w-full h-14 flex items-center justify-center rounded-md text-white font-bold
                ${topUnits.find(u => u.slot === 1)?.status ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              1
            </div>
            <div 
              className={`
                w-full h-14 flex items-center justify-center rounded-md text-white font-bold
                ${topUnits.find(u => u.slot === 4)?.status ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              4
            </div>
            
            {/* Second row: slots 2 and 5 */}
            <div 
              className={`
                w-full h-14 flex items-center justify-center rounded-md text-white font-bold
                ${topUnits.find(u => u.slot === 2)?.status ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              2
            </div>
            <div 
              className={`
                w-full h-14 flex items-center justify-center rounded-md text-white font-bold
                ${topUnits.find(u => u.slot === 5)?.status ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              5
            </div>
            
            {/* Third row: slots 3 and 6 (both tall) */}
            <div 
              className={`
                w-full h-28 flex items-center justify-center rounded-md text-white font-bold
                ${topUnits.find(u => u.slot === 3)?.status ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              3
            </div>
            <div 
              className={`
                w-full h-28 flex items-center justify-center rounded-md text-white font-bold
                ${topUnits.find(u => u.slot === 6)?.status ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              6
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}