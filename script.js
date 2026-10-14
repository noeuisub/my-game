"use strict";

const gameButtons = document.querySelectorAll(".game-button");
const selectionMessage = document.querySelector(".selection-message");
const todayDate = document.querySelector("#today-date");

todayDate.textContent = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
}).format(new Date());

gameButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    gameButtons.forEach((gameButton) => {
      gameButton.setAttribute("aria-pressed", String(gameButton === button));
    });

    selectionMessage.textContent = `선택한 게임: ${button.textContent}`;
  });
});
