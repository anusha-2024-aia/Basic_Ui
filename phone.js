// js/phone.js

document.addEventListener("DOMContentLoaded", () => {

  const screens = document.querySelectorAll(".screen");
  const sideButtons = document.querySelectorAll(".side-nav");
  const bottomButtons = document.querySelectorAll(".nav-btn");

  function showScreen(name) {

    screens.forEach(screen => {
      screen.classList.remove("active");
    });

    const target = document.getElementById(`screen-${name}`);

    if (target) {
      target.classList.add("active");
    }

    sideButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.screen === name
      );
    });

    bottomButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.screen === name
      );
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  [...sideButtons, ...bottomButtons].forEach(button => {
    button.addEventListener("click", () => {
      showScreen(button.dataset.screen);
    });
  });

  document.querySelectorAll("[data-go]").forEach(card => {
    card.addEventListener("click", () => {
      showScreen(card.dataset.go);
    });
  });


  // LIVE CLOCK

  const clock = document.getElementById("clock");

  function updateClock() {

    if (!clock) return;

    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const suffix = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    clock.textContent =
      `${String(hours).padStart(2, "0")}:${minutes} ${suffix}`;
  }

  updateClock();
  setInterval(updateClock, 1000);


  // TIME BASED SAFETY SCORE

  const slider = document.getElementById("timeSlider");
  const selectedTime = document.getElementById("selectedTime");
  const mapScore = document.getElementById("mapScore");
  const mapScoreLabel = document.getElementById("mapScoreLabel");
  const mapInsightTitle = document.getElementById("mapInsightTitle");
  const mapInsightText = document.getElementById("mapInsightText");

  const homeScore = document.getElementById("homeScore");
  const homeScoreBar = document.getElementById("homeScoreBar");
  const homeScoreText = document.getElementById("homeScoreText");

  function calculateSafety(value) {

    let hour;

    if (value <= 20) {
      hour = 18;
    } else if (value <= 40) {
      hour = 19;
    } else if (value <= 60) {
      hour = 20;
    } else if (value <= 80) {
      hour = 21;
    } else {
      hour = 22;
    }

    const score = Math.round(
      91 - (value * .62)
    );

    let label = "Relatively safer";
    let colour = "var(--green)";
    let title = "Area is relatively active";
    let text = "Current activity makes this route comparatively safer.";

    if (score < 75 && score >= 55) {
      label = "Caution";
      colour = "var(--yellow)";
      title = "Risk is increasing";
      text = "Activity is decreasing as evening progresses.";
    }

    if (score < 55) {
      label = "Higher risk";
      colour = "var(--red)";
      title = "Higher risk after dark";
      text = "This route has less activity and more caution indicators.";
    }

    const time = `${hour}:00 PM`;

    if (selectedTime) {
      selectedTime.textContent = time;
    }

    if (mapScore) {
      mapScore.textContent = score;
      mapScore.style.color = colour;
    }

    if (mapScoreLabel) {
      mapScoreLabel.textContent = label;
      mapScoreLabel.style.color = colour;
    }

    if (mapInsightTitle) {
      mapInsightTitle.textContent = title;
    }

    if (mapInsightText) {
      mapInsightText.textContent = text;
    }

    if (homeScore) {
      homeScore.textContent = score;
      homeScore.style.color = colour;
    }

    if (homeScoreBar) {
      homeScoreBar.style.width = `${score}%`;
      homeScoreBar.style.background = colour;
    }

    if (homeScoreText) {
      homeScoreText.textContent = `${label} around current route`;
    }
  }

  if (slider) {
    slider.addEventListener("input", event => {
      calculateSafety(Number(event.target.value));
    });

    calculateSafety(Number(slider.value));
  }


  // ROUTE SELECTION

  const routeCards = document.querySelectorAll(".route-card");
  const routeToast = document.getElementById("routeToast");

  routeCards.forEach(card => {

    card.addEventListener("click", () => {

      routeCards.forEach(item => {
        item.classList.remove("active-route");
      });

      card.classList.add("active-route");

      if (routeToast) {
        routeToast.textContent =
          `${card.querySelector("h3").textContent} selected`;

        routeToast.classList.add("show");

        setTimeout(() => {
          routeToast.classList.remove("show");
        }, 1800);
      }
    });

  });


  const routeStart = document.querySelector(".route-start");

  if (routeStart) {
    routeStart.addEventListener("click", () => {

      if (routeToast) {
        routeToast.textContent =
          "Safer route started";

        routeToast.classList.add("show");

        setTimeout(() => {
          routeToast.classList.remove("show");
        }, 2200);
      }
    });
  }


  // BUDDY MATCH

  const buddyConnect = document.querySelector(".buddy-connect");
  const buddyToast = document.getElementById("buddyToast");

  if (buddyConnect) {

    buddyConnect.addEventListener("click", () => {

      buddyConnect.textContent = "Connected ✓";

      if (buddyToast) {
        buddyToast.textContent =
          "Buddy connection confirmed";

        buddyToast.classList.add("show");

        setTimeout(() => {
          buddyToast.classList.remove("show");
        }, 2200);
      }
    });

  }


  // REPORT CHIPS

  const reportChips = document.querySelectorAll(".report-chip");

  reportChips.forEach(chip => {

    chip.addEventListener("click", () => {

      chip.classList.toggle("selected");

    });

  });


  // REPORT SUBMIT

  const reportSubmit = document.querySelector(".report-submit");
  const reportToast = document.getElementById("reportToast");

  if (reportSubmit) {

    reportSubmit.addEventListener("click", () => {

      const selected =
        document.querySelectorAll(".report-chip.selected");

      if (selected.length === 0) {

        if (reportToast) {
          reportToast.textContent =
            "Select an issue before submitting";

          reportToast.classList.add("show");

          setTimeout(() => {
            reportToast.classList.remove("show");
          }, 2000);
        }

        return;
      }

      if (reportToast) {

        reportToast.textContent =
          "Anonymous report submitted";

        reportToast.classList.add("show");

        setTimeout(() => {
          reportToast.classList.remove("show");
        }, 2200);

      }

    });

  }


  // SAFE STOP

  const safeButtons = document.querySelectorAll("[data-safe]");
  const safeToast = document.getElementById("safeToast");

  safeButtons.forEach(button => {

    button.addEventListener("click", () => {

      const place = button.dataset.safe;

      if (safeToast) {

        safeToast.textContent =
          `Route started to ${place}`;

        safeToast.classList.add("show");

        setTimeout(() => {
          safeToast.classList.remove("show");
        }, 2400);

      }

    });

  });


  // SOS HOLD INTERACTION

  const sosButton = document.getElementById("sosButton");
  const sosConfirm = document.getElementById("sosConfirm");
  const cancelSos = document.getElementById("cancelSos");

  let sosTimer = null;
  let sosTriggered = false;

  function startSosHold() {

    if (!sosButton || sosTriggered) return;

    sosButton.classList.add("holding");

    sosTimer = setTimeout(() => {

      sosTriggered = true;

      sosButton.classList.remove("holding");

      if (sosConfirm) {
        sosConfirm.classList.add("show");
      }

    }, 2000);

  }

  function cancelSosHold() {

    if (sosTimer) {
      clearTimeout(sosTimer);
      sosTimer = null;
    }

    if (!sosTriggered && sosButton) {
      sosButton.classList.remove("holding");
    }

  }

  if (sosButton) {

    sosButton.addEventListener(
      "mousedown",
      startSosHold
    );

    sosButton.addEventListener(
      "mouseup",
      cancelSosHold
    );

    sosButton.addEventListener(
      "mouseleave",
      cancelSosHold
    );

    sosButton.addEventListener(
      "touchstart",
      startSosHold,
      { passive: true }
    );

    sosButton.addEventListener(
      "touchend",
      cancelSosHold
    );

  }

  if (cancelSos) {

    cancelSos.addEventListener("click", () => {

      sosTriggered = false;

      if (sosConfirm) {
        sosConfirm.classList.remove("show");
      }

    });

  }


  // REACH-SAFE TIMER VISUAL

  let remaining = 32 * 60;

  const timerElement = document.querySelector(
    ".journey-strip strong"
  );

  setInterval(() => {

    if (!timerElement) return;

    if (remaining <= 0) {
      timerElement.textContent = "00:00";
      return;
    }

    remaining--;

    const minutes =
      String(Math.floor(remaining / 60)).padStart(2, "0");

    const seconds =
      String(remaining % 60).padStart(2, "0");

    timerElement.textContent =
      `${minutes}:${seconds}`;

  }, 1000);


  // KEYBOARD SHORTCUTS

  document.addEventListener("keydown", event => {

    const shortcuts = {
      "1": "home",
      "2": "map",
      "3": "route",
      "4": "buddy",
      "5": "report",
      "6": "civic",
      "7": "safe",
      "8": "sos"
    };

    if (shortcuts[event.key]) {
      showScreen(shortcuts[event.key]);
    }

  });

});