// src/app/find-team/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";

interface PlayerData {
  schoolName: string;
  userEmail: string;
  sportsType: string;
}

interface TeamCard {
  schoolName: string;
  contactEmail: string;
  soccerCount: number;
  basketballCount: number;
}

export default function FindTeamPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [teams, setTeams] = useState<TeamCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        // 1. players 컬렉션의 모든 문서를 가져와 학교별 집계를 냅니다.
        const querySnapshot = await getDocs(collection(db, "players"));
        const playersList: PlayerData[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          playersList.push({
            schoolName: data.schoolName || "알 수 없는 학교",
            userEmail: data.userEmail || "알 수 없는 이메일",
            sportsType: data.sportsType || "soccer"
          });
        });

        // 2. 학교 기준으로 데이터 그룹화 및 인원수 카운트
        const teamMap: { [key: string]: TeamCard } = {};

        playersList.forEach((player) => {
          const key = player.schoolName;
          if (!teamMap[key]) {
            teamMap[key] = {
              schoolName: player.schoolName,
              contactEmail: player.userEmail,
              soccerCount: 0,
              basketballCount: 0
            };
          }

          if (player.sportsType === "soccer") {
            teamMap[key].soccerCount += 1;
          } else if (player.sportsType === "basketball") {
            teamMap[key].basketballCount += 1;
          }
        });

        // 또한, 회원은 가입했으나 아직 선수를 등록하지 않은 학교도 보여주기 위해 users 컬렉션도 연동합니다.
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          const school = userData.schoolName;
          if (school && !teamMap[school]) {
            teamMap[school] = {
              schoolName: school,
              contactEmail: userData.email,
              soccerCount: 0,
              basketballCount: 0
            };
          }
        });

        setTeams(Object.values(teamMap));
      } catch (error) {
        console.error("팀 목록을 불러오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // 검색 필터링된 학교 대표팀 목록
  const filteredTeams = teams.filter((team) =>
    team.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* 서브 네비게이션바 또는 다크모드 조절 */}
      <div className="max-w-6xl mx-auto px-6 pt-6 flex justify-end">
        <button
          onClick={toggleDarkMode}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-yellow-400"
              : "bg-white border-gray-200 text-gray-600 shadow-sm"
          }`}
        >
          {isDarkMode ? "☀️ 라이트모드" : "🌙 다크모드"}
        </button>
      </div>

      <main className="max-w-6xl mx-auto p-6 pb-20">
        {/* 상단 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2">🔍 동네 학교팀 찾기</h1>
          <p className="text-gray-400 text-sm">
            현재 매치업에 등록된 학교별 축구/농구 대표팀 로스터와 현황을 확인하고 매치를 신청해 보세요!
          </p>
        </div>

        {/* 검색창 구역 */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="학교 이름을 검색해 보세요 (예: 목동)"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm"
              }`}
            />
            <span className="absolute left-3.5 top-3.5 text-gray-500">🔍</span>
          </div>
        </div>

        {/* 로딩 표시 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400 tracking-wider">전국 동네 대표팀 데이터 불러오는 중...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div
            className={`p-16 text-center rounded-2xl border ${
              isDarkMode ? "bg-gray-800/40 border-gray-800" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <p className="text-lg mb-2">🔍 검색된 학교 대표팀이 없습니다.</p>
            <p className="text-sm text-gray-500">다른 이름으로 검색하시거나 새로운 팀이 등록될 때까지 기다려 주세요!</p>
          </div>
        ) : (
          /* 대표팀 카드 그리드 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 shadow hover:shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                      🏫 고등학교 대표팀
                    </span>
                    <span className="text-xs text-gray-500">Active 🔥</span>
                  </div>

                  <h3 className="text-xl font-extrabold mb-1">{team.schoolName}</h3>
                  <p className="text-xs text-gray-400 mb-6 font-mono">✉️ 코치: {team.contactEmail}</p>

                  {/* 종목별 로스터 요약 현황 */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        ⚽ 축구 대표팀 Roster
                      </span>
                      <span className={`font-mono font-bold ${team.soccerCount > 0 ? "text-green-400" : "text-gray-500"}`}>
                        {team.soccerCount} 명 등록됨
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        🏀 농구 대표팀 Roster
                      </span>
                      <span className={`font-mono font-bold ${team.basketballCount > 0 ? "text-orange-400" : "text-gray-500"}`}>
                        {team.basketballCount} 명 등록됨
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700/30 flex gap-3">
                  <Link
                    href={`/match-booking`}
                    className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-all"
                  >
                    🔥 대결 매치 오픈하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
