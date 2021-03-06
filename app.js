// Auth

// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
window.location.hash = "";

// Set token
let _token = hash.access_token;

const authEndpoint = "https://accounts.spotify.com/authorize";

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "5ac2c85f00e945c4b6442809100628f8";
const redirectUri = "http://localhost:5500";
const scopes = [
  "playlist-modify-private",
  "playlist-modify-public",
  "user-top-read",
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    "%20"
  )}&response_type=token`;
}

let userInfo = [];

//Listener for browser window size. trust me it's important.

let width;
let spotifyPlayer;

function checkWidth(){
  width = parseInt(window.innerWidth);
  // console.log("here's the width: " + width);
}

window.addEventListener("load", checkWidth);

window.onresize = checkWidth;

//Grab user info onload

function getUserInfo() {
  fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + _token,
    },
  }).then((response) => {
    response.json().then((data) => {
      let user_name = data.display_name;
      let user_img = data.images[0].url;
      let user_id = data.id;
      document.getElementById("userName").textContent = user_name;
      document.getElementById("userImg").src = user_img;
      userInfo.push(user_name, user_img, user_id);
    });
  });
}

getUserInfo();

//getUserPlaylists Global Vars

let playlistNames = [];
let empty = [];

function getUserPlaylists() {
  fetch("https://api.spotify.com/v1/me/playlists", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + _token,
    },
  }).then((response) => {
    response.json().then((data) => {
      for (let i = 0; i < data.items.length; i++) {
        playlistNames.push(data.items[i].name);
      }
      //Fill out user playlists in left sidebar

      let userPlaylists = document.querySelector("#userPlaylists");

      userPlaylists.innerHTML =
        "<ul>" +
        playlistNames
          .map(function (playlistName) {
            return "<li>" + playlistName + "</li>";
          })
          .join("") +
        "</ul>";
    });
  });
}

let loggedInContainer = document.querySelector(".logged-in-container");

window.addEventListener("load", (event) => {
  loggedInContainer.style.display = "none";
});

//Handle case that user triggers function with no text input

let playlistInput = document.getElementById("playlistName");

function playlistNameErrorHandle() {
  playlistInput.style.border = "3px solid red";
  playlistInput.placeholder = "Please Enter A Playlist Name.";
}

function undoPlaylistNameErrorHandle() {
  playlistInput.style.border = "none";
  playlistInput.placeholder = "";
}

function hideLandingPage() {
  document.getElementById("init-container").style.display = "none";
  loggedInContainer.style.display = "grid";
}

//createPlaylist Global Vars

function createPlaylist() {
  let playlistName = playlistInput.value.toString();
  let user_id = userInfo[2];

  if (playlistName === "") {
    playlistNameErrorHandle();
  } else {
    undoPlaylistNameErrorHandle();
    fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + _token,
      },
      body: JSON.stringify({ name: playlistName, public: false }),
      json: true,
    }).then((response) => {
      response.json().then((data) => {});
    });
    hideLandingPage();
    playlistNames = empty;
    getUserPlaylists();
    playlistNames.unshift(playlistName);
    playlistInput.value = "";
  }
}

//Making that New Playlist button glow like a champion.

function plusIconGlow() {
  document.getElementById("plus").src = "./img/white-plus.svg";
  document.getElementById("new-playlist").style.color = "white";
}

function plusIconDull() {
  document.getElementById("plus").src = "./img/plus.svg";
  document.getElementById("new-playlist").style.color = "rgb(196, 194, 202)";
}

//onclick for creating new playlist from logged in ui

function makeAnotherPlaylist() {
  document.getElementById("init-container").style.display = "grid";
  loggedInContainer.style.display = "none";
}

//Carousel of Similar Artists.

const carouselImgs = document.getElementById("carouselImgs");
const prev = document.getElementById("previous");
const next = document.getElementById("next");
const numberOfCards = document.querySelectorAll(".carousel-img").length;
let imageIndex = 1;
let translateX = 0;

prev.addEventListener("click", (e) => {
  if (e.target.id === "previous") {
    if (imageIndex !== 1) {
      imageIndex--;
      translateX += 1020;
    }
  }
  carouselImgs.style.transform = `translateX(${translateX}px)`;
});

next.addEventListener("click", (e) => {
  if (e.target.id === "next") {
    if (imageIndex <= 4) {
      imageIndex++;
      translateX -= 1020;
    }
  }
  carouselImgs.style.transform = `translateX(${translateX}px)`;
})

let similarArtists = [];

function clearArtistsDisplay() {
  document.getElementById("carouselImgs").innerHTML = "";
}

function getSimilarArtists() {
  let bandID = "";
  let initArtist = document.querySelector("#artist-search").value.toString();
  initArtist = initArtist.split(" ").join("+");

  if (initArtist !== "") {
    fetch(
      "https://api.spotify.com/v1/search?query=" +
        initArtist +
        "&offset=0&limit=1&type=artist",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + _token,
        },
      }
    ).then((response) => {
      response.json().then((data) => {
        bandId = data.artists.items[0].id;

        fetch(`https://api.spotify.com/v1/artists/${bandId}/related-artists`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + _token,
          },
        }).then((response) => {
          response.json().then((data) => {
            console.log(data);
            similarArtists = data;
            clearArtistsDisplay();
            populateDivWithArtists();
            console.log(box);
            console.log(box.offsetWidth);
          });
        });
      });
    });

    document.querySelector("#artist-search").value = "";
    document.querySelector("#artist-search").style.border = "none";
    document.querySelector("#artist-search").placeholder = "Search";
  } else {
    document.querySelector("#artist-search").style.border = "3px solid red";
    document.querySelector("#artist-search").placeholder =
      "Enter an artist's name.";
  }
}

//Append Cards to artist-display div.

const artistDisplay = document.getElementById("carouselImgs");
let playbackBandId = "";
let selectedArtistImgUrl = "";
let selectedArtistName = "";

function setPlaybackBandId(id) {
  playbackBandId = id;
}

function setArtistImgUrlAndName(url, name) {
  selectedArtistImgUrl = url;
  selectedArtistName = name;
}

function populateDivWithArtists() {
  for (let i = 0; i < similarArtists.artists.length; i++) {
    let artistBox = document.createElement("span");
    let imgContainer = document.createElement("div");
    let artistImg = document.createElement("img");
    let overlay = document.createElement("div");
    let artistName = document.createElement("p");
    let playButton = document.createElement("img");

    artistBox.className = "carousel-card";
    imgContainer.className = "img-container";
    artistImg.className = "carousel-img";
    artistName.className = "artist-name";
    artistName.setAttribute("data-id", similarArtists.artists[i].id);
    overlay.className = "overlay";
    overlay.setAttribute("data-id", similarArtists.artists[i].id);
    playButton.className = "play-button";
    playButton.src = "./img/play.svg";
    artistImg.src = similarArtists.artists[i].images[0].url;
    artistImg.setAttribute(
      "data-imgurl",
      similarArtists.artists[i].images[0].url
    );
    artistName.textContent = similarArtists.artists[i].name;
    artistName.setAttribute("data-name", similarArtists.artists[i].name);

    artistDisplay.appendChild(artistBox);
    artistBox.appendChild(imgContainer);
    imgContainer.appendChild(artistImg);
    imgContainer.appendChild(overlay);
    overlay.appendChild(playButton);
    artistBox.appendChild(artistName);

    overlay.addEventListener("click", function () {
      setPlaybackBandId(overlay.dataset.id);
      setArtistImgUrlAndName(artistImg.dataset.imgurl, artistName.dataset.name);
      getSimilarTracks();
    });

    artistName.addEventListener("click", function () {
      setPlaybackBandId(artistName.dataset.id);
      setArtistImgUrlAndName(artistImg.dataset.imgurl, artistName.dataset.name);
      getSimilarTracks();
    });
  }
}

//Pull similar artist's top ten tracks from spotify api

let similarTracksArr = [];

function getSimilarTracks() {
  fetch(
    `https://api.spotify.com/v1/artists/${playbackBandId}/top-tracks?country=US`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + _token,
      },
    }
  ).then((response) => {
    response.json().then((data) => {
      similarTracksArr = [];
      similarTracksArr.push(data.tracks);
      console.log(similarTracksArr);
      populateDivWithTopTracks();
      tracksBox.style.display = "block";
      artistInfo.style.display = "flex";
    });
  });
}

const tracksBox = document.querySelector("#similarTracks");
const artistsDiv = document.querySelector(".artists-display");
const ad = document.querySelector("#ad");
const artistsHeader = document.querySelector(".artists-header");
const artistInfo = document.querySelector("#artistInfo");
const backBtn = document.querySelector("#back");

function populateDivWithTopTracks() {
  tracksBox.innerHTML = "";
  artistInfo.innerHTML = "";
  let trackNumber = 1;
  artistsDiv.style.display = "none";
  ad.style.display = "none";
  artistsHeader.style.display = "none";
  let topTracksArtistImg = document.createElement("img");
  topTracksArtistImg.className = "top-tracks-artist-img";
  topTracksArtistImg.src = selectedArtistImgUrl;
  let topTracksArtistName = document.createElement("span");
  topTracksArtistName.className = "top-tracks-artist-name";
  topTracksArtistName.textContent = selectedArtistName;
  artistInfo.appendChild(topTracksArtistImg);
  artistInfo.appendChild(topTracksArtistName);
  backBtn.style.cursor = "pointer";

  backBtn.addEventListener("click", function () {
    tracksBox.style.display = "none";
    artistInfo.style.display = "none";
    artistsDiv.style.display = "flex";
    ad.style.display = "block";
    artistsHeader.style.display = "flex";
    backBtn.style.cursor = "default";
  });

  for (let i = 0; i < similarTracksArr[0].length; i++) {
    let singleTrackBox = document.createElement("div");
    singleTrackBox.className = "single-track-box";
    let albumImg = document.createElement("img");
    albumImg.className = "album-img";
    albumImg.src = similarTracksArr[0][i].album.images[2].url;
    let trackNumberBox = document.createElement("span");
    trackNumberBox.className = "track-number-box";
    if (trackNumber === 1) {
      trackNumberBox.className = "track-number-box first";
    } else if (trackNumber === 10) {
      trackNumberBox.className = "last-track-number-box";
    }
    trackNumberBox.textContent = trackNumber;
    let trackPlayBtn = document.createElement("img");
    trackPlayBtn.className = "track-play-btn";
    trackPlayBtn.id = trackNumber;
    trackPlayBtn.setAttribute("data-id", similarTracksArr[0][i].id);
    trackPlayBtn.src = "./img/play.svg";
    let trackName = document.createElement("p");
    trackName.className = "track-name";
    trackName.textContent = similarTracksArr[0][i].name;

    tracksBox.appendChild(singleTrackBox);
    singleTrackBox.appendChild(albumImg);
    singleTrackBox.appendChild(trackNumberBox);
    singleTrackBox.appendChild(trackPlayBtn);
    singleTrackBox.appendChild(trackName);
    trackNumber++;

    let player = document.getElementById("player");
    let songID = trackPlayBtn.dataset.id

    trackPlayBtn.addEventListener("click", function(){
      showPlayer();
      player.innerHTML = `<iframe id='spotifyPlayer' src='https://open.spotify.com/embed/track/${songID}' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>`
    })
  }

}

let player = document.querySelector("#player");

function showPlayer() {
  player.style.display = "block";
}

function clearInput() {
  document.querySelector("#artist-search").placeholder = "";
}

function replacePlaceholderText() {
  document.querySelector("#artist-search").placeholder = "Search";
}

const artistSearchBox = document.getElementById("artist-search");

artistSearchBox.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    getSimilarArtists();
  }
});


