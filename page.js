// 1. 전역 상태 관리
let currentUser = null; 
let allSchools = []; // 💡 API에서 받아온 전국 고등학교 목록을 저장할 바구니

// 2. 화면에 뿌려줄 매칭 더미 데이터
const dummyMatches = [
  {
    id: 1,
    sportsType: "축구",
    title: "1학년 3班 점심시간에 한 판 붙을 팀 찾습니다",
    school: "숭실고등학교",
    status: "모집중",
    date: "2026-05-23",
  },
  {
    id: 2,
    sportsType: "농구",
    title: "방과 후 체육관 3대3 농구 용병 구함",
    school: "중앙고등학교",
    status: "마감",
    date: "2026-05-20",
  },
  {
    id: 3,
    sportsType: "야구",
    title: "주말 친선 경기 주최합니다. 장비 보유 팀 환영",
    school: "배재고등학교",
    status: "모집중",
    date: "2026-05-30",
  },
];

// 3. 홈화면을 그려주는 함수 (다크모드)
function renderHome() {
  const root = document.getElementById("root");

  const cardsHTML = dummyMatches.map((match) => {
    const tagColor = match.sportsType === "축구" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                     match.sportsType === "농구" ? "bg-orange-500/10 text-orange-400 border border-orange-500/30" : 
                     "bg-amber-500/10 text-amber-400 border border-amber-500/30";

    const statusColor = match.status === "모집중" ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-500";
    const btnClass = match.status === "모집중" 
      ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
      : "bg-slate-800 text-slate-600 cursor-not-allowed";
    const btnText = match.status === "모집중" ? "신청하기" : "마감됨";
    const isDisabled = match.status === "마감" ? "disabled" : "";

    return `
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between backdrop-blur-md">
        <div>
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-black px-2.5 py-1 rounded-md ${tagColor}">${match.sportsType}</span>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColor}">${match.status}</span>
          </div>
          <h3 class="font-bold text-lg text-slate-100 leading-snug mb-3 hover:text-blue-400 transition">${match.title}</h3>
          <p class="text-slate-400 text-sm font-medium mb-1">📍 ${match.school}</p>
        </div>
        <div class="border-t border-slate-800/80 pt-4 mt-5 flex justify-between items-center">
          <span class="text-xs text-slate-500 font-medium">경기일: ${match.date}</span>
          <button ${isDisabled} class="text-xs font-extrabold px-4 py-2 rounded-xl transition duration-200 ${btnClass}">${btnText}</button>
        </div>
      </div>
    `;
  }).join("");

  let authButtonHTML = `<button onclick="openAuthModal('login')" class="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-500 transition text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">로그인</button>`;
  
  if (currentUser) {
    authButtonHTML = `
      <div class="flex items-center space-x-4">
        <span class="text-sm font-bold text-slate-300">👤 <span class="text-blue-400 font-extrabold">${currentUser.email.split('@')[0]}</span> 님</span>
        <button onclick="handleLogout()" class="border border-slate-700 text-slate-400 font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-800 hover:text-slate-200 transition text-xs">로그아웃</button>
      </div>
    `;
  }

  root.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <nav class="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-900 px-6 py-4 flex justify-between items-center backdrop-blur-md">
        <div class="flex items-center space-x-8">
          <span class="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight cursor-pointer drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
            🏆 학교 대항전
          </span>
          <div class="hidden md:flex space-x-6 font-semibold text-slate-400">
            <span class="hover:text-blue-400 cursor-pointer transition">팀 관리</span>
            <span class="text-blue-400 cursor-pointer border-b-2 border-blue-500 pb-1">매칭</span>
            <span class="hover:text-blue-400 cursor-pointer transition">대관 정보</span>
          </div>
        </div>
        ${authButtonHTML}
      </nav>

      <main class="max-w-5xl mx-auto px-6 py-12">
        <div class="mb-10 text-center md:text-left">
          <h1 class="text-4xl font-black tracking-tight mb-3 text-slate-50 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">실시간 매칭 현황</h1>
          <p class="text-slate-400 text-sm font-medium">우리 학교의 자존심을 걸고 다른 학교 스포츠 클럽과 한판 붙어보세요.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${cardsHTML}
        </div>
      </main>
    </div>
  `;
}

// 4. 모달 열기 함수 (모달이 열릴 때 전국 학교 데이터를 미리 땡겨옵니다)
function openAuthModal(screenType) {
  const authRoot = document.getElementById("auth-root");
  authRoot.classList.remove("hidden");
  renderAuthForm(screenType);
  
  if (screenType === "signup") {
    loadSchoolData(); // 💡 회원가입 창이 켜지면 실시간 API 호출 시작!
  }
}

function closeAuthModal() {
  const authRoot = document.getElementById("auth-root");
  authRoot.classList.add("hidden");
  authRoot.innerHTML = "";
}

// 5. 💡 [오픈 API 연동] 한국 고등학교 데이터 실시간 Fetch 함수
function loadSchoolData() {
  const selectBox = document.getElementById("school-select");
  selectBox.innerHTML = `<option value="">국가 학교 데이터 불러오는 중...</option>`;

  // 공공 학교 정보 오픈 API 주소 (고등학교 데이터)
  fetch("high_school.json")
    .then((res) => res.json())
    .then((data) => {
      // API 원본 데이터에서 학교 이름만 추출해서 전역 바구니에 보관
      allSchools = data.map(item => item.school_name);
      
      selectBox.innerHTML = `<option value="">학교 이름을 입력하여 검색하세요 (총 ${allSchools.length}개교)</option>`;
      document.getElementById("school-search-input").disabled = false; // 로딩 끝나면 검색창 활성화
    })
    .catch((err) => {
      console.error("API 로드 실패:", err);
      selectBox.innerHTML = `<option value="">데이터를 불러오지 못했습니다. (네트워크 확인)</option>`;
    });
}

// 6. 💡 [실시간 검색 필터 로직] 유저가 타이핑할 때마다 실행되는 함수
function filterSchools() {
  const keyword = document.getElementById("school-search-input").value.trim();
  const selectBox = document.getElementById("school-select");

  if (keyword.length < 2) {
    selectBox.innerHTML = `<option value="">최소 2글자 이상 입력해 주세요.</option>`;
    return;
  }

  // 전국 학교 중 유저가 입력한 글자가 포함된 학교만 필터링
  const filtered = allSchools.filter(name => name.includes(keyword));

  if (filtered.length === 0) {
    selectBox.innerHTML = `<option value="">'${keyword}' 검색 결과가 없습니다.</option>`;
  } else {
    // 필터링된 학교 목록을 select 박스에 동적으로 주입
    selectBox.innerHTML = `
      <option value="">검색 결과 (${filtered.length}건) - 학교를 선택하세요</option>
      ${filtered.map(name => `<option value="${name}" class="bg-slate-900">${name}</option>`).join("")}
    `;
  }
}

// 7. 다크모드가 적용된 모달 팝업 레이아웃
function renderAuthForm(type) {
  const authRoot = document.getElementById("auth-root");

  const modalWrapper = (content) => `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
      <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative animate-fadeIn text-slate-100">
        <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xl font-bold p-1 transition">✕</button>
        ${content}
      </div>
    </div>
  `;

  if (type === "login") {
    authRoot.innerHTML = modalWrapper(`
      <div class="text-center mb-8">
        <h2 class="text-2xl font-black text-blue-400 mb-2 drop-shadow-[0_0_10px_rgba(96,165,250,0.2)]">🏆 학교 대항전</h2>
        <p class="text-slate-400 text-sm">이메일과 비밀번호를 입력해 주세요.</p>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1.5">이메일 주소</label>
          <input type="email" id="login-email" placeholder="example@school.ac.kr" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1.5">비밀번호</label>
          <input type="password" id="login-pwd" placeholder="••••••••" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition">
        </div>
        <button onclick="handleLogin()" class="w-full bg-blue-600 text-white font-extrabold p-3 rounded-xl hover:bg-blue-500 transition text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">로그인</button>
        
        <div class="border-t border-slate-800/80 pt-4 text-center">
          <p class="text-xs text-slate-500">처음이신가요? 
            <span onclick="openAuthModal('signup')" class="text-blue-400 font-bold cursor-pointer hover:underline">학교 인증하고 회원가입하기</span>
          </p>
        </div>
      </div>
    `);
  }
  else if (type === "signup") {
    authRoot.innerHTML = modalWrapper(`
      <div class="text-center mb-6">
        <h2 class="text-xl font-black text-slate-100 mb-1">학교 메일 인증</h2>
        <p class="text-slate-400 text-xs">안전한 학교 대항전을 위해 소속 학교 인증이 필요합니다.</p>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1.5">학교 검색 (실시간 공공 API 연동)</label>
          <input type="text" id="school-search-input" disabled oninput="filterSchools()" placeholder="예: 숭실, 중앙, 배재 (입력 시 실시간 검색)" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500 transition mb-2">
          
          <select id="school-select" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition">
            <option value="" class="bg-slate-900">데이터를 로드하는 중...</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1.5">학교 이메일 주소</label>
          <div class="flex space-x-2">
            <input type="email" id="school-email" placeholder="student@school.ac.kr" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition">
            <button onclick="sendVerificationCode()" class="bg-slate-100 text-slate-950 font-black px-4 py-2 rounded-xl text-xs hover:bg-slate-200 transition whitespace-nowrap">인증 번호 발송</button>
          </div>
        </div>

        <div id="code-section" class="hidden">
          <label class="block text-xs font-bold text-emerald-400 mb-1.5">인증번호 4자리 입력 (힌트: 2026)</label>
          <div class="flex space-x-2">
            <input type="text" id="verify-code" placeholder="0000" maxlength="4" class="flex-1 bg-slate-950 border border-emerald-500/40 rounded-xl p-3 text-sm text-emerald-400 placeholder-emerald-800/50 focus:outline-none text-center font-bold tracking-widest">
            <button onclick="checkVerificationCode()" class="bg-emerald-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-emerald-500 transition">인증 확인</button>
          </div>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-slate-800/80 text-xs text-slate-500">
          <span onclick="renderAuthForm('login')" class="cursor-pointer text-blue-400 font-bold hover:underline">← 로그인으로 돌아가기</span>
        </div>
      </div>
    `);
  }
}

// 8. 로그인 처리 함수
function handleLogin() {
  const email = document.getElementById("login-email").value;
  const pwd = document.getElementById("login-pwd").value;

  if (!email || !pwd) {
    alert("이메일 주소와 비밀번호를 모두 입력해 주세요.");
    return;
  }

  currentUser = { email: email };
  alert(`🎉 다크 모드 스테이지 입장 완료! 환영합니다, ${email.split('@')[0]}님.`);
  closeAuthModal();
  renderHome();
}

// 9. 로그아웃 처리 함수
function handleLogout() {
  if (confirm("로그아웃 하시겠습니까?")) {
    currentUser = null;
    alert("로그아웃 되었습니다.");
    renderHome();
  }
}

// 10. 인증번호 발송 함수
function sendVerificationCode() {
  const email = document.getElementById("school-email").value;
  const school = document.getElementById("school-select").value;

  if (!school) {
    alert("학교 목록에서 소속 학교를 반드시 선택해 주세요!");
    return;
  }
  if (!email || !email.includes("@")) {
    alert("올바른 학교 이메일 규격을 입력해 주세요.");
    return;
  }

  alert(`[${school}]의 ${email}로 인증 코드를 발송했습니다! (가상 인증번호는 2026 입니다)`);
  document.getElementById("code-section").classList.remove("hidden");
}

// 11. 인증 확인 함수
function checkVerificationCode() {
  const code = document.getElementById("verify-code").value;

  if (code === "2026") {
    alert("🎉 학교 인증 및 회원가입이 성공했습니다! 가입하신 정보로 로그인을 진행해 주세요.");
    renderAuthForm('login');
  } else {
    alert("❌ 인증 번호가 다릅니다. 다시 확인해 주세요! (힌트: 2026)");
  }
}

window.onload = renderHome;