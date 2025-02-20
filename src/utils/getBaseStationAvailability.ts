import axios from "axios";

// Define the base station structure
export interface BaseStation {
  station: string; // Base station name
  slots: { slot: number; status: boolean }[]; // List of slots for the station
}

// Function to fetch and group base station availability
export const getBaseStationAvailability = async (): Promise<BaseStation[]> => {
  try {
    const response = await axios.get(
      "https://umsfyussf6.execute-api.ap-southeast-1.amazonaws.com/default/DynamoRetrieve",
      { params: { message: "BaseStationAvailability" } }
    );

    if (response.data && Array.isArray(response.data)) {
      // Group slots by station
      const stationMap: Record<string, BaseStation> = {};

      response.data.forEach((entry: any) => {
        if (!stationMap[entry.station]) {
          stationMap[entry.station] = { station: entry.station, slots: [] };
        }
        stationMap[entry.station].slots.push({ slot: entry.slot, status: entry.status });
      });

      return Object.values(stationMap);
    } else {
      console.error("Invalid response format from API.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching base station availability:", error);
    return [];
  }
};