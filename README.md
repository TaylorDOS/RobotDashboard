# Robot Dashboard

Robot Dashboard is a web-based application designed to monitor and manage robotic workflows in real time within our Hospital Logistics Delivery System. The dashboard supports webhooks for live updates and integrates with AWS Lambda via webhooks for seamless communication with our backend.

---

## Features

- **Real-Time Updates:** Tracks delivery tasks in real time.
- **Task Tracker:** Displays task progress with states: `Waiting`, `Moving`, `Pickup`, `Dropoff`, and `Done`.
- **Webhook Integration:** Supports triggers for initiating robotic tasks.
- **AWS Integration:** Communicates with AWS Lambda functions and DynamoDB for storing and retrieving data.
- **User-Friendly Interface:** Built with Tailwind CSS for a clean and modern UI.
- **REST API:** Provides endpoints for seamless integration with robotic systems.

---

## Technologies Used

- **Frontend:** [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [AWS Lambda](https://aws.amazon.com/lambda/)
- **Database:** [AWS DynamoDB](https://aws.amazon.com/dynamodb/)
- **Languages:** TypeScript, JavaScript (ESM)
- **Hosting:** [Vercel](https://vercel.com/)

---

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Pages Breakdown

### Home Page (`/`)

The **Home Page** serves as the landing interface for users. It provides:

- A quick summary of the system status
- Access to key functions like adding tasks
- A clean and user-friendly layout built with Tailwind CSS
- Entry point for authenticated users (if using Cognito with NextAuth)

> This is typically the first page users see and is designed for fast task initiation and navigation.

---

### Overview Page (`/overview`)

The **Overview Page** is designed for **real-time monitoring** and **operational visibility**. It includes:

- Detailed task progress: `Pending`, `UserDropoff`, `MoveToStart`, `Loading`, `LoadingDone`, `MoveToEnd`, `Unloading`, `UnloadingDone`, `Completed`
- Task metadata such as timestamps, assigned robot, and delivery route
- Ideal for staff or admins monitoring multiple tasks simultaneously

> Think of it as the control room for your robotic delivery system.

---

### Admin Simulator Page (`/admin`)

The **Admin Simulator Page** is designed for administrators to create, monitor, manage, and interact with delivery tasks in real time. It provides a comprehensive interface for task management, user information, and station status updates.


## API Functionalities

The Robot Dashboard provides a REST API for seamless integration with robotic systems. Below are the key endpoints:

### **1. Fetch Tasks**
- **Endpoint:** `GET /api/fetchTasks`
- **Description:** Retrieves tasks for a specific user.
- **Query Parameters:**
  - `userId` (string): The ID of the user.
  - `message` (string): Optional message to filter tasks.
- **Example Request:**
  ```bash
  curl -X GET "http://localhost:3000/api/fetchTasks?userId=testUser&message=SendQueue"
  ```
- **Response:**
  ```json
  {
    "tasks": [
      {
        "taskId": "task123",
        "status": "MoveToStart",
        "robotId": "robot456",
        "timestamps": {
          "created": "2025-04-14T10:00:00Z",
          "lastUpdated": "2025-04-14T10:15:00Z"
        }
      }
    ]
  }
  ```

### **2. Update Task Status**
- **Endpoint:** `POST /api/status`
- **Description:** Updates the status of a specific task.
- **Request Body:**
  ```json
  {
    "taskId": "task123",
    "status": "LoadingDone"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Task status updated successfully."
  }
  ```

### **3. Get Users**
- **Endpoint:** `GET /api/getUsers`
- **Description:** Retrieves a list of users.
- **Response:**
  ```json
  {
    "users": [
      {
        "userId": "user123",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    ]
  }
  ```

### **4. Classify Priority**
- **Endpoint:** `POST /api/priority`
- **Description:** Classifies a task description into a category and assigns a priority.
- **Request Body:**
  ```json
  {
    "description": "Deliver blood sample to lab"
  }
  ```
- **Response:**
  ```json
  {
    "category": "Samples",
    "priority": 1
  }

---

### Task Statuses

The following statuses are used to track the progress of tasks:

- **Pending**: Task is created but not yet started.
- **UserDropoff**: User has dropped off the item.
- **MoveToStart**: Robot is moving to the starting location.
- **Loading**: Robot is being loaded with the item.
- **LoadingDone**: Loading is complete.
- **MoveToEnd**: Robot is moving to the destination.
- **Unloading**: Robot is being unloaded.
- **UnloadingDone**: Unloading is complete.
- **Completed**: Task is finished successfully.

---

## Environment Variables

Before running the application, create a `.env.local` file in the root directory and declare the following variables:

```env
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_CLIENT_SECRET=your_cognito_client_secret
COGNITO_ISSUER=https://cognito-idp.ap-southeast-1.amazonaws.com/your_cognito_pool
COGNITO_USER_POOL_ID=your_user_pool_id
NEXTAUTH_SECRET=your_nextauth_secret
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```


---

## Deployment

### 1. **Deploying to Vercel**

You can easily deploy Robot Dashboard with [Vercel](https://vercel.com/):

1. **Push your code to GitHub**
2. **Log into [Vercel](https://vercel.com/) and import your project.**
3. During setup:
   - Choose the correct **framework preset**: `Next.js`
   - Set the following **Environment Variables** in the Vercel dashboard:

     | Variable | Description |
     |----------|-------------|
     | `COGNITO_CLIENT_ID` | AWS Cognito client ID |
     | `COGNITO_CLIENT_SECRET` | AWS Cognito client secret |
     | `COGNITO_ISSUER` | Cognito issuer URL |
     | `COGNITO_USER_POOL_ID` | Cognito user pool ID |
     | `NEXTAUTH_SECRET` | Secret for NextAuth session encryption |
     | `AWS_ACCESS_KEY_ID` | AWS access key for Lambda/DynamoDB |
     | `AWS_SECRET_ACCESS_KEY` | AWS secret access key for Lambda/DynamoDB |

4. **Click "Deploy".**

Once deployed, your app will be live at a `vercel.app` domain or your custom domain.

---
