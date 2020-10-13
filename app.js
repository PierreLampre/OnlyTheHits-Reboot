// Auth

 // Get the hash of the url
 const hash = window.location.hash
 .substring(1)
 .split('&')
 .reduce(function (initial, item) {
     if (item) {
         var parts = item.split('=');
         initial[parts[0]] = decodeURIComponent(parts[1]);
     }
     return initial;
 }, {});
window.location.hash = '';

// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = '5ac2c85f00e945c4b6442809100628f8';
const redirectUri = 'http://localhost:5500';
const scopes = [
 'playlist-modify-private',
 'playlist-modify-public',
 'user-top-read'
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
 window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token`;
}

//getUserInfo Global Vars

let user_name;
let user_img;

//Grab user info onload

function getUserInfo() {
    fetch('https://api.spotify.com/v1/me', {
            method: 'GET', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + _token
            }
        })
            .then((response) => {
                console.log(response.json().then(
                    (data) => { 
                        // console.log(data);
                        let user_name = data.display_name;
                        let user_img = data.images[0].url;
                        // console.log(user_name);
                        // console.log(user_img);
                        document.getElementById("userName").textContent = user_name;
                        document.getElementById("userImg").src = user_img;
                    }
                ));
            });
}

getUserInfo();

//getUserPlaylists Global Vars

let playlistNames = [];

function getUserPlaylists() {
    fetch('https://api.spotify.com/v1/me/playlists', {
            method: 'GET', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + _token
            }
        })
            .then((response) => {
                console.log(response.json().then(
                    (data) => { 
                        console.log(data);
                        for (let i = 0; i < data.items.length; i++) {
                            playlistNames.push(data.items[i].name);                          
                        }
                        //Fill out user playlists in left sidebar

                        console.log(playlistNames);

                        let userPlaylists = document.querySelector("#userPlaylists");

                        userPlaylists.innerHTML = '<ul>' + playlistNames.map(function (playlistName) {
                            return '<li>' + playlistName + '</li>';
                        }).join('') + '</ul>';
                    }
                ));
            });
}

getUserPlaylists();