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

  // 브라우저 수첩에서 로그인 세션 검사
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
  }, []);

  // 로그아웃 처리
  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까? ⚽")) {
      localStorage.removeItem("user");
      setLoggedInUser(null);
      alert("로그아웃 되었습니다. 다음에 또 봐요!");
      window.location.href = "/";
    }
  };

  return (
    <>
      <nav
        className={`flex items-center justify-between px-6 py-4 border-b transition-colors duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900 shadow-sm"
          }`}
      >
        {/* 왼쪽 영역: 서비스 타이틀 및 통합 메뉴바 */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-wider text-green-500 cursor-pointer"
          >
            SCHOOL MATCHUP
          </Link>

          {/* 메뉴들을 모아둔 가로 울타리 */}
          <div className="flex items-center gap-6 border-l border-gray-700 pl-6 h-full">

            {/* 🏃‍♂️ 1. 팀 관리 메뉴 */}
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

            {/* 🏟️ 2. 매치 예약 메뉴 그룹 (마우스 호버 감지 최고 대빵 울타리) */}
            <div className="relative group flex items-center h-full">

              {/* 메인 버튼: pb-6과 -mb-6 투명 통로 기법으로 아래 메뉴판 이동 시 꺼짐 현상 완벽 방어 */}
              <button className="flex items-center gap-1 text-sm font-bold text-green-500 hover:text-green-400 transition-colors cursor-pointer pb-6 -mb-6">
                🏟️ 매치 서비스
                <svg
                  className="w-3 h-3 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 롤 아웃되는 서브 메뉴판 */}
              {/* 💡 핵심: group-hover가 아닐 때는 'invisible opacity-0'으로 완벽 차단, 마우스가 올라가면 0.15초 만에 등장 */}
              <div className="absolute left-0 top-[100%] w-44 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div
                  className={`rounded-xl border shadow-2xl overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
                >
                  <Link
                    href="/match-list"
                    className={`block px-4 py-3 text-xs font-bold transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    🔍 등록된 매치 확인
                  </Link>

                  <Link
                    href="/match-booking"
                    className={`block px-4 py-3 text-xs font-bold transition-colors border-t ${isDarkMode ? "hover:bg-gray-700 text-gray-300 border-gray-700" : "hover:bg-gray-100 text-gray-700 border-gray-100"
                      }`}
                  >
                    ➕ 새 매치 등록하기
                  </Link>
                </div>
              </div>

            </div> {/* 📌 group 감시망 마감 */}

          </div>
        </div>

        {/* 오른쪽 영역: 다크모드 및 로그인 뱃지 그룹 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${isDarkMode
                ? "bg-gray-700 border-gray-600 text-yellow-400 hover:bg-gray-600"
                : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {isDarkMode ? "☀️ 라이트모드" : "🌙 다크모드"}
          </button>

          {loggedInUser ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700">
                👤 플레이어: <span className="text-gray-200 font-semibold">{loggedInUser.email}</span>
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

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isDarkMode={isDarkMode} />
    </>
  );
}