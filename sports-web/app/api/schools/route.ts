// src/app/api/schools/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. 선균님이 발급받으신 진짜 나이스 오픈 API 인증키입니다.
  const API_KEY = "e52ec22ab24f47df86d419028892807d";

  // 2. 프론트엔드에서 실시간 타이핑으로 보낸 검색어(?search=숭실)를 추출합니다.
  const { searchParams } = new URL(request.url);
  const SCHUL_NM = searchParams.get("search") || "";

  // 검색어가 완전히 비어있으면 교육청 서버 과부하 방지를 위해 즉시 빈 배열을 반환합니다.
  if (!SCHUL_NM.trim()) {
    return NextResponse.json([]);
  }

  // 3. 나이스 교육청 학교기본정보 API 주소 조립 (초/중/고 전체 검색을 위해 학교급 필터를 뺐습니다)
  const neisUrl = `https://open.neis.go.kr/hub/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=40&SCHUL_NM=${encodeURIComponent(
    SCHUL_NM
  )}`;

  try {
    // 4. 내 백엔드 서버가 나이스 서버에 실시간으로 통신(fetch)을 넣습니다.
    // { next: { revalidate: 60 } } 은 60초 동안 검색 결과를 기억(캐싱)해서 속도를 비약적으로 올리는 실무 기술입니다.
    const res = await fetch(neisUrl, { next: { revalidate: 60 } });
    const data = await res.json();

    let combinedSchools: any[] = [];

    // 나이스 관할 서버에서 정상적으로 로우(row) 데이터를 줬는지 꼼꼼하게 검증합니다.
    if (data.schoolInfo && data.schoolInfo[1] && data.schoolInfo[1].row) {
      data.schoolInfo[1].row.forEach((school: any) => {
        let typeEmoji = "🏫";
        const gubun = school.SCHUL_KND_SC_NM; // 교육청 장부상 초등/중등/고등 분류 데이터
        
        // 기획 요소를 살려 사용자가 직관적으로 구분할 수 있도록 이모지 배지를 달아줍니다.
        if (gubun.includes("초등학교")) typeEmoji = "🎒 [초등]";
        else if (gubun.includes("중학교")) typeEmoji = "📐 [중등]";
        else if (gubun.includes("고등학교")) typeEmoji = "🔥 [고등]";
        else return; // 스포츠 매칭 앱 특성상 유치원이나 기타 특수 분류는 리스트에서 제외(기획 예외처리)합니다.

        combinedSchools.push({
          school_name: `${typeEmoji} ${school.SCHUL_NM}`,
        });
      });
    }

    // 5. 사용자가 가나다 순으로 보기 편하게 학교 이름을 깔끔하게 정렬(sort)해 줍니다.
    combinedSchools.sort((a, b) => a.school_name.localeCompare(b.school_name));

    // 정제 완료된 안전한 데이터를 프론트엔드로 쏴줍니다.
    return NextResponse.json(combinedSchools);

  } catch (error) {
    console.error("대한민국 교육청 API 통신 중 백엔드 에러 발생:", error);
    // 외부 기관 서버 에러로 내 서비스 화면이 터지는 것을 막기 위해 안전하게 빈 배열을 돌려줍니다.
    return NextResponse.json([]);
  }
}