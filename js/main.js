var url = new URL(window.location.href);
var user = window.location.href.searchParams.get('name') || "YOUR_TWITCH_NAME";
var userID;
var avatar;
var followers;
var client_id = 'tz2timwcbqtsagu0a8oo11xp849hxo';

var modules = {
  twitchVideo : false,
  twitchClips : false,
  twitchChat: true,
  twitchUptime: true,
  twitchViews: true,
  twitchViewers: true,
  twitchFollowers: true,
  streamElementsAcitivites: false,
}

function getStatic() {
  $('.top').append('<div class="streamTitle"></div>')
  $('.top').append('<div class="streamGame"></div>')
  $('.top').append('<div class="settings"></div>');
  $('.settings').append(`<button class="preferences"></button>`);
  $('.settings').append(`<button class="lock"></button>`);

  createChat();
  createFollowers();
  createUptime();
  createViewers();
  createViews();
}

function updateModules() {
  getTwitchInfo();
  getGame();
  getTitle();

  if (modules.twitchViews) { getViews(); }
  if (modules.twitchViewers) { getViewers(); }
  if (modules.getActivities) { getActivities(); }
}

function getTwitchInfo() {
  var token = {
    headers: {'Client-ID' : client_id}
  };
 
  fetch(`https://api.twitch.tv/helix/users?login=${user}`, token)
    .then(res => res.json())
    .then(data => {
      $('.top').append(`<div class="userLogo"><img src="${data.data[0].profile_image_url}" heigth="100%" width="100%"/></div>`);  
      userID = data.data[0].id;
      secondPassFetch();
    });

    function secondPassFetch() {
      fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userID}`, token)
        .then(res => res.json())
        .then(data => {
          totalFollowers = data.total;
          if (modules.twitchFollowers) { getFollowers(totalFollowers); }
        });
    }
}

function getFullEmbed() {
  defaultTheme = "dark";
}

function getVideo() {
  $('.video').replaceWith(`
  <div class="module video">
    <div class="handle"></div>
    <iframe src="https://player.twitch.tv/?channel=${user}" 
      frameborder="0" 
      allowfullscreen="true" 
      scrolling="no" 
      height="100%" 
      width="100%">
    </iframe>
  </div>`);
}

function getClips() {
  var url = `https://api.twitch.tv/kraken/clips/top?limit=1&channel=${user}`;
  var token = {
    headers: {
      'Client-ID' : client_id,
    }
  };

  fetch(url, token)
    .then(res => res.json())
    .then(data => console.log(data))

  $('.center').append(`
  <iframe src="https://clips.twitch.tv/embed?clip=<slug>"
    height="360"
    width="640"
    frameborder="0"
    scrolling="no"
    allowfullscreen="true">
  </iframe>`);
}

function getChat() {
  $('.chat').replaceWith(`
  <div class="module chat">
    <div class="handle"></div>
    <iframe frameborder="0" scrolling="true" id="chat_embed" src="https://www.twitch.tv/embed/${user}/chat"></iframe>
  </div>`);
}

function getPreferences() {
  var img = '<span class="fas fa-cog"></span>';
  $('.preferences').replaceWith(`<button class="preferences">${img}</button>`);
  $('.preferences').css('display', 'block');
  $('.preferences').click(() => { showPreferences(); });
  $('.center').append(`<div id="myModal" class="modal"><div class="modal-content"><span class="close">&times;</span></div></div>`);
  $('.modal-content').append('<ul class="options"></ul>');
  
  $('.options').append(`<li><input type="checkbox" class="options-item-twitchVideo"> Twitch Video</input><span class="new">new</span></li>`);
  //$('.options').append(`<li><input type="checkbox" class="options-item-twitchClips"> Twitch Clips</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-twitchChat" checked> Twitch Chat</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-uptime" checked> Twitch Uptime</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-views" checked> Twitch Views</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-viewers" checked> Twitch Viewers</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-twitchFollowers" checked> Twitch Followers</input></li>`);

  $('.options').append('<span>New features soon, more info : <a href="https://twitter.com/hopollotv" target="_blank">@HoPolloTV</a></span>');  
  $('.modal-content').append('<div class="donate"><a href="https://streamelements.com/hopollo/tip" target="_blank"><button class="donate-button"><span class="fas fa-piggy-bank"></span> Donate</button></a></donate>');
}

function showPreferences() {
  $('.modal').css('display', 'block');

  $('.close').click(() => {
    $('.modal').css('display', 'none');
  });
}

function lockItems() {
  $('.handle').css('display', 'none');
  var img = '<span class="fas fa-lock"></span>';
  $('.lock').replaceWith(`<button class="lock">${img}</button>`);
  $('.lock').css('display', 'block'); //REMARK Some weird looking bug on css display
  $('.lock').click(() => { unlockItems(); });
}

function unlockItems() {
  var img = '<span class="fas fa-lock-open"></span>';
  $('.lock').replaceWith(`<button class="lock">${img}</button>`);
  $('.lock').css('display', 'block');
  $('.handle').css('display', 'block');
  $('.module').draggable({iframeFix: true, cursor: "move", containment : ".center"});

  /* Drag feature for touch devices */
  //TODO Tweak drag feature
  $('.module').on('touchmove', function(e) {
    var xPos = e.changedTouches[0].clientX;
    var offset = $('.center').width() - $('.handle').width();
    if (xPos > 0 && xPos < offset) {
      $('.module').css('left', xPos);
    }
  });

  $('.lock').click(() => { lockItems(); });
}

function getViewers() {
  modules.viewers = true;
  $.get(`https://decapi.me/twitch/viewercount/${user}`, (viewers) => {
    if (viewers == `${user} is offline`) {
      var img = '<span class="fas fa-video-slash"></span>'
      $('.viewers').replaceWith(`<div class="viewers">${img}</div>`);
    } else {
      var img = '<span class="fas fa-child"></span>'
      $('.viewers').replaceWith(`<div class="viewers">${img} ${viewers}</div>`);
      getUptime();
    }
  });
}

function getFollowers() {
  modules.followers = true;
  $.get(`https://decapi.me/twitch/followers/${user}`, (followers) => {
    var img = '<span class="fas fa-heart"></span>';
    $('.followers').replaceWith(`<div class="followers">${img} ${totalFollowers} (${followers})</div>`);
  });
}

function getViews() {
  modules.views = true;
  $.get(`https://decapi.me/twitch/total_views/${user}`, (views) => {
    var img = '<span class="fas fa-eye"></span>';
    $('.views').replaceWith(`<div class="views">${img} ${views}</div>`);
  });
}

function getTitle() {
  $.get(`https://decapi.me/twitch/status/${user}`, (title) => {
    $('.streamTitle').replaceWith(`<div class="streamTitle">${title}</div>`);
  })
}

function getGame() {
  $.get(`https://decapi.me/twitch/game/${user}`, (game) => {
    var img = '<span class="fas fa-gamepad"></span>';
    $('.streamGame').replaceWith(`<div class="streamGame">${img} ${game}</div>`);
  })
}

function getUptime() {
  $.get(`https://decapi.me/twitch/uptime/${user}`, (uptime) => {
    if (uptime == 'A channel user has to be specified.') {
      $('.uptime').text('');
    } else {
      var img = '<span class="fas fa-clock"></span>';
      $('.uptime').replaceWith(`<div class="uptime">${img}</div>`);
      var splitted = uptime.split(' ');
      var hours = (splitted[0] < 10 ? '0': '') + splitted[0];
      var minutes = (splitted[2] < 10 ? '0': '') + splitted[2];
      $('.fa-clock').text(` ${hours}h${minutes}m`);
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

function getLastHighLight() {
  var url = `https://decapi.me/twitch/highlight/${user}`;
}

function createVideo() {
  $('.center').append(`<div class="module video"></div>`);
  getVideo();
}

function createChat() {
  $('.center').append(`<div class="module chat"></div>`);
  getChat();
}

function createViews() {
  modules.twitchViews = true;
  $('.bottom').append(`<div class="views"></div>`);
  getViews();
}

function createUptime() {
  modules.twitchUptime = true;
  $('.bottom').append(`<div class="uptime"></div>`);
}

function createViewers() {
  modules.twitchViewers = true;
  $('.bottom').append(`<div class="viewers"></div>`);
  getViewers();
}

function createFollowers() {
  modules.twitchFollowers = true;
  $('.bottom').append(`<div class="followers"></div>`);
  getFollowers();
}

function removeVideo() {
  modules.twitchVideo = false;
  $('.video').remove();
}
function removeClips() {
  modules.twitchClips = false;
  $('.clips').remove();
}
function removeChat() {
  modules.twitchChat = false;
  $('.chat').remove();
}
function removeUptime() {
  modules.uptime = false;
  $('.uptime').remove();
}
function removeViews() {
  modules.views = false;
  $('.views').remove();
}
function removeViewers() {
  modules.viewers = false;
  $('.viewers').remove();
}
function removeFollowers() {
  modules.followers = false;
  $('.followers').remove();
}

function starting() {
  $('.center').append('<div class="loading"></div>');
}

$(window).ready(() => {
  $('.loading').fadeOut(1000, () => { $('.loading').remove(); });
  $('.top, .bottom').fadeIn(400, () => { $('.top, .bottom').css('display', 'grid'); }); //Grid display still need to vertical align items

  getStatic();
  getPreferences();
  lockItems();
  updateModules();

  $('input:checkbox').change(function() {
    if ($(this).is(':checked')) {
      switch(this['className']) {
        case 'options-item-twitchVideo':
          createVideo();
          break;
        case 'options-item-twitchClips':
          createClips();
          break;
        case 'options-item-twitchChat':
          createChat();
          break;
        case 'options-item-uptime':
          createUptime();
          break;
        case 'options-item-views':
          createViews();
          break;
        case 'options-item-viewers':
          createViewers();
          break;
        case 'options-item-twitchFollowers':
          createFollowers();
          break;
      }
    }
    else {
      switch(this['className']) {
        case 'options-item-twitchVideo':
          removeVideo();
          break;
        case 'options-item-twitchClips':
          removeClips();
          break;
        case 'options-item-twitchChat':
          removeChat();
          break;
        case 'options-item-uptime':
          removeUptime();
          break;
        case 'options-item-views':
          removeViews();
          break;
        case 'options-item-viewers':
          removeViewers();
          break;
        case 'options-item-twitchFollowers':
          removeFollowers();
          break;
      }
    }
  });

  setInterval(function() { updateModules(); }, 1*60*1000);
});

starting();
