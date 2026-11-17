# Doctor Tracker — Project Guide

Doctor Tracker is a secure administrative web application. Authenticated users manage doctors and the patients assigned to each doctor. The system is judged on performance, a clean user experience, and data visualization.

## 1. Tech stack

The project must be implemented as two separate applications that talk over REST.

| Layer       | Requirement                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| Frontend    | Next.js, as a separate client application                                    |
| Backend     | Node.js and Express, as a separate standalone server                         |
| Database    | MongoDB                                                                      |
| API         | RESTful endpoints. The frontend communicates with the backend only over REST |
| Client data | Proper state management and data fetching                                    |

## 2. Core features

### 2.1 Authentication

- Only authenticated users can access the portal.
- Implement secure login.
- Protect every route with authentication and authorization.

### 2.2 Doctor management

An admin can:

- Create a doctor with:
  - Name
  - Specialization
  - Hospital
  - Phone
  - Email
- View a list of all doctors.
- Search doctors.
- Filter doctors by date and by other relevant filters.
- Paginate doctor records.
- View the patients that belong to a doctor.
- Add a new patient under a specific doctor.
- Delete a patient from a doctor's patient list.

### 2.3 Patient management

A dedicated Patients page must:

- List all patients.
- Edit patient information.
- Delete patients.
- Paginate the list.
- Search patients.
- Filter by date, patient condition, and other relevant filters.

## 3. Dashboard and data visualization

The admin dashboard must show the data visually.

Required analytics:

- Total doctors
- Total patients
- Patients per doctor
- Date-based statistics

Charts and graphs are required. Any suitable analytics library is acceptable.

Focus on:

- Clean data aggregation
- Optimized query performance
- Meaningful visual insights

## 4. UI and UX

The interface must be modern and visually appealing, and it should demonstrate strong frontend skill.

- Clean layout
- Clear spacing and visual hierarchy
- Responsive design
- Smooth navigation
- UX best practices throughout

Navigation must clearly reach:

- Dashboard
- Doctors
- Patients

## 5. Performance and optimization

Optimize database queries for:

- Searching
- Filtering
- Pagination

Required practices:

- Proper indexes in MongoDB
- Efficient query patterns
- Avoid unnecessary re-renders
- Clean folder structure
- Reusable components
- API validation and error handling

## 6. Evaluation criteria

The project is evaluated on:

- Code structure and cleanliness
- Query optimization
- UX and UI quality
- Data visualization
- Performance
- Authentication
- Best practices in Next.js and MongoDB
- Scalability

## 7. README requirements

`README.md` is the primary technical documentation. It must include every section below.

| Section             | Requirement                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Description         | A one-paragraph elevator pitch for the app's purpose.                                      |
| Setup Guide         | Step-by-step local installation. Must include an `.env.example` file.                      |
| System Architecture | A high-level overview of the data flow and how the services interact.                      |
| Technical Decisions | A deep dive into 2 specific decisions. Example: why Redux was chosen over the Context API. |
| Visual Evidence     | High-quality screenshots of the UI, for both desktop and mobile.                           |

## 8. Submission

Submit the project link and the GitHub repository, including credentials if they are required to sign in.

### How to send it

- **Deadline:** 2 days after receiving the email.
- **Method:** Reply All on the original email so the full thread stays visible. Do not start a new thread.

### Where to host it

- Host the **backend** on a reliable platform such as Render (free tier), Vercel (free tier), or your own paid hosting or VPS.
- Deploy the **frontend** to a free host such as Vercel or Netlify.

### What the reply must include

- Frontend GitHub repository link
- Backend GitHub repository link
- Live frontend website URL
- Live backend API URL, if applicable

The computer used in the interview must be able to run the project in a local development environment.
