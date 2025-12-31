# Default User Accounts

## 🔐 Admin Account

**Email:** `admin@studycoach.com`  
**Password:** `admin123`  
**Role:** Administrator  
**Field of Study:** Computer Science  
**Level:** Advanced  

### Admin Features:
- Access to admin dashboard at `/admin`
- System overview and statistics
- User management capabilities
- Coding problem management
- System analytics and reports

---

## 👨‍🎓 Demo Student Account

**Email:** `student@example.com`  
**Password:** `student123`  
**Role:** Student  
**Field of Study:** Software Engineering  
**Level:** Beginner  

### Student Features:
- All standard learning features
- AI tutor chat
- Personalized study plans
- Quiz practice
- Coding challenges
- Progress tracking

---

## 🚀 How to Use

1. **Start your servers** (backend and frontend)
2. **Run the seed script** to create these accounts:
   ```bash
   cd backend
   npm run db:seed
   ```
3. **Login with either account** at http://localhost:3000

## 🔒 Security Notes

- **Change default passwords** in production
- Admin access is determined by email address
- All passwords are hashed with bcrypt
- JWT tokens are used for authentication

## 📝 Creating New Users

Users can also register new accounts through the registration page with:
- Name
- Email
- Password
- Field of Study (CS, SE, IT, IS, Cybersecurity)
- Learning Level (Beginner, Intermediate, Advanced)