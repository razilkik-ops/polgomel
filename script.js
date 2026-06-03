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
const resultTitleEl = document.getElementById('resultTitle');
const resultListEl = document.getElementById('resultList');
const videoButton = document.getElementById('videoButton');
const videoModal = document.getElementById('videoModal');
const workVideo = document.getElementById('workVideo');
const videoCloseButtons = document.querySelectorAll('[data-video-close]');

const WORK_PROCESS_VIDEO_SRC = '/work-process.mp4';
const MATERIALS_INCLUDED_ITEMS = [
  'пленка полиэтиленовая',
  'демпферная лента',
  'фиброволокно',
  'цемент М500 Д0',
  'речной просеянный песок',
  'работы по подаче раствора и его укладке',
  'финишная шлифовка стяжки пола',
];
const WORK_ONLY_ITEMS = [
  'работы по подаче раствора и его укладке',
  'выставление маяков по лазерному уровню',
  'финишная шлифовка стяжки пола',
  'рекомендации по уходу за стяжкой',
];

function formatByn(value) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' BYN';
}

function renderResultList(title, items) {
  resultTitleEl.textContent = title;
  resultListEl.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function getHouseRate(area) {
  if (area >= 100) return 14;
  if (area >= 80) return 15;
  if (area >= 50) return 16;
  return 17;
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
    renderResultList('После уточнения рассчитываются:', [
      'состояние основания',
      'уклоны и толщина слоя',
      'доставка материалов',
      'расстояние от Гомеля',
    ]);
    return;
  }

  if (objectType === 'garage') {
    renderResultList('В стоимость входят:', MATERIALS_INCLUDED_ITEMS);

    if (area <= 20) {
      estimateEl.textContent = '850 BYN';
      rateEl.textContent = 'фиксированная стоимость';
      calcNoteEl.textContent = 'Фиксированная стоимость действует для гаража до 20 м². Работа и материалы включены. Стоимость может корректироваться по расстоянию после уточнения адреса.';
      return;
    }
  }

  let baseRate = objectType === 'house' ? getHouseRate(area) : 38;

  if (objectType !== 'house') {
    if (area >= 120) baseRate -= 3;
    else if (area >= 80) baseRate -= 2;
    else if (area >= 50) baseRate -= 1;
  }

  if (thickness <= 40 && objectType !== 'house') baseRate -= 2;
  if (thickness >= 80) baseRate += 3;
  if (thickness >= 100) baseRate += 2;

  if (objectType === 'flat') {
    if (floor === 2) baseRate += 1;
    if (floor === 3) baseRate += 2;
  }

  if (warmFloor) baseRate += 2;
  if (preparation) baseRate += 5;

  baseRate = Math.max(objectType === 'house' ? 14 : 30, baseRate);

  const total = objectType === 'house' && area < 30 ? 850 : baseRate * area;
  const distanceText = location ? ` Объект: ${location}.` : '';

  rateEl.textContent = `${baseRate} BYN/м²`;
  estimateEl.textContent = formatByn(total);

  if (objectType === 'house') {
    if (area < 30) {
      rateEl.textContent = 'минимальная стоимость';
    }

    renderResultList('В стоимость работы входят:', WORK_ONLY_ITEMS);
    calcNoteEl.textContent = `Для частного дома цена за м² указана за работу без учета материалов. Материалы рассчитываются отдельно после уточнения площади, толщины слоя и адреса.${distanceText}`;
    return;
  }

  renderResultList('В стоимость входят:', MATERIALS_INCLUDED_ITEMS);
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
