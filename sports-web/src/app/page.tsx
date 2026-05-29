// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 🎯 [기획 포인트] 로그인한 유저 정보를 담아둘 바구니
  const [loggedInUser, setLoggedInUser] = useState<{ email: string; schoolName: string } | null>(null);

  // 💡 화면이 처음 켜질 때 브라우저 수첩(localStorage)에 로그인 기록이 있는지 검사합니다.
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser)); // 기록이 있다면 바구니에 유저 정보 탑재!
    }
  }, []);

  // 🚪 [로그아웃 함수] 수첩을 찢어버리고 유저 바구니를 비웁니다.
  const handleLogout = () => {
    localStorage.removeItem("user"); // 수첩에서 삭제
    setLoggedInUser(null); // 바구니 초기화
    alert("로그아웃 되었습니다. 다음에 또 봐요! ⚽");
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      
      {/* 상단 네비게이션 바 */}
     <nav className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-8">
          <div className="text-xl font-bold tracking-wider text-green-500 cursor-pointer">SCHOOL MATCHUP</div>
          
          {/* 🎯 [수정 포인트 1] 로그인한 학교 대표에게만 보이는 중앙 메뉴바 신설! */}
          {loggedInUser && (
            <div className="flex items-center gap-6">
              <button className="text-sm font-bold text-green-400 border-b-2 border-green-400 pb-1 transition-colors">
                🏃‍♂️ 팀 관리
              </button>
              {/* 나중에 여기에 [🔥 경기 매칭], [🏆 랭킹] 같은 메뉴들을 추가할 예정입니다! */}
              <button className="text-sm font-medium text-gray-400 hover:text-gray-200 pb-1 transition-colors opacity-50 cursor-not-allowed">
                ⚽ 경기 매칭 (준비중)
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2 rounded-full border ${isDarkMode ? "bg-gray-700 border-gray-600 text-yellow-400" : "bg-gray-100 border-gray-300 text-gray-600"}`}
          >
            {isDarkMode ? "☀️ 라이트모드" : "🌙 다크모드"}
          </button>
          
          {/* 🎯 [기획 반영] 로그인 상태에 따라 버튼을 다르게 스위칭합니다. */}
          {loggedInUser ? (
            <div className="flex items-center gap-4">
              {/* 소속 학교를 이쁘게 뱃지로 노출 */}
              <span className="text-sm font-semibold bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                🏫 {loggedInUser.schoolName} 대표
              </span>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 font-semibold text-sm transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 font-semibold text-sm transition-colors"
            >
              로그인 / 회원가입
            </button>
          )}
        </div>
      </nav>

      {/* 메인 대시보드 */}
      <main className="max-w-4xl mx-auto mt-12 p-6 text-center">
        {/* 🎯 로그인한 유저가 있으면 환영 인사말을 동적으로 변경! */}
        <h1 className="text-4xl font-extrabold mb-4">
          {loggedInUser ? `🏆 ${loggedInUser.schoolName} 매치 대시보드` : "학교 스포츠 매칭 시스템"}
        </h1>
        <p className="text-gray-400 mb-8">우리 학교 팀을 등록하고 주변 학교와 짜릿한 한판 승부를 겨뤄보세요!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className={`p-6 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"}`}>
            <h3 className="text-xl font-bold mb-2 text-green-400">⚽ 축구 매치업</h3>
            <p className="text-sm text-gray-400">현재 대기 중인 축구 팀: 14개 교</p>
          </div>
          <div className={`p-6 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"}`}>
            <h3 className="text-xl font-bold mb-2 text-orange-400">🏀 농구 매치업</h3>
            <p className="text-sm text-gray-400">현재 대기 중인 농구 팀: 8개 교</p>
          </div>
        </div>

        {/* 🎯 [수정 포인트 2] 로그인했을 때만 나타나는 진짜 메인 콘텐츠: [팀 관리] 전용 대시보드 뼈대 */}
        {loggedInUser && (
          <div className={`mt-8 p-6 text-left rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
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
              <p className="text-gray-400 text-sm mb-2">아직 등록된 우리 학교 대표 선수가 없습니다.</p>
              <p className="text-xs text-gray-500">오른쪽 상단의 [+ 새 선수 등록] 버튼을 눌러 스쿼드를 완성하고 도전장을 던져보세요!</p>
            </div>
          </div>
        )}
      </main>

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
}