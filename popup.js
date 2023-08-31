const sortByRepinsRadio = document.getElementById("sortByRepins");
const sortBySavesRadio = document.getElementById("sortBySaves");
const sortByRandomRadio = document.getElementById("defaultOpen");
const tabLinks = document.querySelectorAll(".tablink");
const tabContainer = document.getElementById("tabContainer");

sortByRepinsRadio.addEventListener("click", displaysortedbyrepins);
sortBySavesRadio.addEventListener("click", displaysortedbysaves);
sortByRandomRadio.addEventListener("click", displaysortbyrandom);

sortByRandomRadio.classList.add("active");
var sortedPins;

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    // Remove the 'active' class from all tab links
    tabLinks.forEach((tab) => {
      tab.classList.remove("active");
    });

    // Add the 'active' class to the clicked tab link
    link.classList.add("active");
  });
});

chrome.tabs.query({ currentWindow: true, active: true }, async function (tabs) {
  const url = new URL(tabs[0].url);
  const pathParts = url.pathname.split("/");
  const name = pathParts[1];
  const board = pathParts[2];

  const apiUrl = `https://api.pinterest.com/v3/pidgets/boards/${name}/${board}/pins/`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  sortedPins = [...data.data.pins];
  displaypins();
});

function displaysortedbysaves() {
  sortedPins.sort(
    (a, b) =>
      b.aggregated_pin_data.aggregated_stats.saves -
      a.aggregated_pin_data.aggregated_stats.saves
  );
  displaypins();
}

function displaysortedbyrepins() {
  sortedPins.sort((a, b) => b.repin_count - a.repin_count);
  displaypins();
}

function displaysortbyrandom() {
  for (let i = sortedPins.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sortedPins[i], sortedPins[j]] = [sortedPins[j], sortedPins[i]];
  }
  displaypins();
}

function displaypins() {
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

    const downloadButton = document.createElement("button");
    downloadButton.style.cursor = "pointer";
    downloadButton.className = "downloadbutton";
    const downloadIcon = document.createElement("i");
    downloadIcon.className = "fas fa-download"; // This class represents the download icon from Font Awesome

    downloadButton.appendChild(downloadIcon);
    downloadButton.addEventListener("click", () => {
      const pinId = pin.id;
      const imageUrl = "https://in.pinterest.com/pin/" + pinId;

      var xhr = new XMLHttpRequest();
      xhr.open("POST", "http://127.0.0.1:5000/download", true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var text = xhr.responseText;
            chrome.downloads.download({
              url: text,
              filename: `${pinId}.mp4`,
            });
          } else {
            chrome.downloads.download({
              url: pin.images["564x"].url,
              filename: `${pinId}.jpg`,
            });
          }
        }
      };
      xhr.send(JSON.stringify({ url: imageUrl }));
    });

    pinWrapper.appendChild(statsWrapper);
    pinWrapper.appendChild(downloadButton);
    pinsContainer.appendChild(pinWrapper);
  });
}
