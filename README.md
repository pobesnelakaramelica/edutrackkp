# EduTrack Hub: Student Connect

Create a production-ready, highly polished React web application named "EduTrack Hub" for managing educational courses and student enrollments, fully integrated with Supabase for data persistence and authentication.

### 1. TECHNICAL STACK & ARCHITECTURE

- Framework: React with Vite, TypeScript, and React Router DOM.

- Styling: Tailwind CSS with shadcn/ui component library, Lucide React icons, and Sonner toast notifications.

- Backend: Supabase JS Client for Auth and Database operations.

### 2. DATABASE SCHEMA DESIGN (Supabase Setup)

Ensure the application code handles and expects the following Supabase tables:

1. `courses` table:

   - `id` (uuid, primary key, default gen_random_uuid())

   - `title` (text, required)

   - `description` (text)

   - `category` (text, e.g., "Web Development", "Data Science", "UI/UX Design")

   - `duration_weeks` (integer)

   - `created_at` (timestamp with time zone)

2. `enrollments` table:

   - `id` (uuid, primary key, default gen_random_uuid())

   - `user_id` (uuid, references auth.users)

   - `course_id` (uuid, foreign key referencing courses.id)

   - `student_name` (text, required)

   - `student_email` (text, required)

   - `status` (text: 'Active', 'Completed', 'Paused')

   - `enrolled_at` (timestamp with time zone)

### 3. NAVIGATION & PAGES (3 Core Pages + Auth)

Navbar (Header):

- Brand logo "EduTrack Hub" with icon.

- Links: Dashboard (/), Directory (/directory), Add Entry (/add-new).

- User Controls: If logged in, show user email avatar and "Logout" button. If logged out, show "Login / Register" button.

Page 1: Auth Page (`/auth`)

- Tabbed card layout switching between "Login" and "Register".

- Supabase Auth integration using Email & Password.

- Protected Routes: Redirect non-authenticated users to `/auth` when attempting to access `/add-new` or `/directory`.

Page 2: Dashboard / Home (`/`)

- Hero banner welcoming the user to EduTrack Hub.

- Metric Stat Cards: "Total Courses", "Total Enrolled Students", "Active Students", and "Completion Rate (%)".

- Quick Action buttons: "Enroll New Student", "Add Course".

- A preview section showing the latest 3 enrolled students with badges indicating their course and status.

Page 3: Add Data Form Page (`/add-new`)

- Dual-Tab Form UI (using shadcn Tabs):

  - Tab A: "Create New Course" -> Form inputs for Title, Category (select dropdown), Duration (weeks), and Description. Inserts into `courses`.

  - Tab B: "Enroll Student" -> Form inputs for Student Name, Student Email, Course Selection (dynamically populated dropdown from `courses` table), and Status ("Active" / "Completed"). Inserts into `enrollments`.

- Real-time form validation with inline error messages and toast success alerts upon saving.

Page 4: Directory & Detail View Page (`/directory`)

- Top Bar: Search input (filter by student name or course title) + Status filter dropdown ("All", "Active", "Completed").

- Display Layout: Grid of interactive cards representing enrolled students, showing Student Name, Course Title badge, Email, Enrollment Date, and Status badge.

- Detail View Modal (Click on any Card):

  - Opens a Dialog showing full student profile info, enrolled course details, course duration, and a status modifier/action button.

### 4. UX & EDGE CASES

- Loading States: Show Skeleton components or spinners while fetching data from Supabase.

- Empty States: Display informative empty-state graphics and clear CTA buttons if no courses or students exist in the database.

- Error Handling: Show user-friendly toast alerts if database queries fail.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://edutrackkp.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cc5212c3-0ae0-4c9e-8839-3ff6701b4b09).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
