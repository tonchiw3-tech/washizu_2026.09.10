const TABIKA_STORAGE_KEY = 'tabikaPlans';

const initialPlans = [
  {
    id: 1,
    title: '雨の日の浅草ものづくりプラン',
    catchcopy: '雨でも歩きすぎず、室内で香りに集中できる',
    description: '上野から浅草へ移動し、浅草文化に触れたあとinimuで香りづくりを楽しむ雨天向けプランです。',
    durationMinutes: 180,
    startLocation: '上野',
    transferMinutes: 18,
    weatherType: '雨',
    scene: '雨天',
    modelCourse: '上野駅集合 → 浅草へ移動 → 屋内スポット散策 → inimuで香りづくり体験',
    workshopIncluded: true,
    reservationUrl: 'https://www.jalan.net/kankou/spt_guide000000223856/activity/l000051249/',
    published: true,
    image: './assets/rain.png'
  },
  {
    id: 2,
    title: '浅草王道観光と香りづくり',
    catchcopy: '初めての浅草を、香りの記憶まで持ち帰る',
    description: '浅草寺や仲見世通りを巡ったあと、旅の印象を香りとして形にする定番観光プランです。',
    durationMinutes: 240,
    startLocation: '浅草',
    transferMinutes: 8,
    weatherType: '晴れ',
    scene: '観光',
    modelCourse: '浅草駅 → 仲見世通り → 浅草寺 → 周辺散策 → inimuで香りづくり体験',
    workshopIncluded: true,
    reservationUrl: 'https://www.jalan.net/kankou/spt_guide000000223856/activity/l000051249/',
    published: true,
    image: './assets/asakusa.png'
  },
  {
    id: 3,
    title: 'イベント前の短時間リセット',
    catchcopy: '開演前の空き時間を、自分だけの香り時間に',
    description: '両国や浅草周辺でイベント前に時間がある人向け。短めの散策と香りづくりを組み合わせます。',
    durationMinutes: 120,
    startLocation: '両国',
    transferMinutes: 22,
    weatherType: '両方',
    scene: 'イベント',
    modelCourse: '両国駅 → 浅草へ移動 → 軽い散策 → inimuで香りづくり体験 → イベント会場へ',
    workshopIncluded: true,
    reservationUrl: 'https://www.jalan.net/kankou/spt_guide000000223856/activity/l000051249/',
    published: true,
    image: './assets/event.png'
  },
  {
    id: 4,
    title: '東京移動のすき間時間プラン',
    catchcopy: '移動の合間に浅草らしい体験をひとつ',
    description: '東京駅や羽田空港へ向かう前の空き時間に、短い浅草散策と香りづくりを楽しむプランです。',
    durationMinutes: 180,
    startLocation: '東京駅',
    transferMinutes: 25,
    weatherType: '両方',
    scene: '空き時間',
    modelCourse: '東京駅 → 浅草へ移動 → 雷門周辺散策 → inimuで香りづくり体験 → 次の目的地へ',
    workshopIncluded: true,
    reservationUrl: 'https://www.jalan.net/kankou/spt_guide000000223856/activity/l000051249/',
    published: true,
    image: './assets/transit.png'
  },
  {
    id: 5,
    title: '一人で味わう江戸散歩',
    catchcopy: '静かに歩いて、香りで旅を閉じる',
    description: '一人時間をゆっくり過ごしたい人に向けた、浅草の路地散歩と香りづくりのプランです。',
    durationMinutes: 180,
    startLocation: '浅草',
    transferMinutes: 6,
    weatherType: '晴れ',
    scene: '一人時間',
    modelCourse: '浅草駅 → 路地散歩 → カフェ休憩 → inimuで香りづくり体験',
    workshopIncluded: true,
    reservationUrl: 'https://www.jalan.net/kankou/spt_guide000000223856/activity/l000051249/',
    published: true,
    image: './assets/oldtown.png'
  },
  {
    id: 6,
    title: 'ものづくり文化に触れる半日',
    catchcopy: '手を動かす体験を中心に浅草を巡る',
    description: '工芸や香りづくりなど、ものづくりを旅の中心にしたい人向けの半日プランです。',
    durationMinutes: 240,
    startLocation: '浅草',
    transferMinutes: 10,
    weatherType: '両方',
    scene: 'ものづくり',
    modelCourse: '浅草駅 → ものづくりスポット見学 → 周辺散策 → inimuで香りづくり体験',
    workshopIncluded: true,
    reservationUrl: 'https://www.jalan.net/kankou/spt_guide000000223856/activity/l000051249/',
    published: true,
    image: './assets/workbench.png'
  }
];

const loadPlans = () => {
  try {
    const stored = localStorage.getItem(TABIKA_STORAGE_KEY);
    if (!stored) return initialPlans;
    const plans = JSON.parse(stored);
    return Array.isArray(plans) ? plans : initialPlans;
  } catch {
    return initialPlans;
  }
};

const savePlans = (plans) => {
  try {
    localStorage.setItem(TABIKA_STORAGE_KEY, JSON.stringify(plans));
  } catch {
    window.alert('ブラウザの保存領域を利用できません。設定を確認してください。');
  }
};

window.TabikaPlans = { loadPlans, savePlans, initialPlans };

(() => {
  const form = document.querySelector('#plan-search-form');
  const results = document.querySelector('#plan-results');
  if (!form || !results) return;

  const summary = document.querySelector('#result-summary');
  const emptyMessage = document.querySelector('#empty-message');
  const error = document.querySelector('#search-error');
  const detailSection = document.querySelector('#plan-detail');
  const detailContent = document.querySelector('#detail-content');
  const resetButton = document.querySelector('#reset-search');

  const matches = (plan, criteria) => {
    if (!plan.published) return false;
    if (criteria.scene && plan.scene !== criteria.scene) return false;
    if (criteria.location && plan.startLocation !== criteria.location) return false;
    if (criteria.weather && !(plan.weatherType === criteria.weather || plan.weatherType === '両方')) return false;
    if (criteria.duration && Number(plan.durationMinutes) > Number(criteria.duration)) return false;
    return true;
  };

  const renderResults = (plans, criteria = {}) => {
    const filtered = plans.filter((plan) => matches(plan, criteria));
    results.innerHTML = filtered.map((plan) => `
      <article class="result-card">
        <img src="${plan.image || './assets/aroma-illustration.png'}" alt="${plan.title}">
        <div>
          <p class="result-meta">${plan.scene} / ${plan.durationMinutes}分 / ${plan.startLocation}発</p>
          <h3>${plan.title}</h3>
          <p class="catchcopy">${plan.catchcopy || ''}</p>
          <p>${plan.description}</p>
          <dl class="mini-spec">
            <div><dt>天候</dt><dd>${plan.weatherType}</dd></div>
            <div><dt>体験</dt><dd>${plan.workshopIncluded ? '香りづくりあり' : 'なし'}</dd></div>
          </dl>
          <button class="app-button detail-button" type="button" data-plan-id="${plan.id}">詳しく見る</button>
        </div>
      </article>
    `).join('');
    summary.textContent = `${filtered.length}件のおすすめプランを表示しています。`;
    emptyMessage.hidden = filtered.length > 0;
  };

  const renderDetail = (plan) => {
    if (!plan) {
      detailContent.innerHTML = '<p class="empty-message">指定されたプランが見つかりません。</p>';
      detailSection.hidden = false;
      detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    detailContent.innerHTML = `
      <div class="detail-card">
        <img src="${plan.image || './assets/aroma-illustration.png'}" alt="${plan.title}">
        <div>
          <button class="text-button close-detail" type="button">一覧へ戻る</button>
          <p class="result-meta">${plan.scene} / ${plan.weatherType} / ${plan.startLocation}発</p>
          <h2 id="detail-title">${plan.title}</h2>
          <p class="catchcopy">${plan.catchcopy || ''}</p>
          <p>${plan.description}</p>
          <dl class="detail-spec">
            <div><dt>所要時間</dt><dd>${plan.durationMinutes}分</dd></div>
            <div><dt>移動時間</dt><dd>${plan.transferMinutes || 0}分</dd></div>
            <div><dt>モデルコース</dt><dd>${plan.modelCourse}</dd></div>
            <div><dt>inimuへのアクセス</dt><dd>浅草駅から徒歩圏内。体験前後の散策と組み合わせやすい立地です。</dd></div>
          </dl>
          <a class="app-button reserve-link" href="${plan.reservationUrl || 'https://www.jalan.net/kankou/spt_guide000000223856/activity/l000051249/'}" target="_blank" rel="noopener noreferrer">空き状況・予約を見る</a>
        </div>
      </div>
    `;
    detailSection.hidden = false;
    detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    error.textContent = '';
    const data = new FormData(form);
    const criteria = Object.fromEntries(data.entries());
    if (criteria.duration && Number(criteria.duration) <= 0) {
      error.textContent = '入力内容を確認してください。';
      return;
    }
    renderResults(loadPlans(), criteria);
    document.querySelector('#plans').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  results.addEventListener('click', (event) => {
    const button = event.target.closest('[data-plan-id]');
    if (!button) return;
    const plan = loadPlans().find((item) => String(item.id) === button.dataset.planId);
    renderDetail(plan);
  });

  detailSection.addEventListener('click', (event) => {
    if (!event.target.closest('.close-detail')) return;
    detailSection.hidden = true;
    document.querySelector('#plans').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  resetButton.addEventListener('click', () => {
    form.reset();
    renderResults(loadPlans());
    document.querySelector('#search').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  renderResults(loadPlans());
})();
