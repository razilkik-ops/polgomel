const form = document.getElementById('calcForm');
const areaEl = document.getElementById('area');
const thicknessEl = document.getElementById('thickness');
const objectTypeEl = document.getElementById('objectType');
const floorEl = document.getElementById('floor');
const warmFloorEl = document.getElementById('warmFloor');
const demolitionEl = document.getElementById('demolition');
const estimateEl = document.getElementById('estimate');
const rateEl = document.getElementById('rate');

function formatByn(value) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' BYN';
}

function calculate() {
  const area = Math.max(10, Number(areaEl.value) || 0);
  const thickness = Number(thicknessEl.value);
  const floor = Number(floorEl.value);
  const warmFloor = warmFloorEl.checked;
  const demolition = demolitionEl.checked;
  const objectType = objectTypeEl.value;

  let baseRate = 31;

  if (area >= 120) baseRate -= 4;
  else if (area >= 80) baseRate -= 3;
  else if (area >= 50) baseRate -= 2;

  if (objectType === 'house') baseRate -= 2;
  if (objectType === 'commercial') baseRate -= 3;
  if (objectType === 'garage') baseRate += 1;

  if (thickness >= 70) baseRate += 3;
  if (thickness >= 80) baseRate += 2;

  if (floor === 2) baseRate += 1;
  if (floor === 3) baseRate += 2;

  if (warmFloor) baseRate += 2;
  if (demolition) baseRate += 5;

  baseRate = Math.max(22, baseRate);

  const total = baseRate * area;

  rateEl.textContent = `${baseRate} BYN/м²`;
  estimateEl.textContent = formatByn(total);
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
