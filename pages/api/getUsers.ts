import { NextApiRequest, NextApiResponse } from "next";
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";

const userPoolId = process.env.COGNITO_USER_POOL_ID;

if (!userPoolId || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("Missing required AWS environment variables");
}

const client = new CognitoIdentityProviderClient({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Fetching users from Cognito...");

    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: 20,
    });

    const response = await client.send(command);

    if (!response.Users) {
      return res.status(500).json({ error: "No users found." });
    }

    const users = response.Users.map((user) => ({
      username: user.Username || "Unknown",
      email: user.Attributes?.find((attr) => attr.Name === "email")?.Value || "No Email",
    }));
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching Cognito users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
}