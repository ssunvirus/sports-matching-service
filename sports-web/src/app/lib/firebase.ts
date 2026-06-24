// src/app/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🎯 선균님이 발급받으신 고유 파이어베이스 열쇠 정보를 탑재합니다.
const firebaseConfig = {
  apiKey: "AIzaSyCBvaeo-LVLxWGJILWmAd6v6-AAUbuk2DI",
  authDomain: "sport-school-match.firebaseapp.com",
  projectId: "sport-school-match",
  storageBucket: "sport-school-match.firebasestorage.app",
  messagingSenderId: "337545847280",
  appId: "1:337545847280:web:0fc2a26d0bc880f562bd35",
  measurementId: "G-PHL293T2WM"
};

// Next.js 서버 환경에서 중복 부팅을 방지하며 안전하게 파이어베이스를 초기화합니다.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 🎯 구글 클라우드 데이터베이스(Firestore) 진짜 출입 게이트를 내보냅니다.
export const db = getFirestore(app);

// 🎯 구글 클라우드 인증(Authentication) 진짜 출입 게이트를 내보냅니다.
export const auth = getAuth(app);