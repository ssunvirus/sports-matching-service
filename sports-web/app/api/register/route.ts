// src/app/api/register/route.ts (방화벽 우회 다이렉트 최종본)
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// 💡 src/app/api/register/route.ts 파일의 7번째 줄 주소를 이 코드로 완전히 교체하세요!
const MONGODB_URI = "mongodb://kimsg19950430_db_user:kimsg1995@ac-9xvxqm-shard-00-00.1jcdehn.mongodb.net:27017,ac-9xvxqm-shard-00-01.1jcdehn.mongodb.net:27017,ac-9xvxqm-shard-00-02.1jcdehn.mongodb.net:27017/sportsDB?ssl=true&replicaSet=atlas-9xvxqm-shard-0&authSource=admin&retryWrites=true&w=majority";


async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  schoolName: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now }
});

const User = mongoose.models && mongoose.models.User 
  ? mongoose.models.User 
  : mongoose.model("User", UserSchema);

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, schoolName } = body;

    if (!email || !schoolName) {
      return NextResponse.json({ error: "이메일과 소속 학교를 모두 입력해주세요." }, { status: 400 });
    }

    const isDuplicate = await (User as any).findOne({ email });
    if (isDuplicate) {
      return NextResponse.json({ error: "이미 가입된 이메일 주소입니다." }, { status: 400 });
    }

    const Model = User as any;
    const newUser = new Model({ email, schoolName });
    await newUser.save();

    return NextResponse.json({ message: "진짜 데이터베이스 저장 성공!", user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error("진짜 DB 프로그램 통신 중 백엔드 에러 발생:", error);
    return NextResponse.json({ error: error.message || "데이터베이스 프로그램 연결 실패" }, { status: 500 });
  }
}