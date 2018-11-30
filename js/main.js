var url = new URL(window.location.href);
var user = url.searchParams.get('name') || 'hopollo';
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

function getRequestedModules() {
  getTwitchInfo();
  getGame();
  getTitle();

  if (modules.twitchVideo && modules.twitchChat && modules.twitchClips) { getFullEmbed(); }
  if (modules.twitchVideo) { getVideo(); }
  if (modules.twitchClips) { getClips(); }
  if (modules.twitchChat) { getChat(); }
  if (modules.twitchViews) { getViews(); }
  if (modules.twitchViewers) { getViewers(); }
  if (modules.getActivities) { getActivities(); }
}

function updateRequestedModules() {

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
}

function getClips() {
  var url = `https://api.twitch.tv/kraken/clips/top?limit=1&channel=moonmoon_ow`;
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
  $('.center').append(`
  <div class="chat" class="ui-widget-content">
    <div class='handle'></div>
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
  
  //$('.options').append(`<li><input type="checkbox" class="options-item-twitchVideo"> Twitch Video</input></li>`);
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
  $('.chat').draggable({iframeFix: true, cursor: "move", containment : ".center"});

  /* Drag feature for touch devices */
  //TODO Tweak drag feature
  $('.chat').on('touchmove', function(e) {
    var xPos = e.changedTouches[0].clientX;
    var offset = $('.center').width() - $('.handle').width();
    if (xPos > 0 && xPos < offset) {
      $('.chat').css('left', xPos);
    }
  });

  $('.lock').click(() => { lockItems(); });
}

function getViewers() {
  $.get(`https://decapi.me/twitch/viewercount/${user}`, (viewers) => {
    if (viewers == `${user} is offline`) {
      var img = '<span class="fas fa-video-slash"></span>'
      $('.bottom').append(`<div class="viewers">${img}</div>`);
    } else {
      var img = '<span class="fas fa-child"></span>'
      $('.bottom').append(`<div class="viewers">${img} ${viewers}</div>`);
      getUptime();
    }
  });
}

function getFollowers() {
  $.get(`https://decapi.me/twitch/followers/${user}`, (followers) => {
    var img = '<span class="fas fa-heart"></span>';
    $('.bottom').append(`<div class="followers">${img} ${totalFollowers} (${followers})</div>`);
  });
}

function getViews() {
  $.get(`https://decapi.me/twitch/total_views/${user}`, (views) => {
    var img = '<span class="fas fa-eye"></span>';
    $('.bottom').append(`<div class="views">${img} ${views}</div>`);
  });
}

function getTitle() {
  $.get(`https://decapi.me/twitch/status/${user}`, (title) => {
    $('.top').append(`<div class="streamTitle">${title}</div>`);
  })
}

function getGame() {
  $.get(`https://decapi.me/twitch/game/${user}`, (game) => {
    var img = '<span class="fas fa-gamepad"></span>';
    $('.top').append(`<div class="streamGame">${img} ${game}</div>`);
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
      $('.fa-clock').text(` ${hours}:${minutes}`);
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

function removeVideo() {
  $('.video').remove();
}
function removeClips() {
  $('.clips').remove();
}
function removeChat() {
  $('.chat').remove();
}
function removeUptime() {
  $('.uptime').remove();
}
function removeViews() {
  $('.views').remove();
}
function removeViewers() {
  $('.viewers').remove();
}
function removeFollowers() {
  $('.followers').remove();
}

function starting() {
  $('.center').append('<div class="loading"></div>');
}

$(window).ready(() => {
  $('.loading').fadeOut(1000, () => { $('.loading').remove(); });
  $('.top, .bottom').fadeIn(400, () => { $('.top, .bottom').css('display', 'grid'); }); //Grid display still need to vertical align items
  $('.top').append('<div class="settings"></div>');
  $('.settings').append(`<button class="preferences"></button>`);
  $('.settings').append(`<button class="lock"></button>`);

  getPreferences();
  lockItems();
  getRequestedModules();

  $('input:checkbox').change(function() {
    if ($(this).is(':checked')) {
      switch(this['className']) {
        case 'options-item-twitchVideo':
          getVideo();
          break;
        case 'options-item-twitchClips':
          getClips();
          break;
        case 'options-item-twitchChat':
          getChat();
          break;
        case 'options-item-uptime':
          getUptime();
          break;
        case 'options-item-views':
          getViews();
          break;
        case 'options-item-viewers':
          getViewers();
          break;
        case 'options-item-twitchFollowers':
          getFollowers();
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

  setInterval(function() { updateRequestedModules(); }, 1*60*1000);
});

starting();
