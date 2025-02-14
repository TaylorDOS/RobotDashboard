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

interface Station {
  station: string;
  slot: number;
  status: boolean;
}

interface TopUnit {
  slot: number;
  [key: string]: boolean | string; // Allows dynamic slot numbers (1-12)
}


const Log: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof Log>('timestamp');

  useEffect(() => {
    fetchLogs();
    fetchBaseStationAvailability();
    fetchTopUnitAvailability();
  }, []);

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

  const sortedLogs = [...logs].sort((a, b) => {
    if (orderBy === 'timestamp') {
      return order === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    }
    return 0;
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState<boolean>(false);

  const fetchBaseStationAvailability = async () => {
    setLoadingStations(true);
    try {
      const response = await axios.get(
        "https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve",
        { params: { message: "BaseStationAvailability" } }
      );

      const formattedStations: Station[] = response.data.map((station: any) => ({
        station: station.station || "N/A",
        slot: station.slot || 0,
        status: station.status ?? false,
      }));

      setStations(formattedStations);
    } catch (error) {
      console.error("Error fetching base station availability:", error);
    } finally {
      setLoadingStations(false);
    }
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
    <div className="max-w-screen-lg mx-auto mt-8">
      <div className='mx-4 lg:mx-0 flex'>
        <h1 className="text-4xl font-bold mb-4">Commands Log</h1>
        <button
          onClick={fetchLogs}
          className="mx-8 mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Reload
        </button>
      </div>
      <div className="text-md mb-4">
        Command logs provide a real-time record of all actions within the system, capturing essential details like timestamps, command types, status, and parameters. These logs enable operators to track progress, troubleshoot, and ensure smooth operations across all tasks.
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        logs.length > 0 ? (
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
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'timestamp'}
                      direction={orderBy === 'timestamp' ? order : 'asc'}
                      onClick={() => handleRequestSort('timestamp')}
                    >
                      Timestamp
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedLogs.map((log) => (
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
        ) : (
          <div>No logs to display</div>
        )
      )}

      <div className="flex justify-between items-center mt-10 mb-6">
        <h1 className="text-4xl font-bold">Base Station Availability</h1>
        <button
          onClick={fetchBaseStationAvailability}
          className="mx-8 mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Reload
        </button>
      </div>

      {loadingStations ? (
        <div>Loading...</div>
      ) : stations.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Station ID</TableCell>
                <TableCell>Slot</TableCell>
                <TableCell>Availability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stations.map((station) => (
                <TableRow key={`${station.station}-${station.slot}`}>
                  <TableCell>{station.station}</TableCell>
                  <TableCell>{station.slot}</TableCell>
                  <TableCell>{station.status ? "Available" : "Unavailable"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div>No station availability data to display</div>
      )}

      <div className="flex justify-between items-center mt-10 mb-6">
        <h1 className="text-4xl font-bold">Top Unit Availability</h1>
        <button
          onClick={fetchTopUnitAvailability}
          className="mx-8 mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Reload
        </button>
      </div>

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
      );
};

      export default Log;