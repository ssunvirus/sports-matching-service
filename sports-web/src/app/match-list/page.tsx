// src/app/match-list/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// 🏆 기획 포인트: 타 학교 대표팀들이 등록해 놓은 실시간 매치업 서랍 데이터 (샘플)
const MATCH_SAMPLES = [
  {
    id: "match-1",
    schoolName: "신목고등학교",
    sportType: "축구",
    stadiumName: "목동종합운동장 주경기장",
    timeSlot: "주말 토요일 10:00 ~ 12:00",
    title: "빡겜 말고 매너 경기하실 30대 팀 모십니다! 음료 내기 해요 ⚽",
    status: "대기중",
    createdAt: "방금 전",
  },
];

export default function MatchListPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedSport, setSelectedSport] = useState("전체"); // 🎯 종목 필터링용 바구니

  // 🎯 기획 반영: '전체', '축구', '농구' 버튼을 누르면 그 종목만 필터링해서 보여줍니다.
  const filteredMatches = MATCH_SAMPLES.filter((match) => {
    if (selectedSport === "전체") return true;
    return match.sportType === selectedSport;
  });

  // 도전 신청하기 버튼 클릭 함수
  const handleApplyMatch = (schoolName: string, sportType: string) => {
    alert(
      `🔥 [${schoolName}]의 ${sportType} 도전장에 매칭 매니저가 도전 신청을 보냈습니다! 실시간 매칭 수락을 기다리세요.`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans p-6">
      <main className="max-w-5xl mx-auto mt-6">
        {/* 상단 기획 타이틀 섹션 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-100 mb-2">
              🔍 실시간 등록된 매치 확인
            </h1>
            <p className="text-gray-400 text-sm">
              현재 다른 학교 대표팀이 오픈한 매치 명부입니다. 시간과 장소를
              확인하고 도전장을 던지세요!
            </p>
          </div>

          {/* 우측 상단 바로 예약하러 가기 숏컷 버튼 */}
          <Link
            href="/match-booking"
            className="px-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-bold text-white transition-colors h-fit text-center"
          >
            🏟️ 우리 팀 매치 등록하러 가기
          </Link>
        </div>

        {/* 🎯 종목 필터링 탭 바 (축구만 보기 / 농구만 보기 치트키) */}
        <div className="flex items-center gap-2 mb-8">
          {["전체", "축구", "농구"].map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-xl text-base font-bold text-grey-100     border transition-all cursor-pointer ${
                selectedSport === sport
                  ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200"
              }`}
            >
              {sport === "전체"
                ? "🌐 전체 종목"
                : sport === "축구"
                  ? "⚽ 축구"
                  : "🏀 농구"}
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-2">
            총 {filteredMatches.length}개의 매치 대기중
          </span>
        </div>

        {/* 🗂️ 실시간 매치업 보드 피드 리스트 구역 */}
        <div className="space-y-2 flex flex-col gap-4">
          {filteredMatches.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
              <p className="text-gray-500 text-sm">
                현재 대기 중인 {selectedSport} 매칭이 없습니다.
              </p>
            </div>
          ) : (
            filteredMatches.map((match) => (
              <div
                key={match.id}
                className={`px-4 xl:px-6 py-4 rounded-2xl border transition-all bg-gray-900/50 border-gray-800 hover:border-gray-700 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 xl:gap-6 ${
                  match.status === "매칭완료" ? "opacity-60" : ""
                }`}
              >
                {/* 왼쪽 구역: 매치 상세 정보 정보창 */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 종목 태그 */}
                    <span
                      className={`px-2 py-1 rounded-md text-[20px] font-extrabold ${
                        match.sportType === "축구"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      }`}
                    >
                      {match.sportType === "축구" ? "⚽" : "🏀"}
                    </span>
                    {/* 학교 대표팀 이름 */}
                    <span className="text-sm font-bold text-gray-200">
                      {match.schoolName} 대표팀
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    {/* 등록 시간 */}
                    <span className="text-xs text-gray-500">
                      {match.createdAt} 등록
                    </span>
                  </div>

                  {/* 도전장 핵심 타이틀 한줄평 */}
                  <h3 className="text-lg font-bold text-gray-100 tracking-tight leading-snug">
                    {match.title}
                  </h3>

                  {/* 구장 및 시간대 정보 패널 */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1.5 text-xs text-gray-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">🏟️</span>
                      <span>{match.stadiumName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">⏰</span>
                      <span className="text-gray-300 font-medium">
                        {match.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽 구역: 상태 뱃지 및 액션 버튼 */}
                <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-800 flex items-center justify-between md:justify-end gap-4 shrink-0">
                  <div className="text-left md:text-right hidden sm:block">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        match.status === "대기중"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {match.status === "대기중"
                        ? "● 매칭 대기중"
                        : "✓ 매칭 완료"}
                    </span>
                  </div>

                  {/* 매칭 신청 액션 버튼 */}
                  {match.status === "대기중" ? (
                    <button
                      onClick={() =>
                        handleApplyMatch(match.schoolName, match.sportType)
                      }
                      className="w-max px-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-s font-bold transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-600/20"
                    >
                      🤝 매칭 매치 도전하기
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full md:w-auto px-5 py-2.5 bg-gray-800 text-gray-600 rounded-xl text-xs font-bold cursor-not-allowed"
                    >
                      마감 완료
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
