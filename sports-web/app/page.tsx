"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // 💡 상태 관리 바구니들
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🎯 [버그 해결] 누락되었던 이메일 주소 저장 바구니 신설!
  const [email, setEmail] = useState("");
  
  // 사용자가 최종적으로 '선택한 학교'를 기억할 바구니
  const [selectedSchool, setSelectedSchool] = useState("");
  // 사용자가 학교를 클릭해서 선택한 상태인지 확인하는 플래그
  const [isSchoolSelected, setIsSchoolSelected] = useState(false);

  // 💡 검색어가 바뀔 때마다 백엔드(교육청 API)로 실시간 요청을 보냅니다.
  useEffect(() => {
    if (isSchoolSelected || !searchTerm.trim()) {
      setFilteredSchools([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/schools?search=${encodeURIComponent(searchTerm)}`)
        .then((res) => res.json())
        .then((data) => {
          setFilteredSchools(data);
        })
        .catch((err) => console.error("백엔드 서버 통신 에러:", err));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isSchoolSelected]);

  // 학교 목록에서 특정 학교를 클릭했을 때 발동하는 함수
  const handleSelectSchool = (schoolName: string) => {
    setSearchTerm(schoolName);       
    setSelectedSchool(schoolName);   
    setIsSchoolSelected(true);       
    setFilteredSchools([]);          
  };

  // 검색창 내용을 직접 수정하면 다시 검색할 수 있도록 초기화해 주는 로직
  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    if (isSchoolSelected) {
      setIsSchoolSelected(false); 
      setSelectedSchool("");
    }
  };

  // 🎯 [버그 해결] 회원가입 버튼을 누르면 진짜 몽고DB 백엔드로 데이터를 쏴주는 핵심 통신 함수 추가!
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !selectedSchool) {
      alert("이메일과 학교 정보를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, schoolName: selectedSchool }),
      });

      const result = await response.json();

      if (response.ok) {
        // 백엔드가 진짜 몽고DB 저장에 성공하면 신호를 받아 기획 팝업을 띄웁니다!
        alert(`🎉 회원가입 성공!\n소속: ${result.user.schoolName}\n진짜 DB에 영구 저장되었습니다.`);
        setIsModalOpen(false); 
        setEmail(""); 
        setSearchTerm("");
        setSelectedSchool("");
        setIsSchoolSelected(false);
      } else {
        alert(`❌ 가입 실패: ${result.error}`);
      }
    } catch (error) {
      console.error("회원가입 통신 중 프론트엔드 에러 발생:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      
      {/* 상단 네비게이션 바 */}
      <nav className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="text-xl font-bold tracking-wider text-green-500">SCHOOL MATCHUP</div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2 rounded-full border ${isDarkMode ? "bg-gray-700 border-gray-600 text-yellow-400" : "bg-gray-100 border-gray-300 text-gray-600"}`}
          >
            {isDarkMode ? "☀️ 라이트모드" : "🌙 다크모드"}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 font-semibold"
          >
            회원가입
          </button>
        </div>
      </nav>

      {/* 메인 대시보드 */}
      <main className="max-w-4xl mx-auto mt-12 p-6 text-center">
        <h1 className="text-4xl font-extrabold mb-4">학교 스포츠 매칭 시스템</h1>
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
      </main>

      {/* 회원가입 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-xl font-bold hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
            
            {/* 🎯 [버그 해결] onSubmit 이벤트를 진짜 처리 함수로 연결해 줍니다. */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">이메일 주소</label>
                {/* 🎯 [버그 해결] value와 onChange를 연결하여 유저가 입력하는 타이핑 값을 실시간으로 보관합니다. */}
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@school.ac.kr" 
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`} 
                />
              </div>
              
              {/* 학교 검색 및 선택 세션 */}
              <div>
                <label className="block text-sm font-semibold mb-1">소속 학교 검색</label>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="학교 이름을 입력하세요 (예: 목동)" 
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`} 
                />
                
                {/* 실시간 교육청 검색 리스트 레이어 */}
                {filteredSchools.length > 0 && (
                  <ul className={`mt-2 max-h-40 overflow-y-auto border rounded-lg text-sm shadow-lg z-50 relative ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}>
                    {filteredSchools.map((school, idx) => (
                      <li 
                        key={idx} 
                        onClick={() => handleSelectSchool(school.school_name)}
                        className={`px-4 py-2.5 cursor-pointer border-b last:border-0 transition-colors ${isDarkMode ? "hover:bg-gray-600 border-gray-600" : "hover:bg-gray-100 border-gray-200"}`}
                      >
                        {school.school_name}
                      </li>
                    ))}
                  </ul>
                )}
                
                {searchTerm && filteredSchools.length === 0 && !isSchoolSelected && (
                  <p className="text-xs text-red-400 mt-1">일치하는 학교 데이터가 교육청에 없습니다.</p>
                )}

                {isSchoolSelected && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-xl flex items-center justify-between">
                    <span>선택된 소속: <strong>{selectedSchool}</strong></span>
                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">선택완료</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={!isSchoolSelected}
                className={`w-full py-3 mt-4 text-white font-bold rounded-lg transition-colors ${isSchoolSelected ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-gray-600 cursor-not-allowed opacity-50"}`}
              >
                {isSchoolSelected ? "회원가입" : "학교를 선택해 주세요"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}