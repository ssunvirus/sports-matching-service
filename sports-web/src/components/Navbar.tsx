// src/app/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal"; // 🎯 [이식] 회원가입 모달 부품 가져오기

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{
    email: string;
    schoolName: string;
  } | null>(null);

  // 💡 화면이 켜지자마자 브라우저 수첩에서 로그인 기록 검사
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
  }, []);

  // 🚪 [이식] 로그아웃 함수
  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까? ⚽")) {
      localStorage.removeItem("user");
      setLoggedInUser(null);
      alert("로그아웃 되었습니다. 다음에 또 봐요!");
      window.location.href = "/"; // 메인 화면으로 새로고침 워프
    }
  };

  return (
    <>
      <nav
        className={`flex items-center justify-between px-6 py-4 border-b transition-colors duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"}`}
      >
        {/* 왼쪽 영역: 로고 및 스마트 메뉴바 */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-wider text-green-500 cursor-pointer"
          >
            SCHOOL MATCHUP
          </Link>

          <div className="flex items-center gap-4 border-l border-gray-700 pl-4">
            {/* 🎯 [이식] 로그인 여부에 따라 팀 관리를 다르게 처리하는 스마트 메뉴 */}
            {!loggedInUser ? (
              <button
                onClick={() => {
                  alert("팀 관리 기능은 로그인 후 이용하실 수 있습니다. ⚽");
                  setIsModalOpen(true);
                }}
                className="text-sm font-bold text-green-500 hover:text-green-400 transition-colors cursor-pointer"
              >
                🏃‍♂️ 팀 관리
              </button>
            ) : (
              <Link
                href="/team-management"
                className="text-sm font-bold text-green-500 hover:text-green-400 transition-colors cursor-pointer"
              >
                🏃‍♂️ 팀 관리
              </Link>
            )}
            <span className="text-sm font-medium text-gray-400 opacity-50 cursor-not-allowed">
              ⚽ 경기 매칭 (준비중)
            </span>
          </div>
        </div>

        {/* 오른쪽 영역: 모드 체인저 + 플레이어 정보 + 로그인/로그아웃 버튼 */}
        <div className="flex items-center gap-4">
          {/* 🎯 [이식] 라이트 / 다크모드 스위치 */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${isDarkMode ? "bg-gray-700 border-gray-600 text-yellow-400 hover:bg-gray-600" : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"}`}
          >
            {isDarkMode ? "☀️ 라이트모드" : "🌙 다크모드"}
          </button>

          {/* 🎯 [이식] 로그인 상태에 따른 버튼 스위칭 그룹 */}
          {loggedInUser ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
                👤 플레이어:{" "}
                <span className="text-gray-200 font-semibold">
                  {loggedInUser.email}
                </span>
              </span>
              <span className="text-sm font-semibold bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                🏫 {loggedInUser.schoolName} 대표
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 font-semibold text-sm transition-colors cursor-pointer"
            >
              로그인 / 회원가입
            </button>
          )}
        </div>
      </nav>

      {/* 🎯 상단바에 소속된 인증 모달창 팝업 */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
