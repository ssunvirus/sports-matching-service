// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";
import Link from "next/link"; // 🎯 [추가] 페이지 간의 이동을 도와주는 마법 부품 가져오기
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🎯 [기획 포인트] 로그인한 유저 정보를 담아둘 바구니
  const [loggedInUser, setLoggedInUser] = useState<{
    email: string;
    schoolName: string;
  } | null>(null);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      {/* 메인 대시보드 */}
      <main className="max-w-4xl mx-auto mt-12 p-6 text-center">
        {/* 🎯 로그인한 유저가 있으면 환영 인사말을 동적으로 변경! */}
        <h1 className="text-4xl font-extrabold mb-4">
          {loggedInUser
            ? `🏆 ${loggedInUser.schoolName} 매치 대시보드`
            : "학교 스포츠 매칭 시스템"}
        </h1>
        <p className="text-gray-400 mb-8">
          우리 학교 팀을 등록하고 주변 학교와 짜릿한 한판 승부를 겨뤄보세요!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div
            className={`p-6 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"}`}
          >
            <h3 className="text-xl font-bold mb-2 text-green-400">
              ⚽ 축구 매치업
            </h3>
            <p className="text-sm text-gray-400">
              현재 대기 중인 축구 팀: 14개 교
            </p>
          </div>

          <div
            className={`p-6 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"}`}
          >
            <h3 className="text-xl font-bold mb-2 text-orange-400">
              🏀 농구 매치업
            </h3>
            <p className="text-sm text-gray-400">
              현재 대기 중인 농구 팀: 8개 교
            </p>
          </div>
        </div>

        {/* 🎯 [수정 포인트 2] 로그인했을 때만 나타나는 진짜 메인 콘텐츠: [팀 관리] 전용 대시보드 뼈대 */}
        {loggedInUser && (
          <div
            className={`mt-8 p-6 text-left rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}
          >
            <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                📋 {loggedInUser.schoolName} 대표 팀 관리 명부
              </h2>
              <button className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                + 새 선수 등록
              </button>
            </div>

            {/* 임시 선수단 가이드 영역 (다음 단계에서 진짜 기획 요소를 채울 곳!) */}
            <div className="p-8 text-center border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/30">
              <p className="text-gray-400 text-sm mb-2">
                아직 등록된 우리 학교 대표 선수가 없습니다.
              </p>
              <p className="text-xs text-gray-500">
                오른쪽 상단의 [+ 새 선수 등록] 버튼을 눌러 스쿼드를 완성하고
                도전장을 던져보세요!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
