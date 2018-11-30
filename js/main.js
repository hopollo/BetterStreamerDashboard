var url = new URL(window.location.href);
var user = url.searchParams.get('name');
var userID;
var avatar;
var followers;
var client_id = 'tz2timwcbqtsagu0a8oo11xp849hxo';

function getTwitchInfo() {
  var token = {
    headers: {'Client-ID' : client_id}
  };
 
  fetch(`https://api.twitch.tv/helix/users?login=${user}`, token)
    .then(res => res.json())
    .then(data => {
      $('.userLogo').replaceWith(`<div class="userLogo"><img src="${data.data[0].profile_image_url}" heigth="100%" width="100%"/></div>`);  
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

function getPreferences() {
  var img = '<span class="fas fa-cog"></span>';
  $('.preferences').replaceWith(`<button class="preferences">${img}</button>`);
  $('.preferences').css('display', 'block');
  $('.preferences').click(() => { showPreferences(); });
  $('.center').append('<div id="myModal" class="modal"><div class="modal-content"><span class="close">&times;</span></div></div>');
  $('.modal-content').append('<ul class="options"></ul>');

  //TODO add all basic features line per line
  /*
  $('.options').append('<input type="checkbox" class="options-item" checked> Twitch Chat</input>');
  $('.options').append('<input type="checkbox" class="options-item" checked> Twitch Uptime</input>');
  $('.options').append('<input type="checkbox" class="options-item" checked> Twitch Views</input>');
  $('.options').append('<input type="checkbox" class="options-item" checked> Twitch Viewers</input>');
  $('.options').append('<input type="checkbox" class="options-item" checked> Twitch Followers</input>');
  */
  $('.modal-content').append('<div class="donate"><a href="https://streamelements.com/hopollo/tip" target="_blank"><button class="donate-button"><span class="fas fa-piggy-bank"></span> Donate</button></a></donate>');
  $('.options').append('<span>New features soon, more info : <a href="https://twitter.com/hopollotv" target="_blank">@HoPolloTV</a></span>');
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
  $('#drag-tchat').draggable({iframeFix: true, cursor: "move", containment : ".center"});

  /* Drag feature for touch devices */
  //TODO Tweak drag feature
  $('#drag-tchat').on('touchmove', function(e) {
    var xPos = e.changedTouches[0].clientX;
    var offset = $('.center').width() - $('.handle').width();
    if (xPos > 0 && xPos < offset) {
      $('#drag-tchat').css('left', xPos);
    }
  });

  $('.lock').click(() => { lockItems(); });
}

function getViewers() {
  $.get(`https://decapi.me/twitch/viewercount/${user}`, (viewers) => {
    if (viewers == `${user} is offline`) {
      var img = '<span class="fas fa-video-slash"></span>'
      $('.viewers').replaceWith(`<div class="viewers">${img}</div>`);
    } else {
      var img = '<span class="fas fa-child"></span>'
      $('.viewers').replaceWith(img);
      $('.fa-child').text(` ${viewers}`);
      getUptime();
    }
  });
}

function getFollowers() {
  $.get(`https://decapi.me/twitch/followers/${user}`, (followers) => {
    var img = '<span class="fas fa-heart"></span>';
    $('.followers').replaceWith(`<div class="followers">${img}</div>`);
    $('.fa-heart').text(`${totalFollowers} (${followers})`);
  });
}

function getViews() {
  $.get(`https://decapi.me/twitch/total_views/${user}`, (views) => {
    var img = '<span class="fas fa-eye"></span>';
    $('.views').replaceWith(`<div class="views">${img}</div>`);
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
    $('.streamGame').replaceWith(`<div class="streamGame">${img}</div>`);
    $('.fa-gamepad').text(` ${game}`);
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

function starting() {
  $('.center').append('<div class="loading"></div>');
}

$(window).ready(() => {
  $('.loading').fadeOut(1000, () => { $('.loading').remove(); });
  $('.top, .bottom').fadeIn(400, () => { $('.top, .bottom').css('display', 'grid'); }); //Grid display still need to vertical align items
  $('.center').append(`<div id="drag-tchat" class="ui-widget-content"><div class='handle'></div><iframe frameborder="0" scrolling="true" id="chat_embed" src=""></iframe></div>`);
  $('.settings').append(`<button class="preferences"></button>`);
  $('.settings').append(`<button class="lock"></button>`);

  getPreferences();
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
