// src/app/team-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// 🎯 [추가] 파이어베이스 진짜 데이터베이스 창고와 연결할 마법의 부품들 가져오기
import { db } from "../../app/lib/firebase";
// 🎯 [수정] doc와 deleteDoc 부품을 추가로 가져옵니다!
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

export default function TeamManagementPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<{
    email: string;
    schoolName: string;
  } | null>(null);

  // 🎯 [기획 포인트 1] 현재 선택된 종목 탭 상태 (축구 코치 화면 vs 농구 코치 화면 스위칭용)
  const [activeTab, setActiveTab] = useState<"soccer" | "basketball">("soccer");
  const [isLoading, setIsLoading] = useState(true);

  // 🎯 [새로 타이핑할 코드] 선수 등록을 위한 입력창 상태 바구니들
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerPosition, setPlayerPosition] = useState("");

  // 🎯 [새로 타이핑할 코드] 등록된 선수 목록을 담아둘 리스트 바구니 (우선 축구팀용 예시)
  const [soccerPlayers, setSoccerPlayers] = useState<
    { id: string | number; name: string; number: string; position: string }[]
  >([
    { id: 1, name: "김선균", number: "10", position: "공격수(FW)" }, // 기본 샘플 데이터 하나 넣어둡니다!
  ]);

  // 🎯 [교체] 파이어베이스 클라우드 무선 전송을 위해 함수 앞에 'async'를 붙여줍니다!
  const handleRegisterPlayer = async (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지 방어막

    if (!playerName || !playerNumber || !playerPosition) {
      alert("선수의 이름, 등번호, 포지션을 모두 입력해 주세요! 🏃‍♂️");
      return;
    }

    try {
      // 🚀 [클라우드 백엔드 연동] 파이어베이스 Firestore의 'players' 장부에 데이터를 원격 전송합니다!
      const docRef = await addDoc(collection(db, "players"), {
        schoolName: loggedInUser?.schoolName || "알 수 없는 학교", // 우리 학교 이름 꼬리표 달기
        userEmail: loggedInUser?.email || "알 수 없는 이메일",
        name: playerName,
        number: playerNumber,
        position: playerPosition,
        sportsType: "soccer", // 축구 탭에서 등록했으므로 축구로 고정
        createdAt: new Date(), // 등록한 날짜/시간 기록
      });

      // 파이어베이스 원격 저장에 완전히 성공한 경우에만 화면 리스트에 반영합니다.
      const newPlayer = {
        id: docRef.id, // 💡 중요: 임시 숫자가 아니라 파이어베이스가 부여해 준 진짜 '고유 ID'를 꽂아줍니다!
        name: playerName,
        number: playerNumber,
        position: playerPosition,
      };

      setSoccerPlayers([...soccerPlayers, newPlayer]);

      // 입력창 깔끔하게 청소하기
      setPlayerName("");
      setPlayerNumber("");
      setPlayerPosition("");
      alert(
        "🚀 파이어베이스 클라우드 진짜 데이터베이스에 데이터가 박혔습니다! 수고하셨어요!",
      );
    } catch (error: any) {
      console.error("파이어베이스 전송 실패 원인 에러로그:", error);
      alert("❌ 파이어베이스 저장 실패: " + error.message);
    }
  }; // 🎯 찌꺼기 없이 깔끔하게 통신 함수 종결!

  // 🎯 [추가] 명부에서 선수를 영구 제명하는 마법의 삭제 함수
  const handleDeletePlayer = async (
    playerId: string | number,
    playerName: string,
  ) => {
    // 💡 기획적 안정장치: 코치님이 실수로 누르는 것을 방지하기 위해 컨펌창을 띄웁니다.
    if (
      !confirm(
        `정말로 ${playerName} 선수를 대표팀 명부에서 삭제하시겠습니까? 😰`,
      )
    ) {
      return;
    }

    try {
      // 🚀 [클라우드 백엔드 연동] 파이어베이스 'players' 서랍장에서 해당 고유 ID를 가진 문서를 찾아 폭파시킵니다!
      await deleteDoc(doc(db, "players", String(playerId)));

      // 파이어베이스 창고에서 삭제가 완벽히 성공했다면, 내 화면 바구니에서도 해당 선수를 필터링해서 지워줍니다.
      setSoccerPlayers(
        soccerPlayers.filter((player) => player.id !== playerId),
      );

      alert("🚀 파이어베이스 클라우드에서 해당 선수가 완전히 제명되었습니다.");
    } catch (error: any) {
      console.error("선수 삭제 실패 에러로그:", error);
      alert("❌ 삭제 실패: " + error.message);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    let currentUser = null;

    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      setLoggedInUser(currentUser);
    }

    // 🎯 [핵심 기획 조회 로직] 파이어베이스 창고에서 우리 학교 선수 명단만 쏙쏙 털어오기
    const fetchPlayers = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        // 🔍 [쿼리 빌드] 'players' 장부에서 (우리 학교 조건 AND 축구 종목 조건)인 것만 최신순으로 정렬해서 조준합니다!
        const q = query(
          collection(db, "players"),
          where("schoolName", "==", currentUser.schoolName),
          where("sportsType", "==", "soccer"),
          orderBy("createdAt", "asc"),
        );

        // 🚀 조준한 데이터를 진짜로 긁어옵니다.
        const querySnapshot = await getDocs(q);

        // 파이어베이스에서 받아온 맛있는 빅데이터 알맹이들을 이쁘게 정렬해서 배열로 바꿉니다.
        const loadedPlayers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          number: doc.data().number,
          position: doc.data().position,
        }));

        // 🏆 샘플 데이터를 버리고 파이어베이스에서 온 진짜 우리 학교 스쿼드로 바구니를 채웁니다!
        setSoccerPlayers(loadedPlayers);
      } catch (error) {
        console.error("선수단 로드 실패 에러:", error);
      } finally {
        // 모든 조사가 진짜 끝났으니 그제야 대기 화면을 꺼줍니다.
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // 🎯 장부를 다 읽기 전까지는 "잠시 대기" 화면을 보여주며 렉을 방지합니다.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <p className="text-sm tracking-widest animate-pulse text-gray-400">
          팀원 확인 중...
        </p>
      </div>
    );
  }

  // 장부 조사가 끝난 확실한 상태에서만 로그인 체크를 합니다.
  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100">
        <p className="mb-4 text-lg font-semibold">
          🔒 로그인이 필요한 서비스입니다.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-green-500 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors"
        >
          메인 화면으로 가기
        </Link>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      {/* 메인 콘텐츠 구역 */}
      <main className="max-w-5xl mx-auto mt-10 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold mb-2">
            🏆 {loggedInUser.schoolName} 대표팀 스쿼드 관리
          </h1>
          <p className="text-gray-400 text-sm">
            종목별 팀 정보를 등록하고, 우리 학교를 빛낼 자랑스러운 라인업을
            완성하세요!
          </p>
        </div>

        {/* 🎯 [기획 포인트 2] 종목 선택 탭 메뉴바 */}
        <div className="flex gap-4 border-b border-gray-700 pb-px mb-8">
          <button
            onClick={() => setActiveTab("soccer")}
            className={`pb-3 text-lg font-bold transition-all px-2 ${activeTab === "soccer" ? "text-green-400 border-b-2 border-green-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            ⚽ 축구 대표팀
          </button>
          <button
            onClick={() => setActiveTab("basketball")}
            className={`pb-3 text-lg font-bold transition-all px-2 ${activeTab === "basketball" ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            🏀 농구 대표팀
          </button>
        </div>

        {/* 🎯 [기획 포인트 3] 선택된 탭에 따라 다르게 보여줄 서브 화면 */}
        {activeTab === "soccer" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 왼쪽 구역: 선수 등록 입력 폼 컴포넌트 */}
            <div
              className={`p-6 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"}`}
            >
              <h3 className="text-lg font-bold mb-4 text-green-400">
                🏃‍♂️ 새 선수 등록
              </h3>
              <form
                onSubmit={handleRegisterPlayer}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    선수 이름
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    등번호
                  </label>
                  <input
                    type="number"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                    placeholder="예: 7"
                    className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    포지션
                  </label>
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
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  명부에 등록하기
                </button>
              </form>
            </div>

            {/* 오른쪽 구역: 우리 학교 실시간 스쿼드 명단 명부 */}
            <div
              className={`md:col-span-2 p-6 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"}`}
            >
              <h3 className="text-lg font-bold mb-4 text-gray-200">
                📋 축구팀 공식 로스터 ({soccerPlayers.length}명)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs">
                      <th className="py-2">등번호</th>
                      <th className="py-2">이름</th>
                      <th className="py-2">포지션</th>
                      <th className="py-2 text-center">관리</th>
                      {/* 🎯 [열 추가] */}
                    </tr>
                  </thead>
                  <tbody>
                    {soccerPlayers.map((player) => (
                      <tr
                        key={player.id}
                        className="border-b border-gray-800 text-gray-200 hover:bg-gray-700/30"
                      >
                        <td className="py-3 font-mono font-bold text-green-400">
                          No. {player.number}
                        </td>
                        <td className="py-3 font-semibold">{player.name}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 text-xs bg-gray-900 rounded-md border border-gray-700">
                            {player.position}
                          </span>
                        </td>
                        {/* 🎯 [삭제 버튼 추가] 클릭 시 위의 handleDeletePlayer 함수로 고유 ID와 이름을 토스합니다! */}
                        <td className="py-3 text-center">
                          <button
                            onClick={() =>
                              handleDeletePlayer(player.id, player.name)
                            }
                            className="px-2 py-1 text-xs font-bold bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-md transition-all cursor-pointer"
                          >
                            🗑️ 제명
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`p-6 rounded-xl border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow"}`}
          >
            <h3 className="text-xl font-bold mb-4 text-orange-400">
              🏀 농구단 설정 현황
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              여기에 농구 5인조 스쿼드 및 등번호 설정 양식이 들어올 자리입니다.
            </p>
            <div className="p-12 text-center border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/20">
              [농구 대표팀 등록 폼 기획 대기 중]
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
