# 🧘‍♀️ YogaStudioZen

**YogaStudioZen** is a modern yoga management website built for a professional yoga studio. It helps manage classes, instructors, attendance, and overall studio operations with a clean and minimal interface.

---

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** Neon (PostgreSQL)
- **Hosting:** Vercel
- **Database Integration:** Neon DB via Vercel Integration

---

## ✨ Features

- 📅 Class scheduling & management
- 👩‍🏫 Instructor profiles
- 📝 Class booking system
- 📊 Admin dashboard
- ✅ Attendance tracking
- 🔐 Secure database connection

---

## 📂 Project Structure

```
.
├── app/
├── components/
├── lib/
├── public/
├── styles/
└── README.md
```

---

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd yogastudiozen
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=your_neon_database_url
```

### 4. Run the development server

```bash
npm run dev
```

The app will run at:

```
http://localhost:3000
```

---

## 🌐 Deployment

This project is deployed using **Vercel**.

Deployment Steps:

1. Push the project to GitHub  
2. Import the repository into Vercel  
3. Configure Neon DB integration  
4. Deploy 🚀  

---

## 🔒 Environment Variables

| Variable       | Description                          |
|---------------|--------------------------------------|
| DATABASE_URL  | Neon PostgreSQL database connection URL |

---

## 📈 Future Improvements

- Online payment integration  
- Email notifications  
- Mobile app support  

---

## 📄 License

This project is intended for internal use by YogaStudioZen Studio.

---

Made with ❤️ using Next.js + TypeScript
