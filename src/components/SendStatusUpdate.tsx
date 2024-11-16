import axios from "axios";

const sendStatusUpdate = async (status: string): Promise<{ success: boolean; message: string }> => {
  const STATUS_API_ENDPOINT = "/api/status"; // Local endpoint for /api/status

  try {
    const response = await axios.post(STATUS_API_ENDPOINT, { status });
    console.log(`Status update sent successfully: ${JSON.stringify(response.data)}`);
    return { success: true, message: "Status updated successfully." };
  } catch (error: any) {
    console.error(`Error sending status update: ${error.message}`);
    return { success: false, message: "Failed to update status." };
  }
};

export default sendStatusUpdate;
