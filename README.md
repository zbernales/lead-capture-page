# Secco Squared - Lead Capture Task

A full-stack lead capture application built with Next.js (App Router), Tailwind CSS, and Supabase.

## Architecture & Decisions
* **Client-Side Validation:** The form validates emails and required fields locally before hitting the server.
* **Server Actions:** Used a Next.js Server Action (`actions/submitLead.ts`) to handle the database mutation and the webhook side-effect securely on the backend.
* **Database Security:** Enabled Row Level Security (RLS) on the `leads` table. Allowed anonymous users to `INSERT` records via the public client, but restricted `SELECT` access. The `/leads` dashboard uses a Server Component with the `service_role` key to bypass RLS, ensuring anonymous users cannot read the data from the client.
* **Webhook Resilience:** The webhook `fetch` is wrapped in a try/catch block. If the webhook fails or the network drops, it logs the error to the server console but still returns a success state to the user, strictly adhering to the prompt requirements.

## How to run locally

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>
   ```

2. **Install dependencies***
    ```bash
    npm install
    ```

3. **Database Setoup**
    Create a new Supabase project. Open the SQL editor in your Supabase dashboard and run the SQL commands found in the schema.sql file located in the root of this repository.
    
4. **Environment Variables**
    Create a `.env.local` file in the root directory and add Supabase credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```

5. **Start the development server**
    ```bash
    npm run dev
    ```