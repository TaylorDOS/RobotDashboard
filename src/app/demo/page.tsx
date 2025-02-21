"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from '@mui/material';

interface SlotInfo {
    slot: number;
    available: boolean;
}
  
interface Station {
    station: string;
    slots: SlotInfo[];
}

interface TopUnit {
  slot: number;
  [key: string]: string | boolean | number;
}

interface Log {
  taskID: number;
  status: string;
  progress: string;
  start_station: string;
  end_station: string;
  slot: number;
  priority: number;
  timeslot: number;
  timestamp: number;
}
  
const BaseStationPage: React.FC = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDescription, setSelectedDescription] = useState<string>("");

    const [logs, setLogs] = useState<Log[]>([]);

    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState<keyof Log>('timestamp');

    useEffect(() => {
      fetchLogs();
      fetchBaseStationAvailability();
      fetchTopUnitAvailability();
    }, []);

    
    const fetchBaseStationAvailability = async () => {
      setLoading(true);
      try {
        const response = await axios.get("https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve", {
          params: { message: "BaseStationAvailability" }
        });
        const data = response.data;
        const stationMap: Record<string, SlotInfo[]> = {};
  
        data.forEach((item: { station: string; status: boolean; slot: number }) => {
          if (!stationMap[item.station]) {
            stationMap[item.station] = [];
          }
          stationMap[item.station].push({
            slot: item.slot,
            available: item.status
          });
        });
  
        const formattedStations = Object.keys(stationMap).map(stationId => ({
          station: stationId,
          slots: stationMap[stationId].sort((a, b) => a.slot - b.slot) // Sort slots by slot number
        }));
  
        setStations(formattedStations);
      } catch (error) {
        console.error("Error fetching base station availability:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve', {
          params: { message: "TaskQueue" }
        });
  
        const formattedLogs: Log[] = response.data.map((log: any) => ({
          taskID: log.taskID || "N/A",
          status: log.status || "N/A",
          progress: log.progress || "N/A",
          start_station: log.start_station || "N/A",
          end_station: log.end_station || "N/A",
          slot: log.slot || 0,
          priority: log.priority ?? 0,
          timeslot: log.timeslot || 0,
          timestamp: log.timestamp || Date.now(),
        }));
  
        setLogs(formattedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const handleRequestSort = (property: keyof Log) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };
  
    const sendRequest = (url: string, body: any, description: string) => {
      setSelectedDescription(description);
      axios.post(url, body)
        .then(response => {
          console.log('Response:', response.data);
        })
        .catch(error => {
          console.error('Error sending request:', error);
        });
    };

    const [topUnits, setTopUnits] = useState<TopUnit[]>([]);
    const [loadingTopUnits, setLoadingTopUnits] = useState<boolean>(false);

    const fetchTopUnitAvailability = async () => {
      setLoadingTopUnits(true);
      try {
        const response = await axios.get(
          "https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve",
          { params: { message: "TopUnitAvailability" } }
        );

        const formattedTopUnits: TopUnit[] = response.data.map((unit: any) => ({
          slot: unit.slot || 0,
          ...unit
        }));

        setTopUnits(formattedTopUnits);
      } catch (error) {
        console.error("Error fetching top unit availability:", error);
      } finally {
        setLoadingTopUnits(false);
      }
    };

  return (
    <div className="base-station-page" style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', width: 'fit-content' }}>Task Management</h1>
      
      {/* Description Display */}
      <p style={{ fontSize: '16px', color: 'blue', marginBottom: '20px' }}>Selected task: {selectedDescription}</p>
      
      
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'nowrap', overflowX: 'auto' }}>
                {/* TopUnit */}
                <div style={{ flex: '1 0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px', marginRight: '1%' }}>
                    <h2>TopUnit - Loading</h2>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Load item onto Robot</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 1, message: 'LoadingDone' },"Loading task 1 initiated" )}>
                            Loading 1
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 2, message: 'LoadingDone' },"Loading task 2 initiated")}>
                            Loading 2
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 3, message: 'LoadingDone' },"Loading task 3 initiated")}>
                            Loading 3
                        </button>
                    </div>
                    <h2>TopUnit - Unloading</h2>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Load item onto Robot</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 1, message: 'UnloadingDone' },"Loading task 1 initiated")}>
                            Unloading 1
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 2, message: 'UnloadingDone' },"Loading task 2 initiated")}>
                            Unloading 2
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 3, message: 'UnloadingDone' },"Loading task 3 initiated")}>
                            Unloading 3
                        </button>
                    </div>
                </div>

                {/* Base Unit */}
                <div style={{ flex: '1 0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px', marginRight: '1%' }}>
                    <h2>Base Unit - User Dropoff</h2>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Load item onto Robot</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 1, message: 'UserDropoff' },"Loading task 1 initiated")}>
                            UserDropoff 1
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 2, message: 'UserDropoff' },"Loading task 1 initiated")}>
                            UserDropoff 2
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 3, message: 'UserDropoff' },"Loading task 1 initiated")}>
                            UserDropoff 3
                        </button>
                    </div>
                    <h2>Base Unit - User Pickup</h2>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Load item onto Robot</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 1, message: 'UserCollected' },"Loading task 1 initiated")}>
                            UserPickup 1
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 2, message: 'UserCollected' },"Loading task 1 initiated")}>
                            UserPickup 2
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 3, message: 'UserCollected' },"Loading task 1 initiated")}>
                            UserPickup 3
                        </button>
                    </div>
                </div>
                
                
                
                
                {/* MiR - LoadingDocked */}
                <div style={{ flex: '1 0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px', marginRight: '1%' }}>
                    <h2>MiR - LoadingDocked</h2>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Load item onto Robot</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 1, message: 'LoadingDocked' },"Loading task 1 initiated")}>
                            LoadingDocked 1
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 2, message: 'LoadingDocked' },"Loading task 1 initiated")}>
                            LoadingDocked 2
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 3, message: 'LoadingDocked' },"Loading task 1 initiated")}>
                            LoadingDocked 3
                        </button>
                    </div>
                    <h2>MiR - LoadingDocked</h2>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Load item onto Robot</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 1, message: 'UnloadingDocked' },"Loading task 1 initiated")}>
                            UnloadingDocked 1
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 2, message: 'UnloadingDocked' },"Loading task 1 initiated")}>
                            UnloadingDocked 2
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 3, message: 'UnloadingDocked' },"Loading task 1 initiated")}>
                            UnloadingDocked 3
                        </button>
                    </div>
                </div>
                
                {/* Robot Dashboard */}
                <div style={{ flex: '1 0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px', marginRight: '1%' }}>
                    <h2>Robot Dashboard</h2>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Load item onto Robot</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 1, message: 'AddTask', start: "A", end: "B", slot: 2, timeslot: 10, priority: 1},"Loading task 1 initiated")}>
                            AddTask 1
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 2, message: 'AddTask', start: "B", end: "C", slot: 1, timeslot: 5, priority: 1 },"Loading task 1 initiated")}>
                            AddTask 2
                        </button>
                        <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', marginBottom: '10px' }} onClick={() => sendRequest('https://4oomdu5wr0.execute-api.ap-southeast-1.amazonaws.com/default/WebHooks', { taskID: 3, message: 'AddTask', start: "B", end: "A", slot: 3, timeslot: 24, priority: 1 },"Loading task 1 initiated")}>
                            AddTask 3
                        </button>
                    </div>
                </div>

            </div>
            

        
      {/* Base Station Availability Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                {/* Base Station Availability Section */}
                <div style={{ width: '30%', marginRight: '1%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', justifyContent: 'center'}}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Base Station Availability</h1>
                    <button onClick={fetchBaseStationAvailability} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', borderRadius: '5px', marginBottom: '20px' }}>
                      Refresh
                    </button>
                    {loading ? (
                      <p>Loading...</p>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' }}>
                        {stations.map((station) => (
                          <div key={station.station} style={{ margin: '10px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: '80px', backgroundColor: '#f5f5f5' }}>
                            <h2 style={{ fontWeight: '600' }}>{station.station}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                              {station.slots.map(slot => (
                                <div key={slot.slot} style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: slot.available ? '#4CAF50' : '#F44336', color: 'white', fontWeight: 'bold', borderRadius: '5px' }}>
                                  {slot.slot}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Command Log */}
                <div style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Commands Log</h1>
                <button onClick={fetchLogs} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', borderRadius: '5px', marginBottom: '20px' }}>
                      Refresh
                    </button>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                      <TableCell>TaskID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Start</TableCell>
                      <TableCell>End</TableCell>
                      <TableCell>Slot</TableCell>
                      <TableCell>Timeslot</TableCell>
                      <TableCell>Priority</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.taskID}>
                        <TableCell>{log.taskID}</TableCell>
                        <TableCell>{log.status}</TableCell>
                        <TableCell>{log.progress}</TableCell>
                        <TableCell>{log.start_station}</TableCell>
                        <TableCell>{log.end_station}</TableCell>
                        <TableCell>{log.slot}</TableCell>
                        <TableCell>{log.priority}</TableCell>
                        <TableCell>{log.timeslot}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>

            <div style={{ flex: '0 1 auto', marginRight: '20px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Top Unit Availability</h1>
                    <button onClick={fetchTopUnitAvailability} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', borderRadius: '5px', marginBottom: '20px' }}>
                      Refresh
                    </button>

                    {loadingTopUnits ? (
        <div>Loading...</div>
      ) : topUnits.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Slot</TableCell>
                {[...Array(24)].map((_, index) => (
                  <TableCell key={`slot-${index + 1}`}>{index + 1}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {topUnits.map((unit) => (
                <TableRow key={unit.slot}>
                  <TableCell>{unit.slot}</TableCell>
                  {[...Array(24)].map((_, index) => (
                    <TableCell key={`status-${unit.station}-${index + 1}`}>
                      {unit[index + 1] ? "Available" : "Unavailable"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div>No top unit availability data to display</div>
      )}
    </div>  
      </div>
    );
};


export default BaseStationPage;
