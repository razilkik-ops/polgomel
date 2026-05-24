const form = document.getElementById('calcForm');
const areaEl = document.getElementById('area');
const thicknessEl = document.getElementById('thickness');
const objectTypeEl = document.getElementById('objectType');
const locationEl = document.getElementById('location');
const floorEl = document.getElementById('floor');
const warmFloorEl = document.getElementById('warmFloor');
const preparationEl = document.getElementById('preparation');
const estimateEl = document.getElementById('estimate');
const rateEl = document.getElementById('rate');
const calcNoteEl = document.getElementById('calcNote');
const videoButton = document.getElementById('videoButton');
const videoModal = document.getElementById('videoModal');
const workVideo = document.getElementById('workVideo');
const videoCloseButtons = document.querySelectorAll('[data-video-close]');

const WORK_PROCESS_VIDEO_SRC = '/work-process.mp4';

function formatByn(value) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' BYN';
}

function calculate() {
  const area = Math.max(10, Number(areaEl.value) || 0);
  const thickness = Number(thicknessEl.value);
  const floor = Number(floorEl.value);
  const warmFloor = warmFloorEl.checked;
  const preparation = preparationEl.checked;
  const objectType = objectTypeEl.value;
  const location = locationEl.value.trim();

  if (objectType === 'roof') {
    estimateEl.textContent = 'Расчет после уточнения';
    rateEl.textContent = 'основание, уклоны, расстояние';
    calcNoteEl.textContent = 'Для крыши расчет производится после уточнения основания, уклонов и расстояния от Гомеля.';
    return;
  }

  if (objectType === 'garage') {
    if (area > 30) {
      estimateEl.textContent = 'Индивидуальное уточнение';
      rateEl.textContent = 'площадь больше 30 м²';
      calcNoteEl.textContent = 'Для гаража площадью больше 30 м² стоимость уточняется индивидуально. Расстояние от Гомеля также может повлиять на финальную цену.';
      return;
    }

    estimateEl.textContent = '850 BYN';
    rateEl.textContent = 'фиксированная стоимость';
    calcNoteEl.textContent = 'Обычно 18–20 м². Работа и материалы включены. Стоимость может корректироваться по расстоянию после уточнения адреса.';
    return;
  }

  let baseRate = objectType === 'house' ? 14 : 38;

  if (area >= 120) baseRate -= 3;
  else if (area >= 80) baseRate -= 2;
  else if (area >= 50) baseRate -= 1;

  if (thickness <= 40) baseRate -= 2;
  if (thickness >= 80) baseRate += 3;
  if (thickness >= 100) baseRate += 2;

  if (floor === 2) baseRate += 1;
  if (floor === 3) baseRate += 2;

  if (warmFloor) baseRate += 2;
  if (preparation) baseRate += 5;

  baseRate = Math.max(objectType === 'house' ? 14 : 30, baseRate);

  const total = Math.max(baseRate * area, area < 30 ? 850 : 0);
  const distanceText = location ? ` Объект: ${location}.` : '';

  rateEl.textContent = `${baseRate} BYN/м²`;
  estimateEl.textContent = formatByn(total);
  calcNoteEl.textContent = `Стоимость может корректироваться по расстоянию после уточнения адреса.${distanceText}`;
}

form.addEventListener('input', calculate);
calculate();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

function openVideoModal() {
  if (!WORK_PROCESS_VIDEO_SRC || !workVideo) return;

  workVideo.src = WORK_PROCESS_VIDEO_SRC;
  videoModal.hidden = false;
  document.body.classList.add('modal-open');
  workVideo.play().catch(() => {});
}

function closeVideoModal() {
  if (!workVideo) return;

  workVideo.pause();
  workVideo.removeAttribute('src');
  workVideo.load();
  videoModal.hidden = true;
  document.body.classList.remove('modal-open');
}

async function prepareVideoButton() {
  if (!WORK_PROCESS_VIDEO_SRC || !videoButton || !videoModal || !workVideo) return;

  try {
    const response = await fetch(WORK_PROCESS_VIDEO_SRC, { method: 'HEAD' });
    if (!response.ok) return;
  } catch (error) {
    return;
  }

  videoButton.hidden = false;
  videoButton.addEventListener('click', openVideoModal);
}

videoCloseButtons.forEach((button) => button.addEventListener('click', closeVideoModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !videoModal.hidden) {
    closeVideoModal();
  }
});
prepareVideoButton();
