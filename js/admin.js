(() => {
  const loginPanel = document.querySelector('#login-panel');
  const adminPanel = document.querySelector('#admin-panel');
  const editorPanel = document.querySelector('#editor-panel');
  const loginForm = document.querySelector('#login-form');
  if (!loginPanel || !adminPanel || !editorPanel || !loginForm) return;

  const logoutButton = document.querySelector('#logout-button');
  const loginError = document.querySelector('#login-error');
  const list = document.querySelector('#admin-plan-list');
  const message = document.querySelector('#admin-message');
  const editorForm = document.querySelector('#plan-editor-form');
  const editorTitle = document.querySelector('#editor-title');
  const editorError = document.querySelector('#editor-error');

  const setLoggedIn = (loggedIn) => {
    sessionStorage.setItem('tabikaAdminLoggedIn', String(loggedIn));
    loginPanel.hidden = loggedIn;
    adminPanel.hidden = !loggedIn;
    editorPanel.hidden = true;
    logoutButton.hidden = !loggedIn;
    if (loggedIn) renderTable();
  };

  const renderTable = () => {
    const plans = window.TabikaPlans.loadPlans();
    list.innerHTML = plans.map((plan) => `
      <tr>
        <td>${plan.id}</td>
        <td>${plan.title}</td>
        <td>${plan.durationMinutes}分</td>
        <td>${plan.startLocation}</td>
        <td>${plan.weatherType}</td>
        <td>${plan.published ? '公開' : '非公開'}</td>
        <td>
          <button type="button" class="text-button" data-edit="${plan.id}">編集</button>
          <button type="button" class="text-button danger" data-delete="${plan.id}">削除</button>
        </td>
      </tr>
    `).join('');
  };

  const openEditor = (plan = null) => {
    editorForm.reset();
    editorError.textContent = '';
    editorTitle.textContent = plan ? 'プラン編集' : 'プラン登録';
    editorForm.querySelector('button[type="submit"]').textContent = plan ? '更新する' : '登録する';
    if (plan) {
      Object.entries(plan).forEach(([key, value]) => {
        const field = editorForm.elements[key];
        if (!field) return;
        if (field.type === 'checkbox') field.checked = Boolean(value);
        else field.value = value;
      });
    } else {
      editorForm.elements.published.checked = true;
      editorForm.elements.reservationUrl.value = 'https://www.jalan.net/kankou/spt_guide000000223856/activity/l000051249/';
    }
    adminPanel.hidden = true;
    editorPanel.hidden = false;
    editorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = (plan) => {
    if (!plan.title || plan.title.length > 100) return 'プラン名は1〜100文字で入力してください。';
    if ((plan.catchcopy || '').length > 150) return 'キャッチコピーは150文字以内で入力してください。';
    if (!plan.description || plan.description.length > 2000) return '説明は必須、2000文字以内で入力してください。';
    if (!Number.isInteger(plan.durationMinutes) || plan.durationMinutes < 1) return '所要時間は1以上の数値で入力してください。';
    if (!Number.isInteger(plan.transferMinutes) || plan.transferMinutes < 0) return '移動時間は0以上の数値で入力してください。';
    try {
      new URL(plan.reservationUrl);
    } catch {
      return '予約URLはURL形式で入力してください。';
    }
    if (!plan.modelCourse || plan.modelCourse.length > 2000) return 'モデルコースは必須、2000文字以内で入力してください。';
    return '';
  };

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    if (data.get('loginId') === 'admin' && data.get('password') === 'tabika2026') {
      loginError.textContent = '';
      setLoggedIn(true);
      return;
    }
    loginError.textContent = 'ログインIDまたはパスワードが正しくありません。';
  });

  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('tabikaAdminLoggedIn');
    setLoggedIn(false);
  });

  document.querySelector('#new-plan-button').addEventListener('click', () => openEditor());
  document.querySelector('#cancel-editor').addEventListener('click', () => {
    editorPanel.hidden = true;
    adminPanel.hidden = false;
  });

  list.addEventListener('click', (event) => {
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;
    const plans = window.TabikaPlans.loadPlans();
    if (editId) {
      const plan = plans.find((item) => String(item.id) === editId);
      if (!plan) {
        message.textContent = '対象のプランが見つかりません。';
        return;
      }
      openEditor(plan);
    }
    if (deleteId) {
      const plan = plans.find((item) => String(item.id) === deleteId);
      if (!plan) {
        message.textContent = '対象のプランが見つかりません。';
        return;
      }
      const confirmed = window.confirm(`${plan.title}を削除しますか？`);
      if (!confirmed) return;
      window.TabikaPlans.savePlans(plans.filter((item) => String(item.id) !== deleteId));
      message.textContent = 'プランを削除しました。';
      renderTable();
    }
  });

  editorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(editorForm);
    const id = data.get('id') ? Number(data.get('id')) : null;
    const plans = window.TabikaPlans.loadPlans();
    const plan = {
      id: id || Math.max(0, ...plans.map((item) => Number(item.id))) + 1,
      title: data.get('title').trim(),
      catchcopy: data.get('catchcopy').trim(),
      description: data.get('description').trim(),
      durationMinutes: Number(data.get('durationMinutes')),
      startLocation: data.get('startLocation'),
      transferMinutes: Number(data.get('transferMinutes') || 0),
      weatherType: data.get('weatherType'),
      scene: data.get('scene'),
      modelCourse: data.get('modelCourse').trim(),
      workshopIncluded: true,
      reservationUrl: data.get('reservationUrl').trim(),
      published: editorForm.elements.published.checked,
      image: './assets/aroma-illustration.png'
    };
    const validationMessage = validate(plan);
    if (validationMessage) {
      editorError.textContent = validationMessage;
      return;
    }
    const nextPlans = id ? plans.map((item) => (item.id === id ? { ...item, ...plan, image: item.image || plan.image } : item)) : [...plans, plan];
    window.TabikaPlans.savePlans(nextPlans);
    message.textContent = id ? 'プランを更新しました。' : 'プランを登録しました。';
    editorPanel.hidden = true;
    adminPanel.hidden = false;
    renderTable();
  });

  setLoggedIn(sessionStorage.getItem('tabikaAdminLoggedIn') === 'true');
})();
