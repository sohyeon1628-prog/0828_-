/* =========================================================
   [JS 파일] main.js - 메인페이지(index.html) 인터랙션 제어
   ========================================================= */

// 1. 메인 배너 슬라이더 제어 스크립트
{
  const track = document.getElementById('sliderTrack');
  const counter = document.getElementById('slideCounter');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');

  let currentHeroIndex = 0;
  const totalHeroSlides = 4;
  let isHeroPlaying = true;
  let heroSliderInterval = null;

  function updateHeroSlider() {
    track.style.transform = `translateX(-${currentHeroIndex * 100}%)`;
    counter.innerText = `${currentHeroIndex + 1} / ${totalHeroSlides} +`;
  }

  function nextHeroSlide() {
    currentHeroIndex = (currentHeroIndex + 1) % totalHeroSlides;
    updateHeroSlider();
  }

  function prevHeroSlide() {
    currentHeroIndex = (currentHeroIndex - 1 + totalHeroSlides) % totalHeroSlides;
    updateHeroSlider();
  }

  function startHeroAutoSlide() {
    if (heroSliderInterval) clearInterval(heroSliderInterval);
    heroSliderInterval = setInterval(nextHeroSlide, 4000);
  }

  function stopHeroAutoSlide() {
    clearInterval(heroSliderInterval);
  }

  playPauseBtn.addEventListener('click', () => {
    if (isHeroPlaying) {
      stopHeroAutoSlide();
      playPauseBtn.className = 'fa-solid fa-play';
    } else {
      startHeroAutoSlide();
      playPauseBtn.className = 'fa-solid fa-pause';
    }
    isHeroPlaying = !isHeroPlaying;
  });

  prevBtn.addEventListener('click', () => {
    prevHeroSlide();
    if (isHeroPlaying) startHeroAutoSlide();
  });

  nextBtn.addEventListener('click', () => {
    nextHeroSlide();
    if (isHeroPlaying) startHeroAutoSlide();
  });

  updateHeroSlider();
  startHeroAutoSlide();
}


// 2. 랭킹 베스트셀러 슬라이더 연동 스크립트 (클릭 시 sub.html 이동)
{
  const KAKAO_REST_API_KEY = '9a318e0b10ce20c64ed53f01aa34e8c1';
  const BOOKS_PER_PAGE = 10;
  const MAX_PAGES = 3;
  const TOTAL_REQUIRED_BOOKS = BOOKS_PER_PAGE * MAX_PAGES;

  const track = document.getElementById('rankingSliderTrack');
  const dotsContainer = document.getElementById('rankingSliderDots');
  const pageText = document.getElementById('rankingPageText');
  const prevBtn = document.getElementById('rankPrevBtn');
  const nextBtn = document.getElementById('rankNextBtn');

  let currentRankingSlide = 0;
  let totalRankingPages = 3;

  async function fetchRankingBooks(keyword) {
    track.innerHTML = '<p style="color:#999; text-align:center; padding:50px 0; width:100%;">도서 랭킹을 불러오는 중입니다...</p>';
    dotsContainer.innerHTML = '';
    currentRankingSlide = 0;

    const url = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(keyword)}&page=1&size=50&sort=accuracy`;

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` }
      });

      if (!response.ok) throw new Error(`API 통신 에러: ${response.status}`);

      const data = await response.json();
      renderRankingSlider(data.documents);
    } catch (err) {
      console.error('랭킹 도서 로드 에러:', err);
      track.innerHTML = '<p style="color:#999; text-align:center; padding:50px 0; width:100%;">랭킹 도서를 불러오지 못했습니다.</p>';
    }
  }

  function renderRankingSlider(books) {
    if (!books || books.length === 0) {
      track.innerHTML = '<p style="color:#999; text-align:center; padding:50px 0; width:100%;">도서 결과가 없습니다.</p>';
      return;
    }

    const validBooks = books.filter(book => {
      const hasThumb = book.thumbnail && book.thumbnail.trim() !== '';
      const title = (book.title || '').trim();
      return hasThumb && title !== '베스트셀러' && title !== '베스트 셀러' && !title.startsWith('베스트셀러 (');
    });

    if (validBooks.length === 0) {
      track.innerHTML = '<p style="color:#999; text-align:center; padding:50px 0; width:100%;">조건에 맞는 도서가 없습니다.</p>';
      return;
    }

    const targetBooks = validBooks.slice(0, TOTAL_REQUIRED_BOOKS);
    totalRankingPages = Math.min(MAX_PAGES, Math.ceil(targetBooks.length / BOOKS_PER_PAGE));

    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalRankingPages; i++) {
      const pageBooks = targetBooks.slice(i * BOOKS_PER_PAGE, (i + 1) * BOOKS_PER_PAGE);
      const pageEl = document.createElement('div');
      pageEl.className = 'ranking-slide-page';

      pageBooks.forEach((book, index) => {
        const rank = i * BOOKS_PER_PAGE + (index + 1);
        const thumb = book.thumbnail;
        const title = book.title;
        const authors = (book.authors && book.authors.length > 0) ? book.authors.join(', ') : '저자 미상';
        const translators = (book.translators && book.translators.length > 0) ? ` / ${book.translators.join(', ')} 옮김` : '';
        const authorText = `${authors}${translators}`;
        const showBadge = (rank % 3 === 0);

        // 랭킹 카드 클릭 시 상세페이지(sub.html)로 이동
        const card = document.createElement('a');
        card.href = 'sub.html';
        card.className = 'ranking-card';
        card.innerHTML = `
          <div class="rank-number">${rank}</div>
          <div class="rank-thumb-box">
            <img src="${thumb}" alt="${title}" loading="lazy">
          </div>
          <div class="rank-info">
            <div class="rank-title" title="${title}">${title}</div>
            <div class="rank-author" title="${authorText}">${authorText}</div>
            ${showBadge ? '<span class="badge-tag">오디오북</span>' : ''}
          </div>
        `;
        pageEl.appendChild(card);
      });

      track.appendChild(pageEl);

      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToRankingSlide(i));
      dotsContainer.appendChild(dot);
    }

    updateRankingSliderPosition();
  }

  function updateRankingSliderPosition() {
    track.style.transform = `translateX(-${currentRankingSlide * 100}%)`;
    pageText.innerText = `${currentRankingSlide + 1} / ${totalRankingPages} 페이지`;

    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentRankingSlide);
    });
  }

  function goToRankingSlide(pageIndex) {
    currentRankingSlide = pageIndex;
    updateRankingSliderPosition();
  }

  prevBtn.addEventListener('click', () => {
    currentRankingSlide = (currentRankingSlide - 1 + totalRankingPages) % totalRankingPages;
    updateRankingSliderPosition();
  });

  nextBtn.addEventListener('click', () => {
    currentRankingSlide = (currentRankingSlide + 1) % totalRankingPages;
    updateRankingSliderPosition();
  });

  window.filterRanking = function(keyword, btnElement) {
    document.querySelectorAll('.ranking-section .cat-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    fetchRankingBooks(keyword);
  };

  window.addEventListener('DOMContentLoaded', () => {
    fetchRankingBooks('추천 도서');
  });
}


// 3. 신간 도서 영역 스크립트 (클릭 시 sub.html 이동)
{
  const KAKAO_REST_API_KEY = '9a318e0b10ce20c64ed53f01aa34e8c1';
  const focusCardWrap = document.getElementById('focusCardWrap');
  const focusThumb = document.getElementById('focusThumb');
  const focusTitle = document.getElementById('focusTitle');
  const focusAuthor = document.getElementById('focusAuthor');
  const focusComment = document.getElementById('focusComment');
  const subBookList = document.getElementById('subBookList');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  async function fetchNewBooks(keyword) {
    const url = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(keyword)}&size=8&sort=latest`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` }
      });

      if (!response.ok) throw new Error(`API 에러: ${response.status}`);
      
      const data = await response.json();
      renderNewBooks(data.documents);
    } catch (err) {
      console.error('신간 도서 로드 에러:', err);
      subBookList.innerHTML = '<p style="color:#999; padding:30px 0; grid-column:1/-1;">도서를 불러오지 못했습니다.</p>';
    }
  }

  function renderNewBooks(books) {
    if (!books || books.length === 0) {
      subBookList.innerHTML = '<p style="color:#999; padding:30px 0; grid-column:1/-1;">검색된 신간 도서가 없습니다.</p>';
      return;
    }

    const firstBook = books[0];
    const firstThumb = (firstBook.thumbnail && firstBook.thumbnail.trim()) ? firstBook.thumbnail : 'https://via.placeholder.com/200x290/f1f3f5/888888?text=No+Cover';
    
    focusCardWrap.href = 'sub.html';
    focusThumb.src = firstThumb;
    focusTitle.innerText = firstBook.title || '제목 정보 없음';
    focusTitle.title = firstBook.title || '';
    focusAuthor.innerText = (firstBook.authors && firstBook.authors.length) ? firstBook.authors.join(', ') : '저자 미상';
    
    if (firstBook.contents && firstBook.contents.trim() !== '') {
      focusComment.innerText = '줄거리 "' + firstBook.contents.slice(0, 42) + '..."';
    } else {
      focusComment.innerText = '새로 입고된 따끈따끈한 추천 신간입니다.';
    }

    subBookList.innerHTML = '';
    const remainingBooks = books.slice(1, 8);

    remainingBooks.forEach(book => {
      const thumb = (book.thumbnail && book.thumbnail.trim()) ? book.thumbnail : 'https://via.placeholder.com/200x290/f1f3f5/888888?text=No+Cover';
      const title = book.title || '제목 없음';
      const authors = (book.authors && book.authors.length > 0) ? book.authors.join(', ') : '저자 미상';
      const translators = (book.translators && book.translators.length > 0) ? ` / ${book.translators.join(', ')} 옮김` : '';
      const authorText = `${authors}${translators}`;

      const card = document.createElement('a');
      card.href = 'sub.html';
      card.className = 'sub-book-card';
      card.innerHTML = `
        <div class="sub-thumb-box">
          <img src="${thumb}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x290/f1f3f5/888888?text=No+Cover';">
          <span class="btn-add-plus"><i class="fa-solid fa-plus"></i></span>
        </div>
        <div class="sub-book-title" title="${title}">${title}</div>
        <div class="sub-book-author" title="${authorText}">${authorText}</div>
      `;
      subBookList.appendChild(card);
    });
  }

  function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
      fetchNewBooks(query);
      if (window.filterRanking) {
        window.filterRanking(query);
      }
    }
  }

  if(searchBtn && searchInput) {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  window.filterNewBooks = function(keyword, btnElement) {
    document.querySelectorAll('.new-books-section .cat-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    fetchNewBooks(keyword);
  };

  window.addEventListener('DOMContentLoaded', () => {
    fetchNewBooks('신간 도서');
  });
}


// 4. 출판사 추천 JS (클릭 시 sub.html 이동)
{
  const PUBLISHER_JSON_URL = './json/main1.json';
  const DEFAULT_THUMB = 'https://via.placeholder.com/200x290/f1f3f5/888888?text=No+Cover';

  async function loadPublisherBooks() {
    const grid = document.getElementById('publisherGrid');
    if(!grid) return;

    try {
      const response = await fetch(PUBLISHER_JSON_URL);
      if (!response.ok) throw new Error('JSON 로드 실패');

      const books = await response.json();
      grid.innerHTML = '';

      books.forEach(book => {
        const card = document.createElement('a');
        card.href = 'sub.html';
        card.className = 'publisher-card';
        card.innerHTML = `
          <div class="publisher-thumb-box">
            <img src="${book.image}" alt="${book.title}" loading="lazy" onerror="this.onerror=null; this.src='${DEFAULT_THUMB}';">
          </div>
          <div class="publisher-book-title" title="${book.title}">${book.title}</div>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<p style="color:#999; grid-column:1/-1; text-align:center; padding:40px 0;">도서 목록을 불러오지 못했습니다.</p>';
    }
  }

  window.addEventListener('DOMContentLoaded', loadPublisherBooks);
}


// 5. AI와 함께 읽는 나를 일으킬 책들 JS (카드 및 버튼 클릭 시 sub.html로 이동)
{
  const KAKAO_REST_API_KEY = '9a318e0b10ce20c64ed53f01aa34e8c1';
  const track = document.getElementById('aiCardTrack');

  const AI_CURATION_LIST = [
    { bookTitle: "사람은 생각하는 대로 된다", question: "성공을 위한<br>목표 설정 방법은?", theme: "theme-purple" },
    { bookTitle: "부의 흐름은 반복된다", question: "경기 흐름을<br>읽는 방법은 무엇인가요?", theme: "theme-pink" },
    { bookTitle: "페이스 코드", question: "거울 앞에서 자꾸<br>자존감이 떨어진다면?", theme: "theme-blue" },
    { bookTitle: "역행자", question: "돈과 시간에서 완전한<br>자유를 얻는 7단계는?", theme: "theme-teal" },
    { bookTitle: "원씽", question: "단 하나에 집중해<br>최고의 성과를 내는 법은?", theme: "theme-indigo" },
    { bookTitle: "돈의 심리학", question: "부자가 되기 위해<br>가장 먼저 버려야 할 것은?", theme: "theme-amber" },
    { bookTitle: "세이노의 가르침", question: "피보다 진하게 살아가는<br>인생의 지혜는 무엇일까?", theme: "theme-emerald" },
    { bookTitle: "도둑맞은 집중력", question: "스마트폰에 빼앗긴<br>집중력을 되찾는 방법은?", theme: "theme-rose" }
  ];

  async function loadAiCurationSection() {
    if(!track) return;
    track.innerHTML = '';

    for (const item of AI_CURATION_LIST) {
      try {
        const res = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(item.bookTitle)}&size=1&sort=accuracy`, {
          headers: { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.documents && data.documents.length > 0) {
            const doc = data.documents[0];
            if (!doc.thumbnail || doc.thumbnail.trim() === '') continue;

            // [수정] 카드 전체가 sub.html 링크(`<a>` 태그)로 감싸지도록 생성하여 어디를 눌러도 이동
            const card = document.createElement('a');
            card.href = 'sub.html';
            card.className = `ai-card ${item.theme}`;
            card.innerHTML = `
              <div class="ai-card-top">
                <span class="question-badge"><i class="fa-solid fa-sparkles"></i> 이 책의 질문</span>
                <div class="question-text">${item.question}</div>
              </div>
              <div class="ai-book-thumb">
                <img src="${doc.thumbnail}" alt="${doc.title}" loading="lazy" onerror="this.closest('.ai-card').remove();">
              </div>
              <span class="btn-ai-read">
                <i class="fa-solid fa-robot"></i> AI와 함께 읽기
              </span>
            `;
            track.appendChild(card);
          }
        }
      } catch (err) {
        console.error(`도서 로드 에러: ${item.bookTitle}`, err);
      }
    }
  }

  const scrollLeftBtn = document.getElementById('scrollLeftBtn');
  const scrollRightBtn = document.getElementById('scrollRightBtn');

  if(scrollLeftBtn && track) {
    scrollLeftBtn.addEventListener('click', () => {
      track.scrollBy({ left: -232 * 2, behavior: 'smooth' });
    });
  }
  if(scrollRightBtn && track) {
    scrollRightBtn.addEventListener('click', () => {
      track.scrollBy({ left: 232 * 2, behavior: 'smooth' });
    });
  }

  window.addEventListener('DOMContentLoaded', loadAiCurationSection);
}


// 6. 이벤트 배너 슬라이더 스크립트 (클릭 시 sub.html 이동)
{
  const EVENTS_JSON_URL = './json/main5.json';
  const DEFAULT_BANNER = 'https://via.placeholder.com/375x160/f1f3f5/888888?text=Event+Banner';

  const track = document.getElementById('eventSliderTrack');
  const dotsContainer = document.getElementById('eventSliderDots');
  const tabKyobo = document.getElementById('tabKyobo');
  const tabEbook = document.getElementById('tabEbook');

  let currentSlide = 0;
  const itemsPerPage = 3;
  let totalPages = 3;

  async function loadEventsData() {
    if(!track) return;
    try {
      const res = await fetch(EVENTS_JSON_URL);
      if (!res.ok) throw new Error('이벤트 JSON 로드 실패');
      
      const events = await res.json();
      renderEventPages(events);
    } catch (err) {
      console.error('이벤트 로드 에러:', err);
    }
  }

  function renderEventPages(events) {
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    currentSlide = 0;

    totalPages = Math.ceil(events.length / itemsPerPage);

    for (let i = 0; i < totalPages; i++) {
      const pageEvents = events.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
      const pageEl = document.createElement('div');
      pageEl.className = 'event-slide-page';

      pageEvents.forEach(item => {
        pageEl.innerHTML += `
          <a href="sub.html" class="event-banner-card">
            <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src='${DEFAULT_BANNER}';">
          </a>
        `;
      });
      track.appendChild(pageEl);

      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => window.goToSlide(i));
      dotsContainer.appendChild(dot);
    }

    updateSliderPosition();
  }

  function updateSliderPosition() {
    if(!track) return;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    const dots = document.querySelectorAll('.slider-dots .dot');
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === currentSlide);
    });

    if(tabKyobo && tabEbook) {
      if (currentSlide === 0) {
        tabKyobo.classList.add('active');
        tabEbook.classList.remove('active');
      } else {
        tabKyobo.classList.remove('active');
        tabEbook.classList.add('active');
      }
    }
  }

  window.goToSlide = function(pageIndex) {
    currentSlide = pageIndex;
    updateSliderPosition();
  };

  const eventPrevBtn = document.getElementById('eventPrevBtn');
  const eventNextBtn = document.getElementById('eventNextBtn');

  if(eventPrevBtn) {
    eventPrevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + totalPages) % totalPages;
      updateSliderPosition();
    });
  }
  if(eventNextBtn) {
    eventNextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % totalPages;
      updateSliderPosition();
    });
  }

  window.addEventListener('DOMContentLoaded', loadEventsData);
}


// 7. 푸터 공지사항 및 당첨자발표 연동 스크립트 (클릭 시 sub.html 이동)
{
  const FOOTER_JSON_URL = './json/footer.json';

  async function initFooterData() {
    try {
      const res = await fetch(FOOTER_JSON_URL);
      if (!res.ok) return;

      const data = await res.json();

      const noticeEl = document.getElementById('footerNoticeText');
      if (noticeEl && data.notice) {
        noticeEl.innerText = data.notice.title;
        noticeEl.href = 'sub.html';
      }

      const winnerEl = document.getElementById('footerWinnerText');
      if (winnerEl && data.winner) {
        winnerEl.innerText = data.winner.title;
        winnerEl.href = 'sub.html';
      }
    } catch (err) {
      console.log('푸터 기본 텍스트를 사용합니다.');
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    initFooterData();
  });
}