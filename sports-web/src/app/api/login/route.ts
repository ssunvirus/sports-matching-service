// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. 프론트엔드 로그인 창에서 보낸 이메일 데이터를 받습니다.
    const body = await request.json();
    const { email } = body;

    // 예외 처리: 이메일이 입력되지 않은 경우
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "이메일 주소를 입력해주세요." },
        { status: 400 }
      );
    }

    // 2. [검문 로직] 구글 파이어베이스 'users' 서랍장에서 이 이메일을 가진 유저가 있는지 찾습니다.
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.trim()));
    const querySnapshot = await getDocs(q);

    // 3. 만약 장부가 텅 비어있다면? -> 가입되지 않은 유저!
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "등록되지 않은 이메일 주소입니다. 회원가입을 먼저 진행해주세요." },
        { status: 404 }
      );
    }

    // 4. 장부를 찾았다면 데이터베이스에서 해당 유저의 정보를 꺼내옵니다.
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // 5. 검문 완료! 프론트엔드에게 성공 신호와 유저 정보를 반환합니다.
    return NextResponse.json(
      { 
        message: "로그인 성공!", 
        user: {
          email: userData.email,
          schoolName: userData.schoolName
        } 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("로그인 처리 중 백엔드 에러 발생:", error);
    return NextResponse.json(
      { error: error.message || "서버 통신 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}