const videoId = localStorage.getItem("videoId");
const API_KEY = "AIzaSyDAVcR9yQbw6a_pn7PCneGIr0eyh_4v5EI";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const videoTitle = document.getElementById("videoTitle");
const channelName = document.getElementById("channelName");
const description = document.getElementById("description");
const likeCount = document.getElementById("likeCount");
const channelLogo = document.getElementById("channelLogo");
const commentContainer = document.getElementById("comments-container");
const recommendedList = document.getElementById("recommendedList");

let descriptionFullText = null;

window.addEventListener("load", () => {
  if (YT) {
    new YT.Player("videoPlayer", {
      height: "100%",
      width: "100%",
      videoId,
      playerVars: { autoplay: 1 },
    });
  }
});

async function fetchAndShowVideDetails() {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,statistics&id=${videoId}`
  );
  const data = await response.json();
  const videoDetails = data.items[0];

  const channelResponse = await fetch(
    `${BASE_URL}/channels?key=${API_KEY}&part=snippet,statistics&id=${videoDetails.snippet.channelId}`
  );
  const channelData = await channelResponse.json();
  // console.log(channelData)

  videoTitle.innerText = videoDetails.snippet.title;
  channelName.innerText = videoDetails.snippet.channelTitle;
  descriptionFullText = videoDetails.snippet.description;
  description.innerText = descriptionFullText.slice(0, 170) + "  ...show more";
  description.addEventListener("click", (e) => {
    e.target.innerText = descriptionFullText;
  });
  likeCount.innerText = formatNumber(videoDetails.statistics.likeCount);
  subCount.innerText =
    formatNumber(channelData.items[0].statistics.subscriberCount) +
    " subscribers";
  channelLogo.src = channelData.items[0].snippet.thumbnails.default.url;
}

fetchAndShowVideDetails();

async function renderComments() {
  const response = await fetch(
    `${BASE_URL}/commentThreads?key=${API_KEY}&videoId=${videoId}&maxResults=30&part=snippet`
  );
  const data = await response.json();
  const commentData = data.items;

  commentData.map((el) => {
    const comment = document.createElement("div");
    comment.className = "comment";
    comment.innerHTML = `
        <img src="${
          el.snippet.topLevelComment.snippet.authorProfileImageUrl
        }" alt="">
        <div>
        <h5>${el.snippet.topLevelComment.snippet.authorDisplayName}</h5>
        <p>${el.snippet.topLevelComment.snippet.textOriginal}</p>
        ${
          el.snippet.totalReplyCount > 0
            ? `<b id="${el.snippet.topLevelComment.id}" onclick="loadReplies(event)" >${el.snippet.totalReplyCount} replies</b>`
            : ""
        }
        </div>
        `;
    commentContainer.appendChild(comment);
  });
}
renderComments();

async function loadReplies(e) {
  e.target.onclick = null;
  const commentId = e.target.id;
  const commentDiv = e.target.parentNode;
  const response = await fetch(
    `${BASE_URL}/comments?key=${API_KEY}&parentId=${commentId}&part=snippet&maxResults=10`
  );
  const repliesData = await response.json();

  repliesData.items.map((el) => {
    const replyDiv = document.createElement("div");
    replyDiv.className = "comment";
    replyDiv.innerHTML = `
        <img src="${el.snippet.authorProfileImageUrl}" alt="">
        <div>
        <h5>${el.snippet.authorDisplayName}</h5>
        <p>${el.snippet.textOriginal}</p>
        `;
    commentDiv.appendChild(replyDiv);
  });
}

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
  // console.log("info",channelInfo)

  const videoDiv = document.createElement("div");
  videoDiv.id = videoId;
  videoDiv.className = "video-card";
  videoDiv.innerHTML = `
        <div class="video-card-img" id="thumbDiv-${videoId}">
            <img id="thumbImg-${videoId}" src="${
    videoDetails.snippet.thumbnails.high.url
  }" alt="">
         </div>
        <div class="video-card-details">
        <div class="details">
            <h3 id="title">${
              videoDetails.snippet.title.slice(0, 40) + "..."
            }</h3>
            <p>${videoDetails.snippet.channelTitle}</p>
            <p><span>${formatViewCount(
              videoDetails.statistics.viewCount
            )}</span> views <span>${calculateTimeGap(
    videoDetails.snippet.publishedAt
  )}</span></p>
        </div>
    `;
  recommendedList.appendChild(videoDiv);
}

fetchVideos("", 20);

function formatNumber(number) {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + "K";
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else {
    return (number / 1000000000).toFixed(1) + "B";
  }
}
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
  // Parse the "publishedAt" timestamp into a Date object
  const publishedDate = new Date(publishedAt);

  // Get the current time as a Date object
  const currentDate = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = currentDate - publishedDate;

  // Convert the time difference to seconds
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
