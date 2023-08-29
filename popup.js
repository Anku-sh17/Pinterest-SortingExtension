const sortByRepinsRadio = document.getElementById("sortByRepins");
const sortBySavesRadio = document.getElementById("sortBySaves");

sortByRepinsRadio.addEventListener("change", fetchAndDisplayPins);
sortBySavesRadio.addEventListener("change", fetchAndDisplayPins);

fetchAndDisplayPins();

function fetchAndDisplayPins() {
  chrome.tabs.query(
    { currentWindow: true, active: true },
    async function (tabs) {
      const selectedRadio = document.querySelector(
        'input[name="sort"]:checked'
      );
      let sortBy;

      if (selectedRadio) {
        sortBy = selectedRadio.value;
      } else {
        sortBy = "random"; // Default to random sorting
      }

      const url = new URL(tabs[0].url);
      const pathParts = url.pathname.split("/");
      const name = pathParts[1];
      const board = pathParts[2];

      const apiUrl = `https://api.pinterest.com/v3/pidgets/boards/${name}/${board}/pins/`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      let sortedPins = [...data.data.pins];

      if (sortBy === "saves") {
        sortedPins.sort((a, b) => {
          const savesA = a.aggregated_pin_data.aggregated_stats.saves;
          const savesB = b.aggregated_pin_data.aggregated_stats.saves;
          return savesB - savesA; // Sort by likes in aescending order
        });
      } else if (sortBy === "repins") {
        sortedPins.sort((a, b) => b.repin_count - a.repin_count); // Sort by repins in aescending order
      } else if (sortBy === "random") {
        // Shuffle the array randomly
        for (let i = sortedPins.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sortedPins[i], sortedPins[j]] = [sortedPins[j], sortedPins[i]];
        }
      }

      const pinsContainer = document.getElementById("pinsContainer");
      pinsContainer.innerHTML = ""; // Clear previous results

      sortedPins.forEach((pin) => {
        const pinWrapper = document.createElement("div"); // Wrapper for each pin
        pinWrapper.classList.add("pin-wrapper"); // Add a class for styling

        const img = document.createElement("img");
        img.src = pin.images["237x"].url;
        pinWrapper.appendChild(img);

        const statsWrapper = document.createElement("div"); // Wrapper for stats
        statsWrapper.classList.add("stats-wrapper"); // Add a class for styling

        const repinCount = document.createElement("p");
        repinCount.textContent = `Repins: ${pin.repin_count}`;
        statsWrapper.appendChild(repinCount);

        const aggregatedStats = pin.aggregated_pin_data.aggregated_stats;
        const likesCount = document.createElement("p");
        likesCount.textContent = `Saves: ${aggregatedStats.saves}`;
        statsWrapper.appendChild(likesCount);

        const downloadbutton = document.createElement("p");
        downloadbutton.style.cursor = "pointer";
        downloadbutton.style.color = "Red";
        downloadbutton.textContent = "Download";
        downloadbutton.addEventListener("click", () => {
          sendMessageToBackground(pin.images["564x"].url, pin.id);
        });
        statsWrapper.appendChild(downloadbutton);

        pinWrapper.appendChild(statsWrapper);
        pinsContainer.appendChild(pinWrapper);
      });
    }
  );
}

function sendMessageToBackground(url, pinId) {
  chrome.runtime.sendMessage({
    action: "downloadImage",
    imageUrl: url,
    pinId: pinId,
  });
}
