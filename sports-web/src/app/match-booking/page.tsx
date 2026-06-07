// src/app/match-booking/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 🎯 [추가] 등록 완료 후 게시판으로 화면을 워프시킬 네비게이터
import { db } from "../lib/firebase"; // 🎯 [추가] 우리 파이어베이스 진짜 창고 열쇠 가져오기
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // 🎯 [추가] 파이어베이스 소통 장부들

// 🏟️ 예약 가능한 구장들 샘플 데이터 명부
const STADIUM_SAMPLES = [
    {
        id: "stadium-1",
        name: "목동종합운동장 주경기장",
        location: "서울 양천구 안양천로 939",
        type: "축구장 (천연잔디)",
        price: "시간당 50,000원",
        image: "⚽",
        sportType: "축구" // 🎯 필터링 및 매치 저장을 위해 종목 타입을 확실히 지정합니다.
    },
    {
        id: "stadium-2",
        name: "신트리공원 인조잔디구장",
        location: "서울 양천구 신정동 117-1",
        type: "축구장 (인조잔디)",
        price: "시간당 35,000원",
        image: "⚽",
        sportType: "축구"
    },
    {
        id: "stadium-3",
        name: "양천디지털체육센터 체육관",
        location: "서울 양천구 목동서로 351",
        type: "농구장 (실내마루)",
        price: "시간당 40,000원",
        image: "🏀",
        sportType: "농구"
    },
    {
        id: "stadium-4",
        name: "목동동로 다목적 매칭구장",
        location: "서울 양천구 목동중앙로 48",
        type: "농구장 / 풋살장 복합",
        price: "시간당 30,000원",
        image: "⚽🏀",
        sportType: "농구"
    },
];

export default function MatchBookingPage() {
    const router = useRouter(); // 🎯 워프 로봇 초기화
    const [loggedInUser, setLoggedInUser] = useState<{ email: string; schoolName: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🎯 사용자가 최종 매치 등록을 위해 선택한 구장과 시간 상태 바구니
    const [selectedStadium, setSelectedStadium] = useState<typeof STADIUM_SAMPLES[0] | null>(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [matchTitle, setMatchTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // 🎯 중복 클릭 방지용 락(Lock) 변수

    // 화면 켜지자마자 로그인 정보 체크
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setLoggedInUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    // 🚀 [매치 등록 엔진] 클릭 시 파이어베이스 'matches' 서랍장에 실시간 저장!
    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!loggedInUser) {
            alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
            return;
        }

        if (!selectedStadium || !selectedTime || !matchTitle.trim()) {
            alert("구장, 시간대, 매치 도전장 멘트를 모두 완성해 주세요! 🏟️");
            return;
        }

        try {
            setIsSubmitting(true); // 버튼 잠금!

            // 🎯 [파이어베이스 적재 기획] 'matches'라는 이름의 새로운 서랍장을 개설하고 데이터를 밀어 넣습니다.
            await addDoc(collection(db, "matches"), {
                schoolName: loggedInUser.schoolName,      // 신청 코치님의 학교명
                writerEmail: loggedInUser.email,         // 작성자 이메일
                sportType: selectedStadium.sportType,     // 구장 기반 종목 (축구 / 농구)
                stadiumName: selectedStadium.name,       // 선택한 구장 이름
                timeSlot: selectedTime,                  // 매칭 희망 시간대
                title: matchTitle,                        // 도전장 한줄평
                status: "대기중",                         // 기본 매칭 상태값
                createdAt: serverTimestamp(),             // 파이어베이스 서버 시각 도장
            });

            alert(`🏆 성공적으로 매치 도전장이 오픈되었습니다!\n다른 학교들이 볼 수 있도록 매치 확인 게시판으로 이동합니다.`);

            // 🎯 [UX 워프] 등록이 끝나면 방금 만든 '등록된 매치 확인' 페이지(`/match-list`)로 자동 순간이동 시킵니다!
            router.push("/match-list");

        } catch (error) {
            console.error("매치 등록 실패 에러 로그: ", error);
            alert("파이어베이스 창고 전송 중 에러가 발생했습니다. 터미널을 확인하세요.");
        } finally {
            setIsSubmitting(false); // 버튼 잠금 해제
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
                <p className="text-sm tracking-widest animate-pulse text-gray-400">구장 예약 정보 불러오는 중...</p>
            </div>
        );
    }

    if (!loggedInUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100">
                <p className="mb-4 text-lg font-semibold">🔒 매치 등록 및 구장 예약은 로그인이 필요합니다.</p>
                <Link href="/" className="px-4 py-2 bg-green-500 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors">
                    메인 화면으로 가기
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans p-6">
            <main className="max-w-6xl mx-auto mt-6">

                {/* 상단 타이틀 */}
                <div className="mb-8 border-b border-gray-800 pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-100 mb-2">🏟️ 경기 매치업 & 구장 예약 센터</h1>
                    <p className="text-gray-400 text-sm">
                        원하는 구장과 시간을 선택하여 <span className="text-green-400 font-bold">{loggedInUser.schoolName}</span>의 매치업 도전장을 띄워보세요!
                    </p>
                </div>

                {/* 2분할 레이아웃 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 👈 왼쪽 구역: 예약 가능한 구장 리스트 */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-green-400 mb-2 flex items-center gap-2">
                            🟢 현재 예약 가능한 우리 동네 구장 명부
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {STADIUM_SAMPLES.map((stadium) => {
                                const isSelected = selectedStadium?.id === stadium.id;
                                return (
                                    <div
                                        key={stadium.id}
                                        onClick={() => setSelectedStadium(stadium)}
                                        className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected
                                            ? "bg-green-500/10 border-green-400 shadow-md shadow-green-500/10"
                                            : "bg-gray-900 border-gray-800 hover:border-gray-700"
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl">{stadium.image}</span>
                                                <span className="text-xs bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-gray-400">
                                                    {stadium.type}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-100 mb-1">{stadium.name}</h3>
                                            <p className="text-xs text-gray-400 mb-4">📍 {stadium.location}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                                            <span className="text-sm font-semibold text-green-400">{stadium.price}</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${isSelected ? "bg-green-500 text-white" : "bg-gray-800 text-gray-400"
                                                }`}>
                                                {isSelected ? "✓ 선택됨" : "구장 선택"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 👉 오른쪽 구역: 선택한 구장에 시간대를 골라 매치 최종 등록하는 폼 */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit sticky top-2">
                        <h2 className="text-xl font-bold text-orange-400 mb-4">⚡ 매치업 등록 양식</h2>

                        <form onSubmit={handleCreateMatch} className="space-y-5">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">선택된 구장</label>
                                <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg text-sm">
                                    {selectedStadium ? (
                                        <p className="font-bold text-green-400">🏟️ {selectedStadium.name} ({selectedStadium.sportType})</p>
                                    ) : (
                                        <p className="text-gray-500 animate-pulse">왼쪽 명부에서 구장을 먼저 클릭해 주세요!</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">경기 희망 시간대</label>
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-orange-400 text-white"
                                >
                                    <option value="">-- 시간대를 골라주세요 --</option>
                                    <option value="주말 토요일 10:00 ~ 12:00">주말 토요일 10:00 ~ 12:00 (오전 매치)</option>
                                    <option value="주말 토요일 14:00 ~ 16:00">주말 토요일 14:00 ~ 16:00 (오후 매치)</option>
                                    <option value="주말 일요일 08:00 ~ 10:00">주말 일요일 08:00 ~ 10:00 (조기 축구 타임)</option>
                                    <option value="주말 일요일 19:00 ~ 21:00">주말 일요일 19:00 ~ 21:00 (야간 전등 매치)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">매치 한줄평 (도전장 멘트)</label>
                                <input
                                    type="text"
                                    value={matchTitle}
                                    onChange={(e) => setMatchTitle(e.target.value)}
                                    placeholder="예: 빡겜 말고 매너 경기하실 팀 모십니다!"
                                    className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-orange-400 text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedStadium || isSubmitting}
                                className={`mt-5 w-full py-3 rounded-lg font-bold text-sm transition-all text-white ${selectedStadium && !isSubmitting
                                    ? "bg-orange-500 hover:bg-orange-600 cursor-pointer shadow-lg shadow-orange-500/20"
                                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {isSubmitting ? "🚀 파이어베이스에 업로드 중..." : "🔥 이 조건으로 매치 오픈하기"}
                            </button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}