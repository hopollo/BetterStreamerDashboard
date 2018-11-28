var url = new URL(window.location.href);
var user = url.searchParams.get('name');
var userID;
var avatar;
var followers;
var name;
var client_id = 'tz2timwcbqtsagu0a8oo11xp849hxo';

function getTwitchInfo() {
  
  var token = {
    headers: {'Client-ID' : client_id}
  };
 
  fetch(`https://api.twitch.tv/helix/users?login=${user}`, token)
    .then(res => res.json())
    .then(data => {
      //Display UserLogo
      console.log(data);
      $('.userLogo').replaceWith(`<img src="${data.data[0].profile_image_url}" width=60px height=60px />`);
      userID = data.data[0].id;
      secondPassFetch()
    });

    function secondPassFetch() {
      fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userID}`, token)
        .then(res => res.json())
        .then(data => {
          totalFollowers = data.total;
          getFollowers(totalFollowers);
        });
    }
}

function getChat() {
  $('#chat_embed').prop('src',`https://www.twitch.tv/embed/${user}/chat`);
}

function getViewers() {
  $.get(`https://decapi.me/twitch/viewercount/${user}`, (viewers) => {
    if (viewers == `${user} is offline`) {
      var img = '<span class="fas fa-video-slash"></span>'
      $('.viewers').replaceWith(`${img}`);
    } else {
      //TODO (hopollo) : ADD VIEWERS ICON BEFORE
      var img = '<span class="fas fa-child"></span>'
      $('.viewers').replaceWith(img);
      $('.fa-child').text(` ${viewers}`);
    }
  });
}

function getFollowers() {
  $.get(`https://decapi.me/twitch/followers/${user}`, (followers) => {
    var img = '<span class="fas fa-heart"></span>';
    $('.followers').replaceWith(img);
    $('.fa-heart').text(` ${totalFollowers} (${followers})`);
  });
}

function getViews() {
  $.get(`https://decapi.me/twitch/total_views/${user}`, (views) => {
    var img = '<span class="fas fa-eye"></span>';
    $('.views').replaceWith(img);
    $('.fa-eye').text(` ${views}`);
  });
}

function getTitle() {
  $.get(`https://decapi.me/twitch/status/${user}`, (title) => {
    $('.streamTitle').text(title);
  })
}

function getGame() {
  $.get(`https://decapi.me/twitch/game/${user}`, (game) => {
    var img = '<span class="fas fa-gamepad"></span>';
    $('.streamGame').replaceWith(`${img}`);
    $('.fa-gamepad').text(` ${game}`);
  })
}

function getUptime() {
  $.get(`https://decapi.me/twitch/uptime/${name}`, (uptime) => {
    if (uptime == 'A channel name has to be specified.') {
      $('.uptime').text('');
    } else {
      $('.uptime').text(uptime);
    }
  });
}

function getActivities() {
  $.ajax({url : `https://api.streamelements.com/kappa/v2/activities/${user}`, 
          headers: {'Client-ID' : client_id}
        }, (activities) => {
    $('.activities').text(activities);
  });
}

// https://decapi.me/twitch/chat_rules/hopollo chatRULES
function getLastHighLight() {
  //https://decapi.me/twitch/highlight/${user}
}

getChat();
getTwitchInfo();
getViewers();
getViews();
getTitle();
getGame();

setInterval(() => {
  getTwitchInfo();
  getViewers();
  getViews();
  getTitle();
  getGame();
  //getActivities();
}, 1200000);
