starting();

function starting() {
  $('.center').append('<div class="loading"><div class="gear"></div></div>');
}

$(window).ready(() => {
  $('.loading').fadeOut(1000, () => { $('.loading').hide(); });
  
  authenticate();
});

function authenticate() {
  /* Decompose token (token) */
  var token = window.location.hash;
  token = token.split('=')[1];
  token = token.split('&')[0];
 
  /* Decompose JWT (id_token) */
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.href);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };

  var JWT = getUrlParameter('id_token');
  var decodedJWT = parseJwt(JWT);

  clientID = decodedJWT.aud;
  userAuth = "Bearer " + token;
  userID = decodedJWT.sub;
  displayName = decodedJWT.preferred_username;
  /*
  if (decodedJWT.aud != null && decodedJWT.sub != null && decodedJWT.preferred_username != null) {
    logged();
  } else {
    //redirect to auth if needed
    var currentLink = window.location.href;
    $(location).attr("href", currentLink + 'auth');
  }
  */

  logged();
}

var modules = {
  twitchVideo : false,
  twitchClips : true,
  twitchEvents : true,
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

  getUserAvatar();
  createChat();
  createEvents();
  createFollowers();
  createUptime();
  createViewers();
  createViews();
}

function updateModules() {
  getTitleAndGame();
  getFollowers();

  if (modules.twitchClips) { getClips(); }
  if (modules.twitchViews) { getViews(); }
  if (modules.twitchViewers) { getViewers(); }
  if (modules.getActivities) { getActivities(); }
}

function getUserAvatar() {
  var token = {
    mode: 'cors',
    headers: { 'Authorization' : userAuth}
  };
 
  fetch(`https://api.twitch.tv/helix/users?login=${displayName}`, token)
    .then(res => res.json())
    .then(data => {
      $('.top').append(`<div class="userLogo"><a href="https://www.twitch.tv/${displayName}" target="_blank"><img src="${data.data[0].profile_image_url}" heigth="100%" width="100%"/></a></div>`);
    });
}

function getFullEmbed() {
  defaultTheme = "dark";
}

function getVideo() {
  $('.video').replaceWith(`
  <div class="module video">
    <div class="handle"></div>
    <iframe src="https://player.twitch.tv/?channel=${displayName}" 
      frameborder="0" 
      allowfullscreen="true" 
      scrolling="no" 
      height="100%" 
      width="100%">
    </iframe>
  </div>`);
}

function getClips() {
  var limit = 3;
  var period = "all";
  
  var url = `https://api.twitch.tv/kraken/clips/top?channel=${displayName}`;

  var token = {
    mode: 'cors',
    headers: {
      'Accept' : 'application/vnd.twitchtv.v5+json',
      'Client-ID' : clientID
    }
  };

  fetch(url, token)
    .then(res => res.json())
    .then(data => {
      var results = data.clips.length;

      if (results != 0) {
        $('.defaultClip').remove();
        
        for (var i=0, len=results; i<len; i++) {
          var clipEmbedUrl = data.clips[i].embed_url;
          var clipThumbnail = data.clips[i].thumbnails.small;
          var clipViews = data.clips[i].views;
          var clipTitle = data.clips[i].title;
          clipTitle = (clipTitle).length > 20 ? clipTitle.substring(0, 16) + "..." : "" + clipTitle;
          var clipDuration = data.clips[i].duration;
          var clipCreator = data.clips[i].curator.display_name;
          clipCreator = (clipCreator.length) > 15 ? clipCreator.substring(0, 10) + "..." : "" + clipCreator;

          $('.clipsList').prepend(`
            <li><a href="${clipEmbedUrl}" target="_blank"><img src="${clipThumbnail}"></img></a>
            <div class="clipTitle">${clipTitle}</div>
            <div class="clipCreatorName">By : <a style="color:inherit;" href="https://twitch.tv/${clipCreator}" target="_blank">${clipCreator}</a> • ${clipDuration}s • <i class="fas fa-eye"></i> ${clipViews}</div>
            </li>`
          );
        }
      }
    });
}

function getChat() {
  $('.chat').replaceWith(`
  <div class="module chat">
    <div class="handle"></div>
    <iframe frameborder="0" scrolling="true" id="chat_embed" src="https://www.twitch.tv/embed/${displayName}/chat"></iframe>
  </div>`);
}

function getSettings() {

  /* SETTINGS PART */
  var img = '<span class="fas fa-cog"></span>';
  $('.preferences').replaceWith(`<button class="preferences">${img}</button>`);
  $('.preferences').css('display', 'block');
  $('.preferences').click(() => { showPreferences(); });
  
  $('.center').append(`<div id="settings" class="modal settings-modal"><div class="modal-content settings-content"><span class="close">&times;</span></div></div>`);
  $('.settings-content').append('<ul class="options"></ul>');
  
  $('.options').append(`<li><input type="checkbox" class="options-item-twitchVideo"> Twitch Video</input><span class="new">new</span></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-twitchClips"> Twitch Clips</input><span class="new">new</span></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-twitchEvents" checked> Twitch Events</input><span class="new">new</span></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-twitchChat" checked> Twitch Chat</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-uptime" checked> Twitch Uptime</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-views" checked> Twitch Views</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-viewers" checked> Twitch Viewers</input></li>`);
  $('.options').append(`<li><input type="checkbox" class="options-item-twitchFollowers" checked> Twitch Followers</input></li>`);

  $('.options').append('<span>New features soon, more info/report bugs : <a href="https://twitter.com/hopollotv" target="_blank">@HoPolloTV</a></span>');  
  $('.settings-content').append('<div class="button-container"><a href="https://streamelements.com/hopollo/tip" target="_blank"><button class="button"><span class="fas fa-piggy-bank"></span> Donate</button></a></donate>');

  /* STREAM INFO PART */
  $('.center').append(`<div id="streamInfo" class="modal infos-modal"><div class="modal-content infos-content"><span class="close">&times;</span></div></div>`);
  $('.infos-content').append(`
    <div class="streamInfoContainer">
      <form class="streamInfo">
        <ul class="options">
          <li><label>Title</label></li>
          <li><input class="titleLabel" type="text"> <i class="fas fa-undo" style="cursor:pointer;"></i></li>          
          <li><label>Game</label></li>
          <li><input class="gameLabel" type="text"> <i class="game-label-state"></i></li>
        </ul>
        <div class="game-image-container>
          <a class="game-image-link" href=""><img class="game-image-thumbnail" src=""></a>
        </div>
        
        <div class="button-container"><input class="submitInfo button" type="submit" value="Submit"></div>
      </form>
    </div>
  `);
}

function showPreferences() {
  $('.settings-modal').css('display', 'block');

  $('.close').click(() => {
    $('.modal').css('display', 'none');
  });
}

function showInfo() {
  $('.infos-modal').css('display', 'block');
  $('.titleLabel').attr('placeholder', 'Your stream title...');
  $('.gameLabel').attr('placeholder', 'Your stream game...');
  var i = 0;
  $('.gameLabel').keydown(() => { i++; setTimeout(() => { getGameImage(); }, i * 100); });

  $('.fa-undo').click(() => { $('.titleLabel').val(''); })

  //var titleSeparator = $('.titleSeparator').val();
  //var suffixTitleToUpdate = ($('.titleSuffix').val()).length < 1 && (titleSeparator.length > 0) ? $('.titleSuffix').val($('.titleLabel').val().split(`${titleSeparator}`)[1]) : $('.titleSuffix').val();
  //var titleToUpdate = ($('.titleLabel').val()).length > 0 && (titleSeparator.length > 0) ? $('.titleLabel').val($('.titleLabel').val().split(`${titleSeparator}`)[0]) : $('.titleLabel').val();
  //var suffixTitleToUpdate = $('.titleSuffix').val();

  

  $('.submitInfo').click(() => {
    var titleToUpdate = $('.titleLabel').val();
    var gameToUpdate = $('.gameLabel').val();
    
    //updateStreamInfo(titleToUpdate, gameToUpdate, suffixTitleToUpdate, titleSeparator);
    updateStreamInfo(titleToUpdate, gameToUpdate);
  });

  $('.close').click(() => {
    $('.modal').css('display', 'none');
  });
}

function lockItems() {
  $('.handle').css('display', 'none');
  var img = '<span class="fas fa-lock"></span>';
  $('.lock').replaceWith(`<button class="lock">${img}</button>`);
  $('.lock').css('display', 'block');

  $('.module').draggable({disabled: true});
  
  $('.lock').click(() => { unlockItems(); });
}

function unlockItems() {
  var img = '<span class="fas fa-lock-open"></span>';
  $('.lock').replaceWith(`<button class="lock">${img}</button>`);
  $('.lock').css('display', 'block');
  $('.handle').css('display', 'block');
  $('.module').draggable({ disabled: false, iframeFix: true, cursor: "move", containment : ".center" });

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

function saveItemData() {
  //TODO ADD cookies to save user choises;
  //gets Enabled windows + positions
  document.cookie = "";
}

function readItemData() {
  //TODO ADD cookes reading info and redisplay them
}

function getViewers() {
  modules.viewers = true;
  $.get(`https://decapi.me/twitch/viewercount/${displayName}`, (viewers) => {
      if (viewers == `${displayName} is offline`) {
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
  var eventType = "Follow";
  var totalFollowers;
  var token = {
    mode: 'cors',
    headers: { 'Authorization' : userAuth}
  };

  fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userID}`, token)
    .then(res => res.json())
    .then(data => {
      if (modules.twitchFollowers) { 
        totalFollowers = data.total;
      }

      $.get(`https://decapi.me/twitch/followers/${displayName}`, (follower) => {
      var img = '<span class="fas fa-heart"></span>';
      $('.followers').replaceWith(`<div class="followers">${img} ${totalFollowers} <a href="https://www.twitch.tv/${follower}" target="_blank">(${follower})</a></div>`);
      addStreamEvent(follower, eventType);
    });
  });
}

var followList = [];

function addStreamEvent(name,type) {
  var timestamps = new Date();
  var hours = (timestamps.getHours() < 10 ? '0': '') + timestamps.getHours();
  var minutes = (timestamps.getMinutes() < 10 ? '0': '') + timestamps.getMinutes();
  timestamps = `${hours}h${minutes}`;
  
  if (followList.includes(name)) { return }

  followList.push(name);

  var token = {
    mode: 'cors',
    headers: { 'Authorization' : userAuth}
  };

  fetch(`https://api.twitch.tv/helix/users?login=${name}`, token)
    .then(res => res.json())
    .then(data => {
      var followerAvatar = data.data[0].profile_image_url;
        $('.events').prepend(`
          <div class="event-container">
            <div class="event-author-info">
            <a href="https://www.twitch.tv/${name}" target="_blank"><img class="event-author-avatar" src=""></a>
            <div class="event-author-name"><a style="color:inherit;" href="https://www.twitch.tv/${name}" target="_blank">${name}</a></div>
            <div class="event-author-type">${type}</div>
            <div class="event-author-timer">${timestamps}<div>
          </div>
        </div>
        `);
        $('.event-author-avatar:first').attr('src', followerAvatar);
    });
}

function getViews() {
  modules.views = true;
  $.get(`https://decapi.me/twitch/total_views/${displayName}`, (views) => {
      var img = '<span class="fas fa-eye"></span>';
      $('.views').replaceWith(`<div class="views">${img} ${views}</div>`);
  });
}

function getTitleAndGame() {
  fetch(`https://decapi.me/twitch/status/${displayName}`)
    .then(res => res.text())
    .then(title => {
      $('.streamTitle').replaceWith(`<div class="streamTitle">${title} <i class="fas fa-pen edit"></i></div>`);
      
      fetch(`https://decapi.me/twitch/game/${displayName}`)
      .then(res => res.text())
      .then(game => {
        var img = '<a class="gameInfoLink" href="" target="_blank"><i class="fas fa-gamepad"></i></a>';
        $('.streamGame').replaceWith(`<div class="streamGame">${img} ${game} <i class="fas fa-pen edit"></i></div>`);
        $('.gameInfoLink').attr('href', `https://www.twitch.tv/directory/game/${game}`);
        $('.edit').click(() => {
          $('.titleLabel').val(title);
          $('.gameLabel').val(game);
          showInfo();
        });
      })
      .catch(err => {
        $('.streamGame').replaceWith(`<div class="streamGame" style="color:red;">Error <i class="fas fa-pen edit"></i></div>`);
      })
    })
    .catch(err => {
      $('.streamTitle').replaceWith(`<div class="streamTitle" style="color:red;">Error <i class="fas fa-pen edit"></i></div>`);
    })
}

function getGameImage() {
  var currentGame = $('.gameLabel').val();
  $('.game-label-state').replaceWith('<i class="game-label-state"><img class="game-image-loading"src="https://i.stack.imgur.com/FhHRx.gif" height="16px" width="16px"></i>');
  settings = {
    headers : {
      "Client-ID" : clientID
    }
  }

  if (currentGame != null) {
    fetch(`https://api.twitch.tv/helix/games?name=${currentGame}`, settings)
      .then(res => res.json())
      .then(data => {
        var gameImage = data.data[0].box_art_url;
        var gameRealName = data.data[0].name;
        gameImage = gameImage.replace('-{width}x{height}', '');
        $('.game-image-link').attr('href', `https://www.twitch.tv/directory/game/${currentGame}`);
        $('.game-image-thumbnail').attr('src', gameImage);
        $('.gameLabel').val(gameRealName);
        $('.game-label-state').replaceWith('<i class="fas fa-check game-label-state" style="color:green;"></i>');
        $('.submitInfo').prop('disabled', false);
      })
      .catch(err => {
        $('.game-label-state').replaceWith('<i class="fas fa-exclamation-triangle game-label-state" style="color:red;"></i>');
        $('.game-image-thumbnail').attr('src', "https://risibank.fr/cache/stickers/d1097/109776-full.png");
        $('.submitInfo').prop('disabled', true);
      })
  }
}

//function updateStreamInfo(status, game, suffix, separator) {
function updateStreamInfo(status, game) {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://api.twitch.tv/kraken/channels/${userID}`,
    "method": "PUT",
    "headers": {
      "Client-ID": clientID,
      "Accept": "application/vnd.twitchtv.v5+json",
      "Authorization": "OAuth " + userAuth.substring(7),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    "data": {
      "channel[status]": status,
      "channel[game]": game
    }
  }
  
  $.ajax(settings).done(() => {
    $('.modal').css('display', 'none');
    getTitleAndGame();
  });
}

function getUptime() {
  $.get(`https://decapi.me/twitch/uptime/${displayName}`, (uptime) => {
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
  //TODO Integrate StreamElementsInfo
  //var url = `https://api.streamelements.com/kappa/v2/activities/${displayName}`; 
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
  var url = `https://decapi.me/twitch/highlight/${displayName}`;
}

function createVideo() {
  $('.center').append(`<div class="module video"></div>`);
  getVideo();
}
function createClips() {
  modules.twitchClips = true;
  $('.center').append(`
    <div class="module clips">
      <div class="handle"></div>
      <div class="clipsList">
        <div class="defaultClip">
          <div style="display:flex; justify-content:center; align-items: center;"<i class="fas fa-film"></i><div>
          <h1 style="color:black;">No clips yet</h1>
        </div>
      </div>
    </div>
  `);
  getClips();
}
function createEvents() {
  $('.center').append(`<div class="module events"></div>`);
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
function removeEvents() {
  modules.twitchEvents = false;
  $('.events').remove();
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

function logged() {
  $('.loading').fadeOut(400, () => { $('.loading').remove(); });
  $('.login').fadeOut(400, () => { $('.login').remove(); });
  $('.top, .bottom').fadeIn(400, () => { $('.top, .bottom').css('display', 'grid'); }); //Grid display still need to vertical align items

  getStatic();
  getSettings();
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
        case 'options-item-twitchEvents':
          createEvents();
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
        case 'options-item-twitchEvents':
          removeEvents();
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
}
