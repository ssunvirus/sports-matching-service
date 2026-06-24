// src/components/AuthModal.tsx (처음부터 끝까지 괄호 하나 놓치지 말고 복사해 주세요!)
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../app/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut 
} from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function AuthModal({ isOpen, onClose, isDarkMode }: AuthModalProps) {
  // 🎯 기본 모드는 로그인 창이 먼저 뜨도록 기획 세팅
  const [mode, setMode] = useState<"login" | "register">("login");

  // 데이터 보관 바구니들
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [isSchoolSelected, setIsSchoolSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);

  // 💡 교육청 API 실시간 학교 검색 로직
  useEffect(() => {
    if (isSchoolSelected || !searchTerm.trim()) {
      setFilteredSchools([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/schools?search=${encodeURIComponent(searchTerm)}`)
        .then((res) => res.json())
        .then((data) => setFilteredSchools(data))
        .catch((err) => console.error("백엔드 서버 통신 에러:", err));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isSchoolSelected]);

  if (!isOpen) return null;

  const handleSelectSchool = (schoolName: string) => {
    setSearchTerm(schoolName);
    setSelectedSchool(schoolName);
    setIsSchoolSelected(true);
    setFilteredSchools([]);
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    if (isSchoolSelected) {
      setIsSchoolSelected(false);
      setSelectedSchool("");
    }
  };

  // 🚀 이메일 인증 메일 재전송 함수
  const handleResendVerification = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth); // 발송 후 세션 로그아웃 유지
      setMessage("📧 인증 메일이 성공적으로 재전송되었습니다. 메일함을 확인해주세요.");
      setShowResend(false);
    } catch (error: any) {
      console.error("인증 메일 재전송 실패:", error);
      setMessage(`❌ 메일 재전송 실패: ${error.message || "오류가 발생했습니다."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 로그인 백엔드 통신 함수 수정 (Firebase Auth 연동)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setShowResend(false);

    try {
      // 1. Firebase Auth 로그인 시도
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. 이메일 인증 여부 검증
      if (!user.emailVerified) {
        // 아직 인증되지 않았으므로 강제 로그아웃 후 차단
        await signOut(auth);
        setShowResend(true);
        throw new Error("이메일 인증이 완료되지 않았습니다. 가입한 이메일로 전송된 인증 링크를 먼저 클릭해 주세요.");
      }

      // 3. 인증 완료 상태이므로 Firestore 'users' 컬렉션에서 유저 부가정보(학교) 조회
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("가입된 학교 정보가 데이터베이스에 존재하지 않습니다.");
      }

      const userData = querySnapshot.docs[0].data();

      // 🎯 [핵심 추가] 브라우저 비밀 수첩(localStorage)에 유저 장부 기록 보관!
      localStorage.setItem("user", JSON.stringify({
        email: userData.email,
        schoolName: userData.schoolName
      }));

      setMessage("🎉 로그인 성공! 환영합니다.");
      
      // 🎯 성공 후 화면을 새로고침하여 로그인 상태를 대시보드에 즉시 반영합니다.
      setTimeout(() => {
        onClose();
        setMessage("");
        window.location.reload(); 
      }, 1000);
    } catch (error: any) {
      console.error("로그인 에러:", error);
      let errMsg = error.message;
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errMsg = "이메일 또는 비밀번호가 일치하지 않습니다.";
      }
      setMessage(`❌ 로그인 실패: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 구글 파이어베이스 연동 회원가입 통신 함수 (Firebase Auth 연동)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !selectedSchool) {
      setMessage("❌ 이메일, 비밀번호, 학교를 모두 올바르게 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      // 1. 중복 이메일 체크 (기존에 DB의 'users' 컬렉션에 이미 해당 이메일이 있는지 확인)
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error("이미 등록된 이메일 주소입니다. 다른 이메일로 회원가입을 진행해주세요.");
      }

      // 2. Firebase Auth에 사용자 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 3. 이메일 인증 메일 발송
      await sendEmailVerification(user);

      // 4. Firestore 'users' 컬렉션에 부가 정보 저장 (비밀번호 저장 안함!)
      await addDoc(usersRef, {
        email: email.trim(),
        schoolName: selectedSchool,
        joinedAt: new Date().toISOString()
      });

      // 5. 가입 상태는 로그아웃 시켜두어 인증 후 로그인하게 유도
      await signOut(auth);

      setMessage(`🎉 가입 성공! 전송된 인증 이메일을 확인한 후 로그인해주세요.`);
      
      setTimeout(() => {
        setMode("login"); // 가입 성공 후 자동으로 로그인 화면 복귀
        setMessage("");
        setPassword("");
      }, 3000);
    } catch (error: any) {
      console.error("회원가입 에러:", error);
      let errMsg = error.message;
      if (error.code === "auth/email-already-in-use") {
        errMsg = "이미 사용 중인 이메일입니다.";
      } else if (error.code === "auth/invalid-email") {
        errMsg = "유효하지 않은 이메일 형식입니다.";
      } else if (error.code === "auth/weak-password") {
        errMsg = "비밀번호는 최소 6자 이상이어야 합니다.";
      }
      setMessage(`❌ 가입 실패: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-xl font-bold hover:text-red-500">✕</button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-green-500">
          {mode === "login" ? "🏆 킹 매치업 로그인" : "⚽ 새 장부 등록 (회원가입)"}
        </h2>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-center text-sm font-semibold ${message.startsWith("🎉") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {message}
          </div>
        )}

        {/* ------------------ [1] 로그인 폼 화면 ------------------ */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">등록된 이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.ac.kr"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">비밀번호</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 text-white font-bold rounded-lg bg-green-500 hover:bg-green-600">
              {isLoading ? "통신 중..." : "로그인하기"}
            </button>
            {showResend && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  {isLoading ? "인증 메일 전송 중..." : "✉️ 인증 메일 다시 받기"}
                </button>
              </div>
            )}
            <p className="text-center text-sm text-gray-400 mt-4">
              아직 회원이 아니신가요?{" "}
              <button type="button" onClick={() => { setMode("register"); setMessage(""); setPassword(""); setShowResend(false); }} className="text-green-400 font-bold underline ml-1">
                회원가입하기
              </button>
            </p>
          </form>
        ) : (
          /* ------------------ [2] 회원가입 폼 화면 ------------------ */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">이메일 주소</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.ac.kr"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">비밀번호 설정</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">소속 학교 검색</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="학교 이름을 입력하세요 (예: 목동)"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
              />
              {filteredSchools.length > 0 && (
                <ul className={`mt-2 max-h-40 overflow-y-auto border rounded-lg text-sm shadow-lg ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}>
                  {filteredSchools.map((school, idx) => (
                    <li key={idx} onClick={() => handleSelectSchool(school.school_name)} className={`px-4 py-2.5 cursor-pointer border-b last:border-0 ${isDarkMode ? "hover:bg-gray-600 border-gray-600" : "hover:bg-gray-100 border-gray-200"}`}>
                      {school.school_name}
                    </li>
                  ))}
                </ul>
              )}
              {isSchoolSelected && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-xl flex items-center justify-between">
                  <span>선택된 소속: <strong>{selectedSchool}</strong></span>
                  <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">선택완료</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={!isSchoolSelected || isLoading} className={`w-full py-3 mt-4 text-white font-bold rounded-lg ${isSchoolSelected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed opacity-50"}`}>
              {isLoading ? "등록 중..." : "동네 학교 매칭 가입하기"}
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">
              이미 계정이 있으신가요?{" "}
              <button type="button" onClick={() => { setMode("login"); setMessage(""); setPassword(""); setShowResend(false); }} className="text-blue-400 font-bold underline ml-1">
                로그인하러 가기
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}