<div align="center">

# Unicode - Unified Coding Profile Tracker 🚀

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3.3-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

*A powerful, all-in-one competitive programming profile tracker that unifies your Codeforces, LeetCode, and CodeChef statistics into a single, beautiful dashboard.*

</div>

---

## 📌 About

**Unicode** is a full-stack web application designed for competitive programmers who compete across multiple platforms. It provides a unified, comprehensive view of your coding profiles, contest performances, and problem-solving progress—all in one place.

### 🎯 Purpose

Competitive programmers often maintain profiles on multiple platforms like **Codeforces**, **LeetCode**, and **CodeChef**. Switching between platforms to track progress is tedious and time-consuming. Unicode solves this problem by automatically fetching and aggregating your stats from all these platforms into a single, intuitive dashboard.

### ✨ What Makes Unicode Special

- **🔗 Unified Dashboard**: View all your platform stats in one place—no more switching tabs
- **📊 Visual Analytics**: Beautiful charts, heatmaps, and graphs showing your progress over time
- **🏆 Contest Tracking**: Never miss a contest with an integrated calendar and Google Calendar sync
- **🔥 Activity Tracking**: See your coding streak and activity patterns across all platforms
- **📈 Performance Comparison**: Compare your ratings and rankings across different platforms
- **🔒 Secure Authentication**: Built on Supabase's robust authentication system
- **📱 Responsive Design**: Access your stats on any device—desktop or mobile

### 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Tailwind CSS, Vite |
| **Charts & Visualization** | ApexCharts, Recharts, React Calendar Heatmap |
| **Animations** | Framer Motion, Motion |
| **Backend** | Node.js, Express.js |
| **Web Scraping** | Cheerio |
| **Database & Auth** | Supabase (PostgreSQL) |
| **External APIs** | Google Calendar API |

---

## 🚀 Features

### 📊 Unified Analytics Dashboard
- Single-view dashboard combining all platform statistics
- Total problems solved breakdown by difficulty
- Rating comparison across platforms
- Performance trends and insights

### 🔥 Activity Heatmap
- Combined coding activity visualization
- Platform-specific activity breakdown
- Custom date range selection
- Streak tracking

### 🗓️ Contest Management
- Aggregated contest calendar from all platforms
- Google Calendar integration for reminders
- Platform filtering options
- Upcoming contests widget

### 📈 Rating & Performance Charts
- Rating progress over time
- Contest-wise performance comparison
- Skill radar chart
- Max rating achievements

### 👤 User Profiles
- Customizable profile with personal information
- Platform username linking
- Public profile sharing
- Profile picture and bio

---

## 🏗️ Project Structure

```
Unicode/
├── backend/                    # Express.js backend server
│   ├── controllers/           # Request handlers
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic & data fetching
│   ├── middleware/            # Authentication middleware
│   └── supabase/              # Supabase client configuration
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── codeforces/    # Codeforces-specific components
│   │   │   └── *.jsx          # General components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts (Auth, Theme, etc.)
│   │   ├── router.jsx         # Routing configuration
│   │   └── supabaseClient.js  # Supabase client
│   │
│   └── index.html             # Entry HTML file
│
├── README.md                   # Project documentation
└── SETUP.md                    # Setup guide
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Supabase Account** (free tier works perfectly)

### Installation

1. **Clone the repository**
   
```
bash
   git clone https://github.com/your-username/unicode.git
   cd unicode
   
```

2. **Setup Backend**
   
```
bash
   cd backend
   npm install
   # Configure .env file (see SETUP.md)
   npm run dev
   
```

3. **Setup Frontend**
   
```
bash
   cd frontend
   npm install
   # Configure .env file (see SETUP.md)
   npm run dev
   
```

4. **Open the App**
   Visit `http://localhost:5173` in your browser

For detailed setup instructions, check out [SETUP.md](SETUP.md)

---

## 🔌 Supported Platforms

| Platform | Status | Data Fetched |
|----------|--------|--------------|
| **Codeforces** | ✅ Active | Rating, solved problems, contests, activity |
| **LeetCode** | ✅ Active | Rating, problems by difficulty, contests |
| **CodeChef** | ✅ Active | Stars, rating, contests |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend-as-a-service
- [Cheerio](https://cheerio.js.org/) for web scraping capabilities
- All competitive programming platforms for their public APIs
- The open-source community for inspiration and tools

---

<div align="center">

**Made with ❤️ for competitive programmers**

⭐ Star us on GitHub if you find this useful!

</div>
