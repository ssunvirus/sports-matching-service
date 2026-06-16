// src/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{
    email: string;
    schoolName: string;
  } | null>(null);

  // 🎯 [핵심] 드롭다운 메뉴판이 열렸는지 닫혔는지 기억하는 자바스크립트 스위치
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까? ⚽")) {
      localStorage.removeItem("user");
      setLoggedInUser(null);
      alert("로그아웃 되었습니다.");
      window.location.href = "/";
    }
  };

  return (
    <>
      <nav
        className={`flex items-center justify-between px-6 py-4 border-b transition-colors duration-300 relative ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-200 text-gray-900 shadow-sm"
        }`}
      >
        {/* 왼쪽 로고 및 메뉴 구역 */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-wider text-green-500 cursor-pointer"
          >
            SCHOOL MATCHUP
          </Link>

          <div className="flex items-center gap-6 border-l border-gray-700 pl-6">
            {/* 🏃‍♂️ 1. 팀 관리 메뉴 */}
            {!loggedInUser ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-bold text-green-500 hover:text-green-400"
              >
                🏃‍♂️ 팀 관리
              </button>
            ) : (
              <Link
                href="/team-management"
                className="text-sm font-bold text-green-500 hover:text-green-400"
              >
                🏃‍♂️ 팀 관리
              </Link>
            )}

            {/* 🏟️ 2. 매치 서비스 메뉴 그룹 (자바스크립트 마우스 감시망) */}
            {/* 💡 onMouseEnter(마우스 진입), onMouseLeave(마우스 이탈) 이벤트를 직접 걸어줍니다. */}
            <div
              className="relative p-2"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              {/* 메인 버튼(변경내용 테스트 해봄) */}
              <button className="flex items-center gap-2 text-sm font-bold text-green-500 hover:text-green-400 cursor-pointer">
                🏟️ 매치 서비스(준비중,테스트)
                {/* <svg
                  className={`w-2.5 h-2.5 min-w-0 min-h-0 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg> */}
              </button>

              {/* 🎯 [새로운 방식] 리액트 조건부 렌더링 */}
              {/* 💡 CSS로 숨기는 게 아니라, isDropdownOpen이 true일 때만 이 상자를 아예 새로 창조해서 화면에 그려버립니다! */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full w-44 pt-2 z-50">
                  <div
                    className={`rounded-xl border shadow-2xl overflow-hidden ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Link
                      href="/match-list"
                      className={`block px-4 py-3 text-xs font-bold transition-colors ${
                        isDarkMode
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      🔍 등록된 매치 확인
                    </Link>
                    <Link
                      href="/match-booking"
                      className={`block px-4 py-3 text-xs font-bold transition-colors border-t ${
                        isDarkMode
                          ? "hover:bg-gray-700 text-gray-300 border-gray-700"
                          : "hover:bg-gray-100 text-gray-700 border-gray-100"
                      }`}
                    >
                      ➕ 새 매치 등록하기
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 회원 정보 구역 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-yellow-400"
                : "bg-gray-100 border-gray-300 text-gray-600"
            }`}
          >
            {isDarkMode ? "☀️ 라이트모드" : "🌙 다크모드"}
          </button>

          {loggedInUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                🏫 {loggedInUser.schoolName} 대표
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-white bg-green-500 rounded-lg font-semibold text-sm"
            >
              로그인 / 회원가입
            </button>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
