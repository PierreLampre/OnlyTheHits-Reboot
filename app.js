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
    console.log(
      response.json().then((data) => {
        console.log(data);
        let user_name = data.display_name;
        let user_img = data.images[0].url;
        let user_id = data.id;
        // console.log(user_name);
        console.log("the id is " + user_id);
        document.getElementById("userName").textContent = user_name;
        document.getElementById("userImg").src = user_img;
        userInfo.push(user_name, user_img, user_id);
      })
    );
  });
}

getUserInfo();

console.log(userInfo);

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
    console.log(
      response.json().then((data) => {
        console.log(data);
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
      })
    );
  });
}

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
        body: JSON.stringify({name: playlistName, public: false}),
        json: true,
    }).then((response) => {
      console.log(
        response.json().then((data) => {
          console.log("hey it worked, look at this: " + data);
        })
      );
    });
    hideLandingPage();
    playlistNames = empty;
    getUserPlaylists();
    playlistNames.unshift(playlistName);
    playlistInput.value = "";

  }
}

//Making that New Playlist button glow like a champion.

function plusIconGlow(){
    document.getElementById("plus").src = "./img/white-plus.svg";
    document.getElementById("new-playlist").style.color = "white";
}

function plusIconDull(){
    document.getElementById("plus").src = "./img/plus.svg"
    document.getElementById("new-playlist").style.color = "rgb(196, 194, 202)";
}

//onclick for creating new playlist from logged in ui

function makeAnotherPlaylist(){
    document.getElementById("init-container").style.display = "grid";
}

//Global Arrays for getSimilarArtists storage

let similarArtists = [];

function getSimilarArtists() {

    let bandID = "";
    let initArtist = document.querySelector("#artist-search").value.toString();
    initArtist = initArtist.split(' ').join('+');

    if(initArtist !== "") {

    fetch("https://api.spotify.com/v1/search?query=" + initArtist + "&offset=0&limit=1&type=artist", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + _token,
    },
  }).then((response) => {
    console.log(
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
        console.log(
        response.json().then((data) => {
            similarArtists = data;
            console.log(similarArtists);
        })
        );
    });

      })
    );
  });

  document.querySelector("#artist-search").value = "";
  document.querySelector("#artist-search").style.border = "none";
  document.querySelector("#artist-search").placeholder = "Search";

  } else {
    document.querySelector("#artist-search").style.border = "3px solid red";
    document.querySelector("#artist-search").placeholder = "Enter an artist's name.";
  }

}

const artistSearchBox = document.getElementById("artist-search");

artistSearchBox.addEventListener("keypress", function(e){
    if(e.key === "Enter") {
        getSimilarArtists();
    }
});


