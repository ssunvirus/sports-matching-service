// src/app/api/register/route.ts (파이어베이스 전용 최적화 최종본)
import { NextResponse } from "next/server";
import { db } from "@/src/app/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. 프론트엔드 모달창에서 전송한 가입 데이터를 받아옵니다.
    const body = await request.json();
    const { email, schoolName } = body;

    // 기획적 필수 예외 처리
    if (!email || !schoolName) {
      return NextResponse.json(
        { error: "이메일과 소속 학교를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 2. [기획적 핵심 로직] 구글 파이어베이스에 조회 명령을 날려 이미 가입된 중복 사용자가 있는지 검사합니다.
    const usersRef = collection(db, "users"); // 'users'라는 서랍장(컬렉션)을 지정합니다.
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: "이미 가입된 이메일 주소입니다." },
        { status: 400 }
      );
    }

    // 3. [진짜 구글 DB 영구 저장] 검증이 끝난 새 회원을 파이어스토어 서랍장에 JSON 형태로 즉시 기록합니다!
    const newUser = {
      email,
      schoolName,
      joinedAt: new Date().toISOString() // 가입 일시 기록
    };

    await addDoc(usersRef, newUser);

    // 프론트엔드 화면단으로 성공 신호 반환
    return NextResponse.json(
      { message: "구글 데이터베이스 저장 성공!", user: newUser },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("파이어베이스 구글 서버 통신 중 백엔드 에러 발생:", error);
    return NextResponse.json(
      { error: error.message || "데이터베이스 연결 실패" },
      { status: 500 }
    );
  }
}