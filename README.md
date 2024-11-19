# Robot Dashboard
Robot Dashboard is a web-based application designed to monitor and manage robotic workflows in real time. The dashboard supports server-sent events (SSE) for live updates and integrates with AWS services for seamless communication with robotic systems and IoT devices.

## Features

- **Real-Time Updates:** Tracks robotic tasks in real time using SSE.
- **Task Tracker:** Displays task progress with states: `Waiting`, `Moving`, `Pickup`, `Dropoff`, and `Done`.
- **Webhook Integration:** Supports triggers for initiating robotic tasks.
- **AWS Integration:** Communicates with AWS Lambda functions and DynamoDB for storing and retrieving data.
- **User-Friendly Interface:** Built with Tailwind CSS for a clean and modern UI.
- **REST API:** Provides endpoints for seamless integration with robotic systems.

---

## Technologies Used

- **Frontend:** [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [AWS Lambda](https://aws.amazon.com/lambda/), Server-Sent Events (SSE)
- **Database:** [AWS DynamoDB](https://aws.amazon.com/dynamodb/)
- **Languages:** TypeScript, JavaScript (ESM)
- **Hosting:** [Vercel](https://vercel.com/)

---


## Getting Started

First, run the development server:

npm install

npm run dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


