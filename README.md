# 🌱 Sprout – AI-Powered Carbon Footprint Awareness Platform

## Overview

Sprout is an AI-powered Carbon Footprint Awareness Platform designed to help individuals understand, track, and reduce their environmental impact through habit formation, gamification, and personalized AI-driven engagement.

Traditional sustainability applications often focus solely on displaying carbon emissions and environmental statistics. While awareness is important, awareness alone rarely leads to long-term behavioral change.

Sprout addresses this challenge by transforming sustainability into an engaging and rewarding experience through an evolving AI companion, daily climate goals, achievements, streaks, ecosystem growth visualization, and carbon impact tracking.

Built for **Prompt Wars Virtual (Google for Developers × Hack2Skill)**, Sprout explores how artificial intelligence and gamification can encourage users to build sustainable habits and contribute positively to the environment.

---

# Problem Statement

## Challenge

Develop a Carbon Footprint Awareness Platform that enables users to:

* Track environmental impact
* Understand carbon emissions
* Build sustainable habits
* Reduce daily carbon footprint
* Increase climate awareness

## Problem

Many existing sustainability platforms successfully provide environmental information but fail to motivate consistent action.

Users often:

* Lose motivation after initial usage
* View sustainability as a one-time activity
* Lack personalized encouragement
* Struggle to maintain eco-friendly habits

## Solution

Sprout combines:

* Artificial Intelligence
* Gamification
* Behavioral Reinforcement
* Environmental Analytics

to transform sustainability into an engaging daily experience.

---

# Key Features

## 🌱 AI Climate Companion

Sprout introduces an evolving AI companion that grows alongside the user.

Each sustainable action contributes to the companion's growth and progression.

Features:

* Dynamic evolution stages
* Personalized encouragement
* Progress visualization
* Gamified engagement

---

## 🌍 Carbon Footprint Awareness

Users can actively track their positive environmental impact through:

* Sustainable transportation choices
* Recycling activities
* Energy-saving actions
* Reusable product usage
* Plant-based meal selections

---

## 🎯 Daily Climate Goals

Users receive sustainability-focused goals that encourage consistent environmental action.

Examples:

* Use public transportation
* Recycle waste
* Save electricity
* Walk or cycle
* Use reusable products

---

## 🔥 Streak System

Sprout rewards consistency through daily streak tracking.

Benefits:

* Encourages habit formation
* Improves long-term engagement
* Reinforces positive environmental behavior

---

## 🏆 Achievements & Milestones

Users unlock achievements by completing climate-positive activities.

Examples:

* First Sustainable Action
* Recycling Champion
* Energy Saver
* Climate Hero

---

## 🌳 Ecosystem Health Visualization

Environmental impact is represented through a growing ecosystem.

User actions influence:

* Forest health
* River health
* Ecosystem growth

This creates a visual connection between individual actions and environmental outcomes.

---

## 📖 AI Eco Diary

Sprout automatically generates personalized diary entries based on user activities.

The Eco Diary:

* Summarizes sustainability efforts
* Reflects environmental impact
* Creates a sense of progression
* Encourages continued participation

---

## ⚡ Evolution System

Users gain progression through sustainable actions.

Evolution Stages:

1. Seedling 🌱
2. Sprout 🌿
3. Young Plant 🪴
4. Forest Guardian 🌳

Each stage represents increased environmental contribution and user engagement.

---

# System Architecture

```text
User
   │
   ▼
Next.js Frontend
   │
   ▼
FastAPI Backend
   │
   ▼
SQLite Database
   │
   ▼
AI Services & Analytics
```

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Framer Motion
* Axios

## Backend

* FastAPI
* SQLAlchemy
* JWT Authentication
* Passlib
* Python

## Database

* SQLite

## AI & Analytics

* Gemini API
* AI Diary Generation
* Sustainability Insights

---

# Repository Structure

```text
sprout/
│
├── sprout-frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   └── public/
│
├── sprout-backend/
│   ├── auth/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── tests/
│   └── main.py
│
└── README.md
```

---

# Security Features

* JWT Authentication
* Password Hashing using Passlib
* Protected API Routes
* User-specific data access
* Token-based authorization

---

# Accessibility Features

* Semantic HTML structure
* ARIA labels
* Accessible forms
* Keyboard-friendly navigation
* Accessible progress indicators

---

# Testing

Backend API testing includes:

* Root endpoint testing
* Signup testing
* Login testing
* Pet endpoint testing
* World endpoint testing
* Diary endpoint testing

GitHub Actions CI is used to automate testing and maintain code quality.

---

# Future Enhancements

* Real carbon emission estimation
* Personalized AI sustainability coach
* Community challenges
* Social sustainability leaderboard
* Carbon footprint analytics dashboard
* Mobile application support

---

# Impact

Sprout demonstrates how artificial intelligence, gamification, and behavioral reinforcement can be combined to encourage climate-positive actions and improve long-term sustainability engagement.

The platform aims to bridge the gap between environmental awareness and meaningful action.

---

# Live Demo

https://sprout-v2.vercel.app

# GitHub Repository

https://github.com/smrutichan/sprout

---

Built with 💚 for Prompt Wars Virtual by Google for Developers and Hack2Skill.
