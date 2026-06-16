// src/components/FormationPitch.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../app/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
}

interface FormationPitchProps {
  sportsType: "soccer" | "basketball";
  players: Player[];
  schoolName: string;
  email: string;
}

// 축구 포지션 정의
const SOCCER_FORMATIONS: Record<string, { label: string; top: string; left: string }[]> = {
  "4-3-3": [
    { label: "GK", top: "85%", left: "50%" },
    { label: "LB", top: "68%", left: "15%" },
    { label: "LCB", top: "72%", left: "38%" },
    { label: "RCB", top: "72%", left: "62%" },
    { label: "RB", top: "68%", left: "85%" },
    { label: "LCM", top: "45%", left: "25%" },
    { label: "CM", top: "52%", left: "50%" },
    { label: "RCM", top: "45%", left: "75%" },
    { label: "LW", top: "20%", left: "20%" },
    { label: "ST", top: "15%", left: "50%" },
    { label: "RW", top: "20%", left: "80%" },
  ],
  "4-4-2": [
    { label: "GK", top: "85%", left: "50%" },
    { label: "LB", top: "68%", left: "15%" },
    { label: "LCB", top: "72%", left: "38%" },
    { label: "RCB", top: "72%", left: "62%" },
    { label: "RB", top: "68%", left: "85%" },
    { label: "LM", top: "45%", left: "15%" },
    { label: "LCM", top: "48%", left: "38%" },
    { label: "RCM", top: "48%", left: "62%" },
    { label: "RM", top: "45%", left: "85%" },
    { label: "LS", top: "18%", left: "35%" },
    { label: "RS", top: "18%", left: "65%" },
  ],
  "3-5-2": [
    { label: "GK", top: "85%", left: "50%" },
    { label: "LCB", top: "70%", left: "25%" },
    { label: "CB", top: "73%", left: "50%" },
    { label: "RCB", top: "70%", left: "75%" },
    { label: "LWB", top: "48%", left: "12%" },
    { label: "LCM", top: "45%", left: "33%" },
    { label: "DM", top: "54%", left: "50%" },
    { label: "RCM", top: "45%", left: "67%" },
    { label: "RWB", top: "48%", left: "88%" },
    { label: "LS", top: "18%", left: "35%" },
    { label: "RS", top: "18%", left: "65%" },
  ],
};

// 농구 포지션 정의 (스타팅 5)
const BASKETBALL_POSITIONS = [
  { label: "PG", top: "70%", left: "50%", name: "포인트 가드" },
  { label: "SG", top: "52%", left: "22%", name: "슈팅 가드" },
  { label: "SF", top: "52%", left: "78%", name: "스몰 포워드" },
  { label: "PF", top: "32%", left: "33%", name: "파워 포워드" },
  { label: "C", top: "25%", left: "67%", name: "센터" },
];

export default function FormationPitch({ sportsType, players, schoolName, email }: FormationPitchProps) {
  const isSoccer = sportsType === "soccer";
  const [selectedFormation, setSelectedFormation] = useState<string>(isSoccer ? "4-3-3" : "starting5");
  const [lineup, setLineup] = useState<Record<string, string>>({}); // { positionLabel: playerId }
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // 현재 선택 중인 포지션 라벨
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Firestore 고유 문서 ID 생성
  const docId = `${schoolName.trim().replace(/\s+/g, "_")}_${sportsType}`;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Firestore에서 기존 포메이션 & 라인업 데이터 로드
  useEffect(() => {
    const loadSavedFormation = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "formations", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.selectedFormation) {
            setSelectedFormation(data.selectedFormation);
          }
          if (data.lineup) {
            setLineup(data.lineup);
          }
        } else {
          // 문서가 없는 경우 초기화
          setSelectedFormation(isSoccer ? "4-3-3" : "starting5");
          setLineup({});
        }
      } catch (error) {
        console.error("포메이션 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedFormation();
  }, [sportsType, schoolName, docId, isSoccer]);

  // 포메이션 변경 시 배치 리셋 방지 및 조정
  const handleFormationChange = (formName: string) => {
    setSelectedFormation(formName);
    setActiveDropdown(null);
  };

  // 포지션에 선수 매핑
  const handleAssignPlayer = (positionLabel: string, playerId: string) => {
    setLineup((prev) => {
      const updated = { ...prev };
      if (playerId === "") {
        delete updated[positionLabel]; // 비우기
      } else {
        // 중복 배정 방지 (다른 포지션에 이미 들어가 있는 선수라면 이전 위치에서 해제)
        Object.keys(updated).forEach((pos) => {
          if (updated[pos] === playerId) {
            delete updated[pos];
          }
        });
        updated[positionLabel] = playerId;
      }
      return updated;
    });
    setActiveDropdown(null);
  };

  // Firestore에 배치 저장
  const handleSaveFormation = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const docRef = doc(db, "formations", docId);
      await setDoc(docRef, {
        schoolName,
        sportsType,
        selectedFormation,
        lineup,
        updatedBy: email,
        updatedAt: serverTimestamp(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("포메이션 저장 에러:", error);
      alert("포메이션 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 현재 포지션 목록 배열 추출
  const currentPositions = isSoccer
    ? SOCCER_FORMATIONS[selectedFormation] || SOCCER_FORMATIONS["4-3-3"]
    : BASKETBALL_POSITIONS;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">포메이션 보드 로드 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* 컨트롤 헤더 */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 mb-4 border-b border-gray-800 pb-4">
        <div>
          <h4 className="text-md font-bold text-gray-200 flex items-center gap-2">
            📋 {isSoccer ? "⚽ 축구 포메이션 전술판" : "🏀 농구 스타팅 라인업"}
          </h4>
          <p className="text-xs text-gray-500 mt-1">포지션 노드를 눌러 선수를 배치하고 전술을 구축하세요.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* 축구일 때만 포메이션 셀렉터 노출 */}
          {isSoccer && (
            <select
              value={selectedFormation}
              onChange={(e) => handleFormationChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="4-3-3">4-3-3 전술</option>
              <option value="4-4-2">4-4-2 전술</option>
              <option value="3-5-2">3-5-2 전술</option>
            </select>
          )}

          <button
            onClick={handleSaveFormation}
            disabled={isSaving}
            className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg transition-all flex items-center gap-1.5 shadow-md whitespace-nowrap shrink-0 ${
              saveSuccess
                ? "bg-emerald-600 shadow-emerald-600/20"
                : "bg-green-500 hover:bg-green-600 shadow-green-500/20 cursor-pointer"
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                저장 중...
              </>
            ) : saveSuccess ? (
              "✓ 전술 저장 완료!"
            ) : (
              "💾 전술 저장"
            )}
          </button>
        </div>
      </div>

      {/* 시각적 경기장 보드 */}
      <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 select-none bg-slate-900">
        
        {/* 경기장 라인 마킹 */}
        {isSoccer ? (
          /* 축구장 라인 데코 */
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/90 to-emerald-950/95 flex flex-col justify-between pointer-events-none">
            {/* 상단 골 에어리어 */}
            <div className="relative w-full h-[18%] border-b border-white/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[45%] h-full border-x border-b border-white/20"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-[40%] border-x border-b border-white/20"></div>
            </div>
            {/* 중앙 센터서클 & 센터라인 */}
            <div className="relative w-full h-[2px] bg-white/25">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/25 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/30 rounded-full"></div>
            </div>
            {/* 하단 골 에어리어 */}
            <div className="relative w-full h-[18%] border-t border-white/20">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[45%] h-full border-x border-t border-white/20"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[20%] h-[40%] border-x border-t border-white/20"></div>
            </div>
          </div>
        ) : (
          /* 농구 코트 라인 데코 */
          <div className="absolute inset-0 bg-gradient-to-b from-amber-800/80 to-amber-950/90 pointer-events-none flex flex-col justify-between">
            {/* 상단 3점 슛 라인 및 백보드 */}
            <div className="relative w-full h-[60%] border-b border-white/20 overflow-hidden">
              {/* 백보드 & 링 */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-white/50"></div>
              <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-4 h-4 border border-orange-500 rounded-full"></div>
              {/* 제한구역/페인트 박스 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-28 border-x border-b border-white/20 bg-white/5"></div>
              {/* 3점슛 아크 */}
              <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-64 h-64 border border-white/20 rounded-full"></div>
              {/* 자유투 원 */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 border border-white/20 rounded-full"></div>
            </div>
            {/* 중앙 센터라인 */}
            <div className="relative w-full h-[40%] border-t border-white/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/20 rounded-full"></div>
            </div>
          </div>
        )}

        {/* 터치 감지 밖 레이어 - 드롭다운 클릭 시 방해 방지용 */}
        <div className="absolute inset-0">
          {currentPositions.map((pos) => {
            const assignedPlayerId = lineup[pos.label];
            const player = players.find((p) => p.id === assignedPlayerId);
            const isAssigned = !!player;

            return (
              <div
                key={pos.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ top: pos.top, left: pos.left }}
              >
                {/* 포지션 원형 배지 */}
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === pos.label ? null : pos.label)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                    isAssigned
                      ? isSoccer
                        ? "bg-slate-900 border-green-400 text-green-400 shadow-green-500/20"
                        : "bg-slate-900 border-orange-400 text-orange-400 shadow-orange-500/20"
                      : "bg-black/55 border-white/40 text-white/80 hover:bg-black/70 hover:border-white"
                  }`}
                >
                  {isAssigned ? (
                    <span className="text-sm font-extrabold">{player.number}</span>
                  ) : (
                    <span>{pos.label}</span>
                  )}
                </button>

                {/* 배정된 선수명 레이블 */}
                {isAssigned && (
                  <span className="mt-1 px-1.5 py-0.5 text-[10px] font-bold bg-slate-900/90 text-gray-100 rounded border border-gray-800 shadow-sm whitespace-nowrap">
                    {player.name}
                  </span>
                )}

                {/* 선수 선택 팝업/드롭다운 (해당 포지션 활성화 시) */}
                {activeDropdown === pos.label && (
                  <div
                    ref={dropdownRef}
                    className="absolute bottom-12 z-50 bg-slate-950 border border-gray-800 rounded-xl shadow-2xl p-2 w-48 text-left max-h-48 overflow-y-auto"
                    style={{ left: pos.left === "85%" || pos.left === "80%" || pos.left === "88%" ? "auto" : "50%", right: pos.left === "85%" || pos.left === "80%" || pos.left === "88%" ? "0px" : "auto", transform: pos.left === "85%" || pos.left === "80%" || pos.left === "88%" ? "none" : "translateX(-50%)" }}
                  >
                    <div className="px-2 py-1 text-[10px] font-bold text-gray-500 border-b border-gray-800 mb-1 flex items-center justify-between">
                      <span>{pos.label} 포지션 배정</span>
                      <button
                        onClick={() => handleAssignPlayer(pos.label, "")}
                        className="text-red-400 hover:text-red-300 underline font-semibold text-[9px] cursor-pointer"
                      >
                        비우기
                      </button>
                    </div>

                    {players.length === 0 ? (
                      <p className="p-2 text-center text-xs text-gray-600">등록된 선수가 없습니다.</p>
                    ) : (
                      <div className="space-y-0.5">
                        {players.map((p) => {
                          const isAlreadyAssignedElsewhere = Object.keys(lineup).some(
                            (k) => k !== pos.label && lineup[k] === p.id
                          );
                          const isCurrent = lineup[pos.label] === p.id;

                          return (
                            <button
                              key={p.id}
                              onClick={() => handleAssignPlayer(pos.label, p.id)}
                              className={`w-full px-2 py-1.5 rounded text-xs text-left font-medium flex items-center justify-between transition-colors ${
                                isCurrent
                                  ? "bg-green-500/20 text-green-400"
                                  : "hover:bg-gray-800 text-gray-300"
                              }`}
                            >
                              <span className="truncate">
                                No.{p.number} {p.name}
                              </span>
                              {isAlreadyAssignedElsewhere && (
                                <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1 rounded shrink-0">
                                  이동
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
