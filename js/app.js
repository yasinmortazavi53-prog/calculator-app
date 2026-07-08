// ماشین حساب - سیستم تم سه‌گانه
const THEMES = ['dark', 'light', 'neon'];
const THEME_LABELS = {
  dark: 'تاریک',
  light: 'روشن',
  neon: 'نئون'
};

const display = document.getElementById('display');
const expressionEl = document.getElementById('expression');
let currentTheme = localStorage.getItem('calc-theme') || 'dark';

// اعمال تم اولیه سریع (جلوگیری از فلش)
document.documentElement.setAttribute('data-theme', currentTheme);

// بعد از load
document.addEventListener('DOMContentLoaded', () => {
  setTheme(currentTheme, false);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme);
    });
  });

  // toggle سریع
  const quickToggle = document.getElementById('quickToggle');
  if (quickToggle) {
    quickToggle.addEventListener('click', cycleTheme);
  }

  // میانبر کیبورد: Ctrl+T / Cmd+T برای تغییر تم
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
      e.preventDefault();
      cycleTheme();
    }
  });
});

function setTheme(theme, animate = true) {
  if (!THEMES.includes(theme)) theme = 'dark';
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('calc-theme', theme);

  // update buttons
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === theme);
    b.setAttribute('aria-pressed', b.dataset.theme === theme ? 'true' : 'false');
  });

  // update label
  const labelEl = document.getElementById('currentThemeLabel');
  if (labelEl) {
    labelEl.textContent = THEME_LABELS[theme] || theme;
  }

  // quick toggle text
  const quickToggle = document.getElementById('quickToggle');
  if (quickToggle) {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    quickToggle.innerHTML = `تغییر تم → ${THEME_LABELS[next]}`;
  }

  if (animate) {
    // micro haptic / visual feedback
    document.body.style.transform = 'scale(0.999)';
    setTimeout(() => document.body.style.transform = '', 120);
  }
}

function cycleTheme() {
  const idx = THEMES.indexOf(currentTheme);
  const next = THEMES[(idx + 1) % THEMES.length];
  setTheme(next);
}

// ==== Calculator Logic ====
function appendToDisplay(value) {
  // جلوگیری از اپراتور دوبل
  const lastChar = display.value.slice(-1);
  const operators = ['+', '-', '*', '/', '.'];
  if (operators.includes(value) && operators.includes(lastChar)) {
    // اجازه - بعد از * / برای اعداد منفی
    if (!(value === '-' && ['*', '/'].includes(lastChar))) {
      display.value = display.value.slice(0, -1);
    }
  }
  display.value += value;
  updateExpression();
  // ویبره نرم روی موبایل
  if (navigator.vibrate) navigator.vibrate(8);
}

function clearDisplay() {
  display.value = '';
  if (expressionEl) expressionEl.textContent = '';
}

function deleteLast() {
  display.value = display.value.slice(0, -1);
  updateExpression();
}

function calculate() {
  try {
    let expression = display.value
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    if (!expression) return;

    // نمایش عبارت
    if (expressionEl) expressionEl.textContent = display.value + ' =';

    // محاسبه امن‌تر
    // فقط اعداد و عملگرهای مجاز
    if (!/^[0-9+\-*/.() %\s]+$/.test(expression)) {
      throw new Error('invalid');
    }

    const result = Function('"use strict"; return (' + expression + ')')();

    if (!isFinite(result)) throw new Error('math error');

    // نمایش نتیجه
    display.value = Number.isInteger(result)
      ? result.toString()
      : parseFloat(result.toFixed(8)).toString();

    // افکت موفقیت کوچک
    flashDisplay('success');

  } catch (error) {
    display.value = 'خطا';
    if (expressionEl) expressionEl.textContent = 'عبارت نامعتبر';
    flashDisplay('error');
    setTimeout(() => clearDisplay(), 1400);
  }
}

function updateExpression() {
  if (expressionEl && display.value) {
    expressionEl.textContent = display.value;
  } else if (expressionEl) {
    expressionEl.textContent = '\u00A0';
  }
}

function flashDisplay(type) {
  display.style.transition = 'none';
  if (type === 'error') {
    display.style.color = '#ff4d6d';
  } else {
    display.style.color = '#23c46e';
  }
  setTimeout(() => {
    display.style.transition = '';
    display.style.color = '';
  }, 350);
}

// کیبورد
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/[0-9+\-*/.%()]/.test(key)) {
    appendToDisplay(key);
    e.preventDefault();
  } else if (key === 'Enter' || key === '=') {
    calculate();
    e.preventDefault();
  } else if (key === 'Escape') {
    clearDisplay();
  } else if (key === 'Backspace') {
    deleteLast();
    // جلوگیری از برگشت صفحه
    e.preventDefault();
  } else if (key === '.') {
    appendToDisplay('.');
    e.preventDefault();
  }
});

// expose to global for inline onclick (سازگاری)
window.appendToDisplay = appendToDisplay;
window.clearDisplay = clearDisplay;
window.deleteLast = deleteLast;
window.calculate = calculate;
window.setTheme = setTheme;
window.cycleTheme = cycleTheme;

// ثبت تم سیستم اگر کاربر قبلا انتخاب نکرده
if (!localStorage.getItem('calc-theme')) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light', false);
}

console.log('%c🎨 ماشین حساب ۳ تمه – روشن / تاریک / نئون', 'font-size:14px; color:#764ba2; font-weight:bold');
console.log('میانبر: Ctrl+T برای تغییر تم');
