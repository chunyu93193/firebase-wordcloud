import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import { firebaseConfig } from '../firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const wordsRef = collection(db, 'wordcloud_words');
const recentWords = query(wordsRef, orderBy('createdAt', 'desc'), limit(500));

const form = document.querySelector('#word-form');
const input = document.querySelector('#word-input');
const submitButton = document.querySelector('#submit-button');
const formMessage = document.querySelector('#form-message');
const charCount = document.querySelector('#char-count');
const connectionLabel = document.querySelector('#connection-label');
const wordCloud = document.querySelector('#word-cloud');
const wordTotal = document.querySelector('#word-total');
const uniqueTotal = document.querySelector('#unique-total');

input.addEventListener('input', () => {
  charCount.textContent = String(input.value.length);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  submitButton.disabled = true;
  formMessage.textContent = '正在送出…';
  formMessage.classList.remove('error');
  try {
    await addDoc(wordsRef, { text, createdAt: serverTimestamp() });
    input.value = '';
    charCount.textContent = '0';
    formMessage.textContent = '收到你的詞了，謝謝分享！';
    input.focus();
  } catch (error) {
    console.error('Could not submit word:', error);
    formMessage.textContent = '送出失敗，請稍後再試。';
    formMessage.classList.add('error');
  } finally {
    submitButton.disabled = false;
  }
});

onSnapshot(recentWords, (snapshot) => {
  connectionLabel.textContent = '即時同步中';
  connectionLabel.classList.remove('offline');
  const grouped = new Map();
  for (const doc of snapshot.docs) {
    const text = String(doc.data().text ?? '').trim();
    if (!text) continue;
    const key = text.toLocaleLowerCase();
    const entry = grouped.get(key) ?? { label: text, count: 0 };
    entry.count += 1;
    grouped.set(key, entry);
  }
  renderCloud([...grouped.values()]);
  wordTotal.textContent = String(snapshot.size);
  uniqueTotal.textContent = String(grouped.size);
}, (error) => {
  console.error('Firestore listener failed:', error);
  connectionLabel.textContent = '連線尚未開放';
  connectionLabel.classList.add('offline');
  wordCloud.innerHTML = '<div class="empty-state"><span class="empty-icon">✳</span><p>文字雲即將展開</p><span>資料庫連線規則部署後，這裡會即時顯示大家的想法。</span></div>';
  wordTotal.textContent = '0';
  uniqueTotal.textContent = '0';
});

function renderCloud(words) {
  wordCloud.replaceChildren();
  if (words.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<span class="empty-icon">✳</span><p>這裡還是空白的</p><span>成為第一個分享想法的人吧。</span>';
    wordCloud.append(empty);
    return;
  }

  words.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-Hant'));
  const max = Math.max(...words.map((word) => word.count));
  const min = Math.min(...words.map((word) => word.count));
  const fragment = document.createDocumentFragment();

  words.forEach((word, index) => {
    const item = document.createElement('span');
    const size = max === min ? 1 : (word.count - min) / (max - min);
    item.className = `cloud-word hue-${index % 5}`;
    item.style.setProperty('--size', `${1.05 + size * 2.25}rem`);
    item.style.setProperty('--delay', `${Math.min(index * 25, 400)}ms`);
    item.title = `${word.label}：${word.count} 則`;
    item.setAttribute('aria-label', `${word.label}，${word.count} 則`);
    item.textContent = word.label;
    fragment.append(item);
  });
  wordCloud.append(fragment);
}
