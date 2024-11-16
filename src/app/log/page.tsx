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
  commands: string;
  content: string;
  timestamp: number;
}

const Log: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof Log>('timestamp');
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setLoading(true);
    axios.get('https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve')
      .then((response) => {
        setLogs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching logs:', error);
      })
      .finally(() => {
        setLoading(false);
      });
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
    return 0; // Default sorting by timestamp, you can adjust if other properties need sorting.
  });

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
                    <TableCell>
                      Command ID
                    </TableCell>
                    <TableCell>
                      Content
                    </TableCell>
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
                    <TableRow key={log.commands}>
                      <TableCell>{log.commands}</TableCell>
                      <TableCell style={{ wordWrap: 'break-word', whiteSpace: 'normal', maxWidth: '16rem' }}>
                        {log.content}
                      </TableCell>
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

    </div>

  );
};

export default Log;
