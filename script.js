const canvas = document.getElementById("game"); // id가 "game"인 캔버스 요소를 가져옵니다.
const ctx = canvas.getContext("2d"); // 캔버스에 2D 그림을 그릴 도구를 가져옵니다.

// 화면의 좌표와 크기를 바꾸고 싶을 때 아래 설정을 수정합니다.
const layout = {
  canvas: { width: 800, height: 600 },
  sky: { x: 0, y: 0, width: 800, height: 600 },
  ground: { x: 0, y: 450, width: 800, height: 150 },
  title: { text: "무한열차", x: 30, y: 55, font: "bold 34px sans-serif" },
  description: { text: "목적지 없이 계속 달려 보자!", x: 32, y: 84, font: "18px sans-serif" },
  lives: { text: "목숨  ♥  ♥  ♥", x: 610, y: 45, font: "bold 22px sans-serif" },
  controls: { text: "장애물은 화면 곳곳에 있어요", x: 505, y: 75, font: "16px sans-serif" },
  background: {
    horizonY: 380,
    ridgePoints: [0, 330, 95, 270, 180, 345, 290, 240, 405, 350, 520, 260, 650, 335, 735, 255, 800, 315],
    embers: Array.from({ length: 45 }, () => ({
      x: Math.random() * 800,
      y: 90 + Math.random() * 430,
      radius: 1 + Math.random() * 2.5,
      alpha: 0.25 + Math.random() * 0.65,
    })),
  },
  track: {
    horizonY: 438,
    topLeftX: 380,
    topRightX: 420,
    bottomLeftX: 250,
    bottomRightX: 550,
    sleeperYs: [455, 473, 495, 522, 555, 594],
    sleeperTopWidth: 3,
    sleeperBottomWidth: 9,
    railWidth: 5,
  },
  obstacle: { count: 8, minSize: 12, maxSize: 22, margin: 35, minY: 115, maxY: 420 },
  trainScale: 0.62,
  train: {
    boiler: { x: 350, y: 360, width: 100, height: 155 },
    boilerFront: { x: 400, y: 360, radiusX: 50, radiusY: 24 },
    cab: { x: 315, y: 475, width: 170, height: 82 },
    cabRoof: { x: 305, y: 465, width: 190, height: 24 },
    windows: [
      { x: 339, y: 491, width: 48, height: 36 },
      { x: 413, y: 491, width: 48, height: 36 },
    ],
    chimney: { x: 400, y: 340, radius: 18 },
    wheels: [
      { x: 320, y: 422, radius: 25 },
      { x: 480, y: 422, radius: 25 },
      { x: 320, y: 478, radius: 25 },
      { x: 480, y: 478, radius: 25 },
    ],
    wheelCenters: [
      { x: 320, y: 422, radius: 10 },
      { x: 480, y: 422, radius: 10 },
      { x: 320, y: 478, radius: 10 },
      { x: 480, y: 478, radius: 10 },
    ],
    bufferBeam: { x: 300, y: 552, width: 200, height: 18 },
    coupler: { x: 385, y: 570, width: 30, height: 18 },
  },
};

// 장애물이 화면 곳곳에 무작위로 놓이도록 시작 위치를 정합니다.
const randomBetween = (min, max) => min + Math.random() * (max - min); // 두 값 사이의 무작위 숫자를 돌려줍니다.
const obstacles = Array.from({ length: layout.obstacle.count }, () => { // 설정한 개수만큼 장애물을 준비합니다.
  const size = randomBetween(layout.obstacle.minSize, layout.obstacle.maxSize); // 장애물의 크기를 무작위로 정합니다.
  const y = randomBetween(layout.obstacle.minY, layout.obstacle.maxY); // 장애물의 세로 위치를 화면 곳곳에서 정합니다.
  let x = randomBetween(layout.obstacle.margin, layout.canvas.width - layout.obstacle.margin); // 장애물의 가로 위치를 화면 전체에서 정합니다.
  if (y > 350 && x > 335 && x < 465) { // 열차 바로 위에 장애물이 겹치지 않도록 확인합니다.
    x = x < 400 ? 300 : 500; // 열차 바깥쪽의 빈 공간으로 옮깁니다.
  }
  return {
    x, // 정한 가로 위치를 장애물에 저장합니다.
    y, // 정한 세로 위치를 장애물에 저장합니다.
    size, // 정한 크기를 장애물에 저장합니다.
  };
});

// 어두운 화산 하늘과 용암빛 산, 불씨가 있는 배경을 그립니다.
function drawBackground() {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, layout.background.horizonY); // 위쪽은 어둡고 지평선은 붉게 빛나는 그라데이션을 만듭니다.
  skyGradient.addColorStop(0, "#100d1c"); // 하늘 위쪽을 밤처럼 짙은 남보라색으로 설정합니다.
  skyGradient.addColorStop(0.58, "#351326"); // 하늘 가운데를 어두운 자주색으로 설정합니다.
  skyGradient.addColorStop(1, "#b63818"); // 지평선을 용암처럼 붉은 주황색으로 설정합니다.
  ctx.fillStyle = skyGradient; // 만든 하늘 그라데이션을 배경색으로 사용합니다.
  ctx.fillRect(layout.sky.x, layout.sky.y, layout.sky.width, layout.sky.height); // 화면 전체에 어두운 배경을 그립니다.

  const glow = ctx.createRadialGradient(400, layout.background.horizonY, 10, 400, layout.background.horizonY, 330); // 지평선의 용암빛 광채를 만듭니다.
  glow.addColorStop(0, "rgba(255, 102, 20, 0.55)"); // 광채 중심을 밝은 주황색으로 설정합니다.
  glow.addColorStop(1, "rgba(255, 50, 10, 0)"); // 가장자리는 투명하게 사라지게 합니다.
  ctx.fillStyle = glow; // 용암빛 광채를 배경에 올립니다.
  ctx.fillRect(0, 120, layout.canvas.width, 420); // 지평선 주변에 광채를 그립니다.

  ctx.fillStyle = "#1b1018"; // 멀리 있는 산의 색을 어둡게 지정합니다.
  ctx.beginPath(); // 화산 능선 모양을 그리기 시작합니다.
  ctx.moveTo(0, layout.background.ridgePoints[1]); // 왼쪽 산 능선의 시작점으로 이동합니다.
  for (let i = 2; i < layout.background.ridgePoints.length; i += 2) { // 설정된 점들을 연결해 산 능선을 만듭니다.
    ctx.lineTo(layout.background.ridgePoints[i], layout.background.ridgePoints[i + 1]); // 산의 다음 꼭짓점을 추가합니다.
  }
  ctx.lineTo(layout.canvas.width, layout.canvas.height); // 능선 아래를 화면 오른쪽 아래까지 잇습니다.
  ctx.lineTo(0, layout.canvas.height); // 산의 바닥을 화면 왼쪽 아래까지 잇습니다.
  ctx.closePath(); // 화산 능선 영역을 닫습니다.
  ctx.fill(); // 짙은 실루엣으로 화산 능선을 채웁니다.

  ctx.fillStyle = "#302027"; // 전경 바닥을 어두운 화산재 색으로 지정합니다.
  ctx.fillRect(layout.ground.x, layout.ground.y, layout.ground.width, layout.ground.height); // 화면 아래에 화산재 바닥을 그립니다.
  ctx.strokeStyle = "#ff5a18"; // 용암 균열의 색을 선명한 주황색으로 지정합니다.
  ctx.lineWidth = 4; // 용암 균열의 두께를 설정합니다.
  for (const [startX, startY, bendX, endX] of [[20, 570, 70, 125], [680, 590, 735, 780], [115, 465, 145, 190], [625, 470, 660, 710]]) { // 바닥 가장자리에 용암 균열을 몇 개 그립니다.
    ctx.beginPath(); // 용암 균열 선을 그리기 시작합니다.
    ctx.moveTo(startX, startY); // 균열의 시작점으로 이동합니다.
    ctx.lineTo(bendX, startY - 18); // 균열을 비스듬히 꺾습니다.
    ctx.lineTo(endX, startY + 8); // 균열을 다시 꺾어 갈라진 모양을 만듭니다.
    ctx.stroke(); // 빛나는 용암 균열을 그립니다.
  }

  for (const ember of layout.background.embers) { // 배경에 흩어진 작은 불씨를 하나씩 그립니다.
    ctx.fillStyle = `rgba(255, ${Math.round(90 + ember.alpha * 100)}, 35, ${ember.alpha})`; // 불씨마다 주황빛과 투명도를 다르게 설정합니다.
    ctx.beginPath(); // 작은 불씨 원을 그리기 시작합니다.
    ctx.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2); // 불씨 하나를 원으로 만듭니다.
    ctx.fill(); // 불씨를 빛나는 색으로 채웁니다.
  }
}

// 화면 위쪽에 게임 제목, 목숨, 조작 방법을 표시합니다.
function drawInformation() {
  ctx.fillStyle = "#fff1d2"; // 제목과 설명의 색을 밝은 크림색으로 지정합니다.
  ctx.font = layout.title.font; // 제목의 글꼴과 크기를 설정합니다.
  ctx.fillText(layout.title.text, layout.title.x, layout.title.y); // 설정한 위치에 게임 제목을 씁니다.
  ctx.font = layout.description.font; // 설명의 글꼴과 크기를 설정합니다.
  ctx.fillText(layout.description.text, layout.description.x, layout.description.y); // 제목 아래에 게임 설명을 씁니다.

  ctx.fillStyle = "#fff1d2"; // 목숨과 조작 안내의 색을 밝은 크림색으로 지정합니다.
  ctx.font = layout.lives.font; // 목숨 표시의 글꼴과 크기를 설정합니다.
  ctx.fillText(layout.lives.text, layout.lives.x, layout.lives.y); // 시작할 때 목숨이 3개임을 표시합니다.
  ctx.font = layout.controls.font; // 조작 안내의 글꼴과 크기를 설정합니다.
  ctx.fillText(layout.controls.text, layout.controls.x, layout.controls.y); // 방향키 조작 방법을 씁니다.
}

// 화면 아래쪽에 열차가 지나가는 느낌만 나도록 작고 은은한 선로를 그립니다.
function drawTrack() {
  const trackXAt = (topX, bottomX, y) => { // 선로가 높이에 따라 어디에 있는지 계산합니다.
    const progress = (y - layout.track.horizonY) / (layout.canvas.height - layout.track.horizonY); // 위쪽에서 아래쪽까지의 진행 비율을 구합니다.
    return topX + (bottomX - topX) * progress; // 선로의 현재 가로 위치를 계산합니다.
  };

  ctx.fillStyle = "#686868"; // 선로 바닥의 색을 회색으로 지정합니다.
  ctx.beginPath(); // 선로 바닥 영역을 그리기 시작합니다.
  ctx.moveTo(layout.track.topLeftX, layout.track.horizonY); // 선로 바닥의 위쪽 왼쪽 점으로 이동합니다.
  ctx.lineTo(layout.track.topRightX, layout.track.horizonY); // 선로 바닥의 위쪽 오른쪽 점을 추가합니다.
  ctx.lineTo(layout.track.bottomRightX, layout.canvas.height); // 선로 바닥의 아래쪽 오른쪽 점을 추가합니다.
  ctx.lineTo(layout.track.bottomLeftX, layout.canvas.height); // 선로 바닥의 아래쪽 왼쪽 점을 추가합니다.
  ctx.closePath(); // 선로 바닥의 모양을 닫습니다.
  ctx.fill(); // 작고 좁은 선로 바닥을 회색으로 채웁니다.

  ctx.fillStyle = "#514a43"; // 침목의 색을 어두운 갈색으로 지정합니다.
  for (const y of layout.track.sleeperYs) { // 침목을 위쪽부터 아래쪽까지 배치합니다.
    const progress = (y - layout.track.horizonY) / (layout.canvas.height - layout.track.horizonY); // 위치에 따른 원근 비율을 구합니다.
    const left = trackXAt(layout.track.topLeftX, layout.track.bottomLeftX, y); // 침목 왼쪽 끝의 위치를 계산합니다.
    const right = trackXAt(layout.track.topRightX, layout.track.bottomRightX, y); // 침목 오른쪽 끝의 위치를 계산합니다.
    const thickness = layout.track.sleeperTopWidth + (layout.track.sleeperBottomWidth - layout.track.sleeperTopWidth) * progress; // 아래쪽 침목일수록 두껍게 만듭니다.
    ctx.fillRect(left, y, right - left, thickness); // 원근에 맞춘 침목을 그립니다.
  }

  ctx.strokeStyle = "#c8c3b9"; // 레일의 색을 은은한 금속색으로 지정합니다.
  ctx.lineWidth = layout.track.railWidth; // 레일을 얇게 설정합니다.
  for (const [topX, bottomX] of [
    [layout.track.topLeftX + 7, layout.track.bottomLeftX + 35],
    [layout.track.topRightX - 7, layout.track.bottomRightX - 35],
  ]) { // 왼쪽 레일과 오른쪽 레일을 각각 그립니다.
    ctx.beginPath(); // 레일 선을 그리기 시작합니다.
    ctx.moveTo(topX, layout.track.horizonY); // 레일의 위쪽 끝으로 이동합니다.
    ctx.lineTo(bottomX, layout.canvas.height); // 레일을 아래쪽 끝까지 연장합니다.
    ctx.stroke(); // 얇은 레일을 그립니다.
  }
}

// 화면 곳곳에 고정된 장애물을 그립니다.
function drawObstacles() {
  for (const obstacle of obstacles) { // 무작위 위치에 놓인 장애물을 하나씩 그립니다.
    ctx.fillStyle = "#9f2d20"; // 장애물의 색을 어두운 붉은색으로 지정합니다.
    ctx.beginPath(); // 둥근 바위 모양을 그리기 시작합니다.
    ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2); // 장애물의 원 모양을 만듭니다.
    ctx.fill(); // 장애물을 붉은 갈색으로 채웁니다.
    ctx.fillStyle = "#ff9b42"; // 바위의 밝은 부분을 용암빛 주황색으로 지정합니다.
    ctx.beginPath(); // 바위 표면의 밝은 부분을 그리기 시작합니다.
    ctx.arc(obstacle.x - obstacle.size * 0.25, obstacle.y - obstacle.size * 0.25, obstacle.size * 0.3, 0, Math.PI * 2); // 바위 표면에 작은 빛 부분을 만듭니다.
    ctx.fill(); // 바위 표면의 빛 부분을 채웁니다.
  }
}

// 화면 아래 중앙에 앞쪽을 향한 기관차를 그립니다.
function drawTrain() {
  ctx.save(); // 열차에만 크기 조절을 적용하도록 현재 그리기 상태를 저장합니다.
  ctx.translate(400, 570); // 화면 아래 중앙을 크기 조절의 기준점으로 옮깁니다.
  ctx.scale(layout.trainScale, layout.trainScale); // 열차를 원래 크기의 62%로 줄입니다.
  ctx.translate(-400, -570); // 그리기 기준점을 원래 좌표로 되돌립니다.

  ctx.fillStyle = "#163b70"; // 기관차 보일러의 색을 짙은 파란색으로 지정합니다.
  ctx.fillRect(layout.train.boiler.x, layout.train.boiler.y, layout.train.boiler.width, layout.train.boiler.height); // 세로로 긴 보일러를 그립니다.
  ctx.beginPath(); // 보일러 앞쪽의 둥근 끝부분을 그리기 시작합니다.
  ctx.ellipse(
    layout.train.boilerFront.x,
    layout.train.boilerFront.y,
    layout.train.boilerFront.radiusX,
    layout.train.boilerFront.radiusY,
    0,
    0,
    Math.PI * 2,
  ); // 위쪽을 향한 보일러의 둥근 앞부분을 만듭니다.
  ctx.fill(); // 보일러 앞부분을 채웁니다.

  ctx.fillStyle = "#222"; // 굴뚝 안쪽과 바퀴의 색을 짙은 회색으로 지정합니다.
  ctx.beginPath(); // 보일러 앞쪽 굴뚝을 그리기 시작합니다.
  ctx.arc(layout.train.chimney.x, layout.train.chimney.y, layout.train.chimney.radius, 0, Math.PI * 2); // 둥근 굴뚝 입구를 만듭니다.
  ctx.fill(); // 굴뚝 입구를 채웁니다.
  for (const wheel of layout.train.wheels) { // 기관차 양옆의 구동 바퀴를 하나씩 그립니다.
    ctx.beginPath(); // 바퀴를 그리기 시작합니다.
    ctx.arc(wheel.x, wheel.y, wheel.radius, 0, Math.PI * 2); // 구동 바퀴 하나를 원으로 만듭니다.
    ctx.fill(); // 바퀴를 짙은 회색으로 채웁니다.
  }
  ctx.fillStyle = "#aaa"; // 바퀴 중심의 색을 밝은 회색으로 지정합니다.
  for (const center of layout.train.wheelCenters) { // 바퀴 중심 장식을 하나씩 그립니다.
    ctx.beginPath(); // 바퀴 중심 원을 그리기 시작합니다.
    ctx.arc(center.x, center.y, center.radius, 0, Math.PI * 2); // 바퀴 중심의 둥근 모양을 만듭니다.
    ctx.fill(); // 바퀴 중심을 밝은 회색으로 채웁니다.
  }

  ctx.fillStyle = "#24569a"; // 운전실의 색을 파란색으로 지정합니다.
  ctx.fillRect(layout.train.cab.x, layout.train.cab.y, layout.train.cab.width, layout.train.cab.height); // 기관차 뒤쪽 운전실을 그립니다.
  ctx.fillStyle = "#10294a"; // 운전실 지붕의 색을 더 어둡게 지정합니다.
  ctx.fillRect(layout.train.cabRoof.x, layout.train.cabRoof.y, layout.train.cabRoof.width, layout.train.cabRoof.height); // 운전실 위에 지붕을 그립니다.
  ctx.fillStyle = "#bfeeff"; // 운전실 창문의 색을 밝은 하늘색으로 지정합니다.
  for (const window of layout.train.windows) { // 운전실 창문을 하나씩 그립니다.
    ctx.fillRect(window.x, window.y, window.width, window.height); // 창문 하나를 그립니다.
  }

  ctx.fillStyle = "#aeb6bf"; // 열차 뒤쪽 완충기의 색을 금속색으로 지정합니다.
  ctx.fillRect(layout.train.bufferBeam.x, layout.train.bufferBeam.y, layout.train.bufferBeam.width, layout.train.bufferBeam.height); // 열차 뒤쪽 완충기를 그립니다.
  ctx.fillStyle = "#333"; // 연결기의 색을 짙은 회색으로 지정합니다.
  ctx.fillRect(layout.train.coupler.x, layout.train.coupler.y, layout.train.coupler.width, layout.train.coupler.height); // 열차 뒤쪽 중앙에 연결기를 그립니다.
  ctx.restore(); // 열차 크기 조절을 끝내고 원래 그리기 상태로 되돌립니다.
}

// 배경, 선로, 장애물, 열차를 순서대로 다시 그립니다.
function drawScene() {
  drawBackground(); // 하늘, 땅, 구름을 그립니다.
  drawTrack(); // 열차가 지나가는 느낌의 선로를 그립니다.
  drawObstacles(); // 화면 전체 너비에 흩어진 장애물을 그립니다.
  drawTrain(); // 화면 아래쪽의 기관차를 그립니다.
  drawInformation(); // 제목과 목숨, 조작 안내를 마지막에 표시합니다.
}

drawScene(); // 배경과 고정된 장애물, 열차를 한 번 그립니다.
