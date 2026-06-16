// src/app/team-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "../../app/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import FormationPitch from "../../components/FormationPitch";

interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
}

export default function TeamManagementPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<{
    email: string;
    schoolName: string;
  } | null>(null);

  // 현재 선택된 종목 탭 상태 (축구 vs 농구)
  const [activeTab, setActiveTab] = useState<"soccer" | "basketball">("soccer");
  const [isLoading, setIsLoading] = useState(true);

  // 선수 등록을 위한 입력창 상태 바구니들
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerPosition, setPlayerPosition] = useState("");

  // 등록된 선수 목록
  const [soccerPlayers, setSoccerPlayers] = useState<Player[]>([]);
  const [basketballPlayers, setBasketballPlayers] = useState<Player[]>([]);

  // 선수 등록 핸들러
  const handleRegisterPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || !playerNumber.trim() || !playerPosition) {
      alert("선수의 이름, 등번호, 포지션을 모두 입력해 주세요! 🏃‍♂️");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "players"), {
        schoolName: loggedInUser?.schoolName || "알 수 없는 학교",
        userEmail: loggedInUser?.email || "알 수 없는 이메일",
        name: playerName.trim(),
        number: playerNumber.trim(),
        position: playerPosition,
        sportsType: activeTab,
        createdAt: new Date(),
      });

      const newPlayer: Player = {
        id: docRef.id,
        name: playerName.trim(),
        number: playerNumber.trim(),
        position: playerPosition,
      };

      if (activeTab === "soccer") {
        setSoccerPlayers((prev) => [...prev, newPlayer]);
      } else {
        setBasketballPlayers((prev) => [...prev, newPlayer]);
      }

      setPlayerName("");
      setPlayerNumber("");
      setPlayerPosition("");
      alert("🚀 대표팀 선수단 명부에 성공적으로 등록되었습니다!");
    } catch (error: any) {
      console.error("선수 등록 실패 원인 에러로그:", error);
      alert("❌ 선수 등록 실패: " + error.message);
    }
  };

  // 선수 삭제 핸들러
  const handleDeletePlayer = async (playerId: string, name: string) => {
    if (!confirm(`정말로 ${name} 선수를 대표팀 명부에서 제명하시겠습니까? 😰`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "players", playerId));

      if (activeTab === "soccer") {
        setSoccerPlayers((prev) => prev.filter((p) => p.id !== playerId));
      } else {
        setBasketballPlayers((prev) => prev.filter((p) => p.id !== playerId));
      }

      alert("🚀 대표팀 명부에서 해당 선수가 제명되었습니다.");
    } catch (error: any) {
      console.error("선수 삭제 실패 에러로그:", error);
      alert("❌ 삭제 실패: " + error.message);
    }
  };

  // 사용자 로그인 데이터 및 선수단 로드
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    let currentUser: any = null;

    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      setLoggedInUser(currentUser);
    }

    const fetchPlayers = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const q = query(
          collection(db, "players"),
          where("schoolName", "==", currentUser.schoolName),
          where("sportsType", "==", activeTab),
          orderBy("createdAt", "asc")
        );

        const querySnapshot = await getDocs(q);
        const loadedPlayers: Player[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          number: doc.data().number,
          position: doc.data().position,
        }));

        if (activeTab === "soccer") {
          setSoccerPlayers(loadedPlayers);
        } else {
          setBasketballPlayers(loadedPlayers);
        }
      } catch (error) {
        console.error("선수단 로드 실패 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
    
    // 탭 전환 시 입력 폼 포지션 리셋 처리
    setPlayerPosition("");
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest text-gray-400">팀원 정보 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100">
        <p className="mb-4 text-lg font-semibold">🔒 로그인이 필요한 서비스입니다.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-green-500 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors text-white"
        >
          메인 화면으로 가기
        </Link>
      </div>
    );
  }

  const currentPlayers = activeTab === "soccer" ? soccerPlayers : basketballPlayers;

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <main className="max-w-6xl mx-auto mt-10 p-6">
        {/* 상단 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold mb-2">
            🏆 {loggedInUser.schoolName} 대표팀 스쿼드 관리
          </h1>
          <p className="text-gray-400 text-sm">
            종목별 팀 정보를 등록하고, 우리 학교를 빛낼 자랑스러운 라인업과 전술 포메이션을 배치하세요!
          </p>
        </div>

        {/* 종목 선택 탭 */}
        <div className="flex gap-4 border-b border-gray-700 pb-px mb-8">
          <button
            onClick={() => setActiveTab("soccer")}
            className={`pb-3 text-lg font-bold transition-all px-2 cursor-pointer ${
              activeTab === "soccer"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            ⚽ 축구 대표팀
          </button>
          <button
            onClick={() => setActiveTab("basketball")}
            className={`pb-3 text-lg font-bold transition-all px-2 cursor-pointer ${
              activeTab === "basketball"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            🏀 농구 대표팀
          </button>
        </div>

        {/* 메인 레이아웃: 좌측 Roster 관리 & 우측 Formation 경기장 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 👈 좌측 구역: 선수 등록 폼 & 로스터 목록 (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* [1] 선수 등록 폼 */}
              <div
                className={`p-6 rounded-xl border ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${
                    activeTab === "soccer" ? "text-green-400" : "text-orange-400"
                  }`}
                >
                  🏃‍♂️ 새 선수 등록
                </h3>
                <form onSubmit={handleRegisterPlayer} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">선수 이름</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="예: 홍길동"
                      className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">등번호</label>
                    <input
                      type="number"
                      value={playerNumber}
                      onChange={(e) => setPlayerNumber(e.target.value)}
                      placeholder="예: 7"
                      className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">포지션</label>
                    {activeTab === "soccer" ? (
                      <select
                        value={playerPosition}
                        onChange={(e) => setPlayerPosition(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                      >
                        <option value="">-- 선택하세요 --</option>
                        <option value="공격수(FW)">공격수(FW)</option>
                        <option value="미드필더(MF)">미드필더(MF)</option>
                        <option value="수비수(DF)">수비수(DF)</option>
                        <option value="골키퍼(GK)">골키퍼(GK)</option>
                      </select>
                    ) : (
                      <select
                        value={playerPosition}
                        onChange={(e) => setPlayerPosition(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                      >
                        <option value="">-- 선택하세요 --</option>
                        <option value="가드(G)">가드(G)</option>
                        <option value="포워드(F)">포워드(F)</option>
                        <option value="센터(C)">센터(C)</option>
                      </select>
                    )}
                  </div>
                  <button
                    type="submit"
                    className={`w-full mt-2 py-2 text-white font-bold rounded-lg transition-colors text-sm cursor-pointer ${
                      activeTab === "soccer"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    명부에 등록하기
                  </button>
                </form>
              </div>

              {/* [2] 공식 로스터 리스트 */}
              <div
                className={`md:col-span-2 p-6 rounded-xl border ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"
                }`}
              >
                <h3 className="text-lg font-bold mb-4 text-gray-200">
                  📋 {activeTab === "soccer" ? "축구팀" : "농구팀"} 공식 로스터 ({currentPlayers.length}명)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400 text-xs">
                        <th className="py-2">등번호</th>
                        <th className="py-2">이름</th>
                        <th className="py-2">포지션</th>
                        <th className="py-2 text-center">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPlayers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-xs text-gray-500">
                            아직 등록된 대표 선수가 없습니다. 왼쪽에 선수를 추가해 주세요.
                          </td>
                        </tr>
                      ) : (
                        currentPlayers.map((player) => (
                          <tr
                            key={player.id}
                            className="border-b border-gray-800 text-gray-200 hover:bg-gray-700/30"
                          >
                            <td
                              className={`py-3 font-mono font-bold ${
                                activeTab === "soccer" ? "text-green-400" : "text-orange-400"
                              }`}
                            >
                              No. {player.number}
                            </td>
                            <td className="py-3 font-semibold">{player.name}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 text-xs bg-gray-900 rounded-md border border-gray-700">
                                {player.position}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => handleDeletePlayer(player.id, player.name)}
                                className="px-2 py-1 text-xs font-bold bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-md transition-all cursor-pointer"
                              >
                                🗑️ 제명
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          {/* 👉 우측 구역: 시각적 포메이션 배치 경기장 (col-span-1) */}
          <div
            className={`p-6 rounded-xl border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"
            }`}
          >
            <FormationPitch
              sportsType={activeTab}
              players={currentPlayers}
              schoolName={loggedInUser.schoolName}
              email={loggedInUser.email}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
