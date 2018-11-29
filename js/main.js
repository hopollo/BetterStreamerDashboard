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
      $('.userLogo').replaceWith(`<img src="${data.data[0].profile_image_url}" width=50px height=50px />`);  
      userID = data.data[0].id;
      secondPassFetch();
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

function lockItems() {
  $('.handle').css('display', 'none');
  var img = '<span class="fas fa-lock"></span>';
  $('.lock').replaceWith(`<button class="lock">${img}</button>`);
  
  $('.lock').click(() => { unlockItems(); });
}

function unlockItems() {
  var img = '<span class="fas fa-lock-open"></span>';
  $('.lock').replaceWith(`<button class="lock">${img}</button>`);
  $('.handle').css('display', 'block');
  $('#drag').draggable({iframeFix: true, cursor: "move", containment : ".center"});

  $('.lock').click(() => { lockItems(); });
}

function getViewers() {
  $.get(`https://decapi.me/twitch/viewercount/${user}`, (viewers) => {
    if (viewers == `${user} is offline`) {
      var img = '<span class="fas fa-video-slash"></span>'
      $('.viewers').replaceWith(`${img}`);
    } else {
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
  //var url = `https://api.streamelements.com/kappa/v2/activities/${user}`; 
  var url = `https://api.streamelements.com/kappa/v2/channels/me`; 
  var token = {
    headers: {
      'Client-ID' : '5k3eXSKds9eBgcwlmzhe6vmEEFaejNOr0GzPIMehfVa5zF1Z'
    }
  };

  fetch(url, token)
    .then(res => res.json())
    .then(data => console.log(data))
    .then(err => console.log(err));
}

// https://decapi.me/twitch/chat_rules/hopollo chatRULES
function getLastHighLight() {
  //https://decapi.me/twitch/highlight/${user}
}

function starting() {
  $('.center').prepend('<div class="loading"></div>');
}

$(window).ready(() => {
  $('.loading').fadeOut(1000, () => { $('.loafing').remove(); });
  $('.top, .bottom').fadeIn(400, () => { $('.top, .bottom').css('display', 'grid'); }); //Grid display still need to vertical align items
  $('.center').append(`<div id="drag" class="draggable resizable ui-draggable ui-draggable-handle"><div class='handle'></div><iframe frameborder="0" scrolling="true" id="chat_embed" src=""></iframe></div>`);
  $('.settings').append(`<button class="lock"></button>`);

  lockItems();
  getChat();
  getTwitchInfo();
  getViewers();
  getViews();
  getTitle();
  getGame();
  //getActivities();
  
  $('.lock').click(() => {
    unlockItems();
  });

  setInterval(function() {
    getTwitchInfo();
    getViewers();
    getViews();
    getTitle();
    getGame();
    //getActivities();
  }, 1*60*1000);
});

starting();
