(() => {
  const calendar = document.querySelector('#calendar');
  const dateInput = document.querySelector('#reservation-date');
  const timeInput = document.querySelector('#reservation-time');
  const timeOptions = document.querySelector('#time-options');
  const form = document.querySelector('#reservation-form');
  const confirmation = document.querySelector('#confirmation');
  const availability = { 1: 'available', 2: 'available', 3: 'limited', 4: 'full', 5: 'available', 6: 'limited', 7: 'available', 8: 'available', 9: 'full', 10: 'available', 11: 'available', 12: 'limited', 13: 'available', 14: 'available', 15: 'full', 16: 'available', 17: 'limited', 18: 'available', 19: 'available', 20: 'available', 21: 'full', 22: 'available', 23: 'limited', 24: 'available', 25: 'available', 26: 'available', 27: 'full', 28: 'available', 29: 'limited', 30: 'available' };
  const timeStatus = { '10:00': 'available', '11:30': 'available', '13:00': 'limited', '14:30': 'full', '16:00': 'available' };

  calendar.insertAdjacentHTML('beforeend', '<div class="calendar-heading"><button type="button" aria-label="前の月" disabled>‹</button><strong>2026年 9月</strong><button type="button" aria-label="次の月" disabled>›</button></div><div class="calendar-weekdays"><span>日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span></div><div class="calendar-days"></div>');
  const days = calendar.querySelector('.calendar-days');
  for (let i = 0; i < 2; i += 1) days.insertAdjacentHTML('beforeend', '<span class="calendar-empty" aria-hidden="true"></span>');
  Object.entries(availability).forEach(([day, status]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = `calendar-day is-${status}`; button.dataset.date = `2026-09-${day.padStart(2, '0')}`;
    button.disabled = status === 'full'; button.innerHTML = `<strong>${day}</strong><small>${status === 'available' ? '○' : status === 'limited' ? '△' : '×'}</small>`;
    button.addEventListener('click', () => { document.querySelectorAll('.calendar-day.is-selected').forEach((el) => el.classList.remove('is-selected')); button.classList.add('is-selected'); dateInput.value = button.dataset.date; renderTimes(); clearError('reservation-date'); });
    days.append(button);
  });

  function renderTimes() { timeOptions.innerHTML = ''; Object.entries(timeStatus).forEach(([time, status]) => { const button = document.createElement('button'); button.type = 'button'; button.className = `time-button is-${status}`; button.textContent = `${time}${status === 'limited' ? ' △' : status === 'full' ? ' ×' : ''}`; button.disabled = status === 'full'; button.addEventListener('click', () => { document.querySelectorAll('.time-button.is-selected').forEach((el) => el.classList.remove('is-selected')); button.classList.add('is-selected'); timeInput.value = time; clearError('reservation-time'); }); timeOptions.append(button); }); }
  renderTimes();
  function clearError(id) { const error = document.querySelector(`[data-error-for="${id}"]`); if (error) error.textContent = ''; document.getElementById(id)?.removeAttribute('aria-invalid'); }
  function setError(id, message) { const field = document.getElementById(id); const error = document.querySelector(`[data-error-for="${id}"]`); if (field) field.setAttribute('aria-invalid', 'true'); if (error) error.textContent = message; }
  form.addEventListener('submit', (event) => { event.preventDefault(); ['reservation-date', 'reservation-time', 'participants', 'name', 'email', 'phone'].forEach(clearError); let valid = true; const required = [['reservation-date', '日付を選択してください。'], ['reservation-time', '時間を選択してください。'], ['participants', '参加人数を選択してください。'], ['name', 'お名前を入力してください。'], ['email', 'メールアドレスを入力してください。'], ['phone', '電話番号を入力してください。']]; required.forEach(([id, message]) => { if (!document.getElementById(id).value.trim()) { setError(id, message); valid = false; } }); const email = document.getElementById('email').value.trim(); const phone = document.getElementById('phone').value.trim(); if (email && !/^\S+@\S+\.\S+$/.test(email)) { setError('email', 'メールアドレスの形式を確認してください。'); valid = false; } if (phone && !/^[0-9０-９+\-()（）\s]+$/.test(phone)) { setError('phone', '電話番号の形式を確認してください。'); valid = false; } if (!valid) { document.querySelector('.field-error:not(:empty)')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; } const data = new FormData(form); const labels = [['予約日', data.get('reservation-date')], ['予約時間', data.get('reservation-time')], ['参加人数', `${data.get('participants')}名`], ['お名前', data.get('name')], ['メールアドレス', data.get('email')], ['電話番号', data.get('phone')], ['備考', data.get('note') || '（なし）']]; confirmation.hidden = false; confirmation.innerHTML = `<h3>入力内容をご確認ください</h3><dl>${labels.map(([label, value]) => `<div><dt>${label}</dt><dd>${String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))}</dd></div>`).join('')}</dl><button class="reservation-button demo-button" type="button">予約する</button><p class="demo-message" hidden>現在はデモ画面です。予約機能はバックエンド実装後に利用できます。</p>`; confirmation.querySelector('.demo-button').addEventListener('click', () => { confirmation.querySelector('.demo-message').hidden = false; }); confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
})();
