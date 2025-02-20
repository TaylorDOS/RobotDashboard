import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";

// Ensure environment variables are set
const userPoolId = process.env.COGNITO_USER_POOL_ID;

// Initialize Cognito Client
const client = new CognitoIdentityProviderClient({
    region: "ap-southeast-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

// Define user type
export interface CognitoUser {
  username: string;
  email: string;
}

// Fetch users function
export const listUsers = async (): Promise<CognitoUser[]> => {
  try {
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: 20, // Fetch max 20 users
    });

    const response = await client.send(command);

    return response.Users?.map((user) => ({
      username: user.Username || "Unknown",
      email: user.Attributes?.find((attr) => attr.Name === "email")?.Value || "No Email",
    })) || [];
  } catch (error) {
    console.error("Error listing Cognito users:", error);
    return [];
  }
};