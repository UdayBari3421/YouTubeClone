const API_KEY = "AIzaSyDAVcR9yQbw6a_pn7PCneGIr0eyh_4v5EI";
const BASE_URL = "https://www.googleapis.com/youtube/v3";
const videoContainerDiv = document.getElementById("videoContainerDiv");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const menuIcon = document.getElementById("menuIcon");
const leftMenu = document.getElementById("leftMenu");
const logoimg = document.querySelector(".logo");
const navrow1 = document.querySelector(".nav-row1");
const inputDiv = document.querySelector(".inputDiv");

let thumbnailImg = null;

menuIcon.addEventListener("click", () => {
  leftMenu.classList.toggle("smallLeftMenu");
  black.classList.toggle("show");
});
black.addEventListener("click", (e) => {
  e.stopPropagation();
  leftMenu.classList.remove("smallLeftMenu");
  black.classList.remove("show");
});

async function fetchVideos(searchTerm, maxResult) {
  const response = await fetch(
    `${BASE_URL}/search?key=${API_KEY}&q=${searchTerm}&maxResults=${maxResult}&part=id&type=video`
  );
  const data = await response.json();
  const videoIds = data.items.map((el) => el.id.videoId);
  videoIds.map((videoId) => {
    fetchVideoDetails(videoId);
  });
}

async function fetchVideoDetails(videoId) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,statistics&id=${videoId}`
  );
  const data = await response.json();
  const videoDetails = data.items[0];

  const channelResponse = await fetch(
    `${BASE_URL}/channels?key=${API_KEY}&part=snippet&id=${videoDetails.snippet.channelId}`
  );
  const channelData = await channelResponse.json();
  const channelInfo = channelData.items[0].snippet;

  const videoDiv = document.createElement("div");
  videoDiv.id = videoId;
  videoDiv.addEventListener("click", (e) => goToDetailsPage(videoId));
  videoDiv.addEventListener("mouseover", (e) =>
    playVideoPreview(videoId, videoDetails.snippet.thumbnails.high.url)
  );
  videoDiv.addEventListener("mouseout", (e) =>
    stopVideoAndDisplayThumbnail(videoId)
  );
  videoDiv.className = "video-card";
  videoDiv.innerHTML = `
        <div class="video-card-img" id="thumbDiv-${videoId}">
            <img id="thumbImg-${videoId}" src="${
    videoDetails.snippet.thumbnails.high.url
  }" alt="">
         </div>
        <div class="video-card-details">
        <img class="channel-logo"
            src="${channelInfo.thumbnails.default.url}"
            alt="">
        <div class="details">
            <h3 id="title">${
              videoDetails.snippet.title.slice(0, 64) + "..."
            }</h3>
            <p>${videoDetails.snippet.channelTitle}</p>
            <p><span>${formatViewCount(
              videoDetails.statistics.viewCount
            )}</span> views <span>${calculateTimeGap(
    videoDetails.snippet.publishedAt
  )}</span></p>
        </div>
    `;
  videoContainerDiv.appendChild(videoDiv);
}

fetchVideos("", 20);

searchButton.addEventListener("click", (e) => {
  console.log("first");
  videoContainerDiv.innerHTML = "";
  if (window.innerWidth < 992) {
    logoimg.classList.toggle("disp1");
    searchInput.style.width = "75%";
    navrow1.style.width = "100%";
    inputDiv.style.margin = "auto";
  }
  searchInput.classList.toggle("disp");
  fetchVideos(searchInput.value, 20);
});
function formatViewCount(viewCount) {
  const count = parseFloat(viewCount);

  if (count >= 1e9) {
    return (count / 1e9).toFixed(1) + "B";
  } else if (count >= 1e6) {
    return (count / 1e6).toFixed(1) + "M";
  } else if (count >= 1e3) {
    return (count / 1e3).toFixed(1) + "K";
  } else {
    return count.toString();
  }
}
function calculateTimeGap(publishedAt) {
  const publishedDate = new Date(publishedAt);
  const currentDate = new Date();
  const timeDifference = currentDate - publishedDate;
  const seconds = Math.floor(timeDifference / 1000);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (seconds < 2419200) {
    const weeks = Math.floor(seconds / 604800);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (seconds < 29030400) {
    const months = Math.floor(seconds / 2419200);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(seconds / 29030400);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
}

function goToDetailsPage(videoId) {
  localStorage.setItem("videoId", videoId);
  window.location.href = "videoDetails.html";
}

function playVideoPreview(videoId, currrentThumbnail) {
  thumbnailImg = currrentThumbnail;
  if (YT) {
    new YT.Player("thumbImg-" + videoId, {
      height: "100%",
      width: "100%",
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        showinfo: 0,
        mute: 1,
      },
    });
    document
      .getElementById("thumbDiv-" + videoId)
      .addEventListener("click", (e) => {
        e.preventDefault();
        goToDetailsPage();
      });
  }
}
function stopVideoAndDisplayThumbnail(videoId) {
  const thumbnailDiv = document.getElementById("thumbDiv-" + videoId);
  thumbnailDiv.innerHTML = `
    <img id="${"thumbImg-" + videoId}" src="${thumbnailImg}" alt="">
    `;
}
