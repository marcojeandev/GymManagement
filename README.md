# 🏋️ Gym Management System

A comprehensive gym management solution designed specifically for local gyms in Zamboanga City to digitize operations, eliminate manual processes, and enhance business efficiency.

## 📋 Overview

This system transforms traditional gym management by automating member contracts, attendance tracking, and business analytics. It eliminates manual paperwork, prevents unauthorized access, and provides data-driven insights to improve business operations.

### 🎯 Key Problems Solved

- ❌ **Manual Contracts** → ✅ Digital contract management with automated tracking
- ❌ **Paper Attendance** → ✅ QR code-based attendance system
- ❌ **Expired Members** → ✅ Automated access control and notifications
- ❌ **No Business Insights** → ✅ Real-time reports and analytics
- ❌ **Revenue Leakage** → ✅ Prevent unauthorized gym access
- ❌ **Inefficient Operations** → ✅ Streamlined check-in/check-out process

## ✨ Features

### 🔐 Authentication & Access Control
- Multi-role system (Admin & Cashier)
- Secure login with JWT/Sanctum authentication
- Role-based access control (RBAC)

### 📝 Member Management
- Complete member profiles (name, contact, photo, QR code)
- Membership types (Monthly, Quarterly, Annual)
- Contract management with expiry tracking
- Automated contract renewal notifications
- Member search and filtering

### 📋 Contract Management
- Digital contract creation and signing
- Multiple pricing tiers (Monthly, Quarterly, Annual, Walk-in)
- Contract status tracking (Active, Expired, Pending)
- Automated expiry alerts
- Contract history and audit trail

### 📊 Sales & Inventory
- Product management (Supplements, Merchandise, etc.)
- Point of Sale (POS) system
- Sales tracking and reporting
- Inventory management
- Revenue analytics by day, week, month

### 👥 Attendance System
- QR code-based attendance scanning
- Member check-in/check-out tracking
- Walk-in guest management
- Attendance history and reports
- Automated attendance statistics

### 📈 Reports & Analytics
- Sales reports (Daily, Weekly, Monthly, Yearly)
- Attendance reports
- Member retention analytics
- Revenue trends and forecasts
- Top-performing memberships
- Gym utilization metrics

### 🏢 Walk-in Management
- Temporary walk-in member registration
- Walk-in attendance tracking
- Day-pass management
- Guest history

### ⚙️ System Settings
- Gym profile configuration
- Membership pricing management
- Contract pricing management
- System branding (logo, colors)
- Email and notification settings

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Styling
- **React Router v6** - Navigation
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Laravel 10/11** - PHP framework
- **Laravel Sanctum** - API authentication
- **MySQL** - Database
- **REST API** - Architecture

### Development Tools
- **Vite** - Frontend build tool
- **XAMPP** - Local development server
- **Git** - Version control
