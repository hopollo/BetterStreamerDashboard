starting();

function starting() {
  $('.center').append('<div class="loading"><div class="gear"></div></div>');
}

$(window).ready(() => {
  $('.loading').fadeOut(1000, () => { $('.loading').hide(); });
  
  authenticate();
});

function authenticate() {
  let token = window.location.hash;
  token = token.split('=')[1];
  token = token.split('&')[0];
 
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.href);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  function parseJwt (token) {
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };

  const JWT = getUrlParameter('id_token');
  let decodedJWT = parseJwt(JWT);

  clientID = decodedJWT.aud;
  userAuth = "Bearer " + token;
  userOAuth = "OAuth " + token;
  userID = decodedJWT.sub;
  displayName = decodedJWT.preferred_username;

  logged();
}

let modules = {
  twitchVideo : false,
  twitchClips : true,
  twitchEvents : true,
  twitchChat: true,
  twitchUptime: true,
  twitchViews: true,
  twitchViewers: true,
  twitchFollowers: true,
}

function getStatic() {
  $('.top').append('<div class="streamTitle"></div>')
  $('.top').append('<div class="streamGame"></div>')
  $('.top').append('<div class="settings"></div>');
  $('.settings').append(`<button class="preferences"></button>`);
  $('.settings').append(`<button class="lock"></button>`);

  getUserAvatar();
}

function updateModules() {
  getTitleAndGame();
  getFollowers();
  
  if (modules.twitchClips) { getClips(); }
  if (modules.twitchViews) { getViews(); }
  if (modules.twitchViewers) { getViewers(); }
  if (modules.twitchEvents) { getEvents(); }
}

function getUserAvatar() {
  const token = {
    mode: 'cors',
    headers: { 'Authorization' : userAuth}
  };
 
  fetch(`https://api.twitch.tv/helix/users?login=${displayName}`, token)
    .then(res => res.json())
    .then(data => {
      $('.top').append(`<a href="https://www.twitch.tv/${displayName}" target="_blank"><img class="userLogo" src="${data.data[0].profile_image_url}" heigth="100%" width="100%"/></a>`);
    });
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
  const url = `https://api.twitch.tv/kraken/clips/top?channel=${displayName}`;

  const token = {
    mode: 'cors',
    headers: {
      'Accept' : 'application/vnd.twitchtv.v5+json',
      'Client-ID' : clientID
    }
  };

  fetch(url, token)
    .then(res => res.json())
    .then(data => {
      let results = data.clips.length;

      if (results != 0) {
        $('.defaultClip').remove();
        
        for (let i=0, len=results; i<len; i++) {
          let clipEmbedUrl = data.clips[i].embed_url;
          let clipThumbnail = data.clips[i].thumbnails.small;
          let clipViews = data.clips[i].views;
          let clipTitle = data.clips[i].title;
          clipTitle = (clipTitle).length > 20 ? clipTitle.substring(0, 16) + "..." : "" + clipTitle;
          let clipDuration = data.clips[i].duration;
          let clipCreator = data.clips[i].curator.display_name;
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

function getSettings() {
  /* SETTINGS PART */
  const img = '<span class="fas fa-cog"></span>';
  $('.preferences').replaceWith(`<button class="preferences">${img}</button>`);
  $('.preferences').css('display', 'block');
  $('.preferences').click(() => { showPreferences(); });
  
  $('.center').append(`<div id="settings" class="modal settings-modal"><div class="modal-content settings-content"><span class="close">&times;</span></div></div>`);
  $('.settings-content').append('<ul class="options"></ul>');
  $('.options').append(`
  <div class="twitch-options">
    <i class="fab fa-twitch options-family"></i>
    <li><input type="checkbox" class="options-item-twitchVideo"> Video</input></li>
    <li><input type="checkbox" class="options-item-twitchClips"> Clips</input></li>
    <li><input type="checkbox" class="options-item-twitchEvents" checked> Events</input></li>
    <li><input type="checkbox" class="options-item-twitchChat" checked> Chat</input></li>
    <li><input type="checkbox" class="options-item-uptime" checked> Uptime</input></li>
    <li><input type="checkbox" class="options-item-views" checked> Views</input></li>
    <li><input type="checkbox" class="options-item-viewers" checked> Viewers</input></li>
    <li><input type="checkbox" class="options-item-twitchFollowers" checked> Followers</input></li>
  </div>
  <div class="others-options">
  <i class="fas fa-key options-family"></i>
    <li>StreamElements JWT Token : <input type="text" class="options-item-streamElementsInfo"> <a href="https://streamelements.com/dashboard/account/channels" target="_blank" style="color: blue; text-decoration: underline;">get it here</a> <a href="https://cdn.discordapp.com/attachments/331192523856805890/521024152937824257/SEKeyTutorial.png" target="_blank"><i class="fas fa-question-circle" style="color:black;"></i></a></li>
  </div>
  <div class="optionnals-options">
  <i class="fas fa-cogs options-family"></i>
    <li style="display:none;">
      <p>Ligth-mode :</p>
      <input type="radio" id="classic" name="light" value="light" class="test1"> <label for="classic">Classic</label>
      <input type="radio" id="auto" name="light" value="auto" class="test1" checked> <label for="auto">Auto</label>
      <input type="radio" id="dark" name="light" value="dark" class="test1"> <label for="dark">Dark</label>
    </li>
    <li>
      <input type="checkbox" class="options-item-vibrations" checked> Event vibrations</input>
    </li>
    <span>New features soon, more info/report bugs : <a href="https://twitter.com/hopollotv" target="_blank" style="color:red;">@HoPolloTV</a></span>
  </div>`);

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
    saveData();
  });
}

function saveData() {
  if ($('.options-item-streamElementsInfo').val() != null || $('.options-item-streamElementsInfo').val() > 40) { 
    var jwt = $('.options-item-streamElementsInfo').val();
  }
  let video = $('.options-item-twitchVideo').is(':checked');
  let clips = $('.options-item-twitchClips').is(':checked');
  let events= $('.options-item-twitchEvents').is(':checked');
  let chat = $('.options-item-twitchChat').is(':checked');
  let uptime = $('.options-item-uptime').is(':checked');
  let views = $('.options-item-views').is(':checked');
  let viewers = $('.options-item-viewers').is(':checked');
  let followers = $('.options-item-twitchFollowers').is(':checked');
  let vibrations = $('.options-items-vibrations').is('checked');
  
  const userData = `SEToken=${jwt};Video=${video};Clips=${clips};Events=${events};Chat=${chat};Uptime=${uptime};Views=${views};Viewers=${viewers};Followers=${followers};Vibrations=${vibrations}`;
  //TODO ADD cookies to save user choises (windows positions);
  for (let i=0, len=userData.split(';').length; i < len; i ++) {
    document.cookie = `${userData.split(';')[i]}; expires=Thu, 1 Dec 2019 12:00:00 UTC`;
  }
}

function readData() {
  const cookieData = document.cookie;

  if (cookieData == '' || 
      !cookieData.includes("Video") && 
      !cookieData.includes("Clips") && 
      !cookieData.includes("Events") && 
      !cookieData.includes("Chat") && 
      !cookieData.includes("Uptime") && 
      !cookieData.includes("Views") && 
      !cookieData.includes("Viewers") && 
      !cookieData.includes("Followers"))
  { welcome(); return;}

  $('.options-item-streamElementsInfo').val(cookieData.split('SEToken=')[1].split(';')[0]);
  $('.options-item-twitchVideo').prop('checked', cookieData.includes("Video=true"));
  $('.options-item-twitchClips').prop('checked', cookieData.includes("Clips=true"));
  $('.options-item-twitchEvents').prop('checked', cookieData.includes("Events=true"));
  $('.options-item-twitchChat').prop('checked', cookieData.includes("Chat=true"));
  $('.options-item-uptime').prop('checked', cookieData.includes("Uptime=true"));
  $('.options-item-views').prop('checked', cookieData.includes("Views=true"));
  $('.options-item-viewers').prop('checked', cookieData.includes("Viewers=true"));
  $('.options-item-twitchFollowers').prop('checked', cookieData.includes("Followers=true"));
  $('.options-item-vibrations').prop('checked', cookieData.includes("Vibrations=true"))

  if (cookieData.includes("Video=true"))      { createVideo();     }
  if (cookieData.includes("Clips=true"))      { createClips();     }
  if (cookieData.includes("Events=true"))     { createEvents();    }
  if (cookieData.includes("Chat=true"))       { createChat();      }
  if (cookieData.includes("Uptime=true"))     { createUptime();    }
  if (cookieData.includes("Views=true"))      { createViews();     }
  if (cookieData.includes("Viewers=true"))    { createViewers();   }
  if (cookieData.includes("Followers=true"))  { createFollowers(); }
  if (cookieData.includes("Vibrations=true")) { createVibrations();  }
}

function showInfo() {
  $('.infos-modal').css('display', 'block');
  $('.titleLabel').attr('placeholder', 'Your stream title...');
  $('.gameLabel').attr('placeholder', 'Your stream game...');
  let typingGame;
  $('.gameLabel').keyup(() => { clearTimeout(typingGame); typingGame = setTimeout(() => { getGameImage(); }, 1500);});

  $('.fa-undo').click(() => { $('.titleLabel').val(''); })

  $('.submitInfo').click(() => {
    const titleToUpdate = $('.titleLabel').val();
    const gameToUpdate = $('.gameLabel').val();

    updateStreamInfo(titleToUpdate, gameToUpdate);
  });

  $('.close').click(() => {
    $('.modal').css('display', 'none');
  });
}

function lockItems() {
  $('.handle').css('display', 'none');
  const img = '<span class="fas fa-lock"></span>';
  $('.lock').replaceWith(`<button class="lock">${img}</button>`);
  $('.lock').css('display', 'block');

  $('.module').draggable({ disabled: true });
  $('.module').resizable({ disabled: true });
  //$('.center').sortable({ disabled: true, tolerance: "pointer", containment: ".center", grid: [3, 3], opacity: 0.5, revert: true });
  
  $('.lock').click(() => { unlockItems(); });
}

function unlockItems() {
  const img = '<span class="fas fa-lock-open"></span>';
  $('.lock').replaceWith(`<button class="lock">${img}</button>`);
  $('.lock').css('display', 'block');
  $('.handle').css('display', 'block');
  $('.module').draggable({ disabled: false, iframeFix: true, cursor: "move", containment : ".center", snap: true });
  const centerMinHeight = $('.center').height() / 2;
  const centerMinWidth = $('.center').width() / 3;
  $('.module').resizable({ disabled: false, minHeight: centerMinHeight, minWidth: centerMinWidth, containment: ".center" });

  /* Drag feature for touch devices */

  //TODO Tweak drag feature
  $('.module').on('touchstart', (e) => { //touchmove
    let xPos = e; //e.changedTouches[0].clientX;
    console.log(xPos);
    let window = (e.changedTouches[0].target.className).split(' ')[1] || e.changedTouches[0].target.offsetParent.className.split(' ')[1];
    let windowWidth = e.changedTouches[0].target.clientWidth;
    let offset = $('.center').width() - windowWidth;
    if (xPos > 0 && xPos < offset) {
      $(`.${window}`).css('left', xPos);
    }
  });

  $('.lock').click(() => { lockItems(); });
}

function getChat() {
  $('.chat').replaceWith(`
  <div class="module chat">
    <div class="handle"></div>
    <iframe frameborder="0" scrolling="true" id="chat_embed" src="https://www.twitch.tv/embed/${displayName}/chat"></iframe>
  </div>`);
}

function getViewers() {
  modules.viewers = true;
  $.get(`https://decapi.me/twitch/viewercount/${displayName}`, (viewers) => {
      if (viewers == `${displayName} is offline`) {
        const img = '<span class="fas fa-video-slash"></span>'
        $('.viewers').replaceWith(`<div class="viewers">${img}</div>`);
      } else {
        const img = '<span class="fas fa-child"></span>'
        $('.viewers').replaceWith(`<div class="viewers">${img} ${viewers}</div>`);
        getUptime();
      }
  });
}

function getFollowers() {
  modules.followers = true;
  const token = {
    mode: 'cors',
    headers: { 'Authorization' : userAuth}
  };

  fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userID}`, token)
    .then(res => res.json())
    .then(data => {
      if (modules.twitchFollowers) { 
        const totalFollowers = data.total;
        $('.followers').replaceWith(`<div class="followers"><span class="fas fa-heart"> ${totalFollowers}</span></div>`);
      }
    });
}

var eventList = [];

function addStreamEvent(avatar, name, type, id, message) {
  if (eventList.includes(id)) { 
    console.log(`Already exsit : ${id} ${name} ${type}`); 
    return;
  }

  eventList.push(id);

  if (message == null || message.length < 1) {
    message = "";
  } else {
    message = `<i class="fas fa-quote-left" style="color:grey;"></i> ${message} <i class="fas fa-quote-right" style="color:grey;"></i>`;
  }

  navigator.vibrate(200);
  
  const userTwitchChannelLink = `https://www.twitch.tv/${name}`;

  $('.events').append(`
    <div class="event-container">
      <div class="event-author-info">
        <img class="event-author-avatar">
        <div class="event-author-name"><a style="color:inherit;" href="${userTwitchChannelLink}" target="_blank">${name}</a></div>
        <div class="event-author-type">${type}</div>
        <div class="event-author-message">${message}</div>
      </div>
    </div>`);
  $('.event-author-avatar:last').attr({'src': avatar, 'onclick' : `window.open('${userTwitchChannelLink}')`}).css('cursor', 'pointer');
}

function getViews() {
  modules.views = true;
  fetch(`https://decapi.me/twitch/total_views/${displayName}`)
    .then(res => res.json())
    .then(views => {
      const img = '<span class="fas fa-eye"></span>';
      $('.views').replaceWith(`<div class="views">${img} ${views}</div>`);
    })
    .catch(err => console.error(err))
}

function getTitleAndGame() {
  fetch(`https://decapi.me/twitch/status/${displayName}`)
    .then(res => res.text())
    .then(title => {
      $('.streamTitle').replaceWith(`<div class="streamTitle">${title} <i class="fas fa-pen edit"></i></div>`);
      
      fetch(`https://decapi.me/twitch/game/${displayName}`)
      .then(res => res.text())
      .then(game => {
        const img = '<a class="gameInfoLink" href="" target="_blank"><i class="fas fa-gamepad"></i></a>';
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
  const loadingGif = "https://i.redd.it/ounq1mw5kdxy.gif"
  let currentGame = $('.gameLabel').val();
  $('.game-label-state').replaceWith(`<i class="game-label-state"><img class="game-image-loading"src="${loadingGif}" height="16px" width="16px"></i>`);
  const settings = {
    headers : {
      "Client-ID" : clientID
    }
  }

  if (currentGame != null) {
    $('.game-image-thumbnail').attr('src', `${loadingGif}`);

    fetch(`https://api.twitch.tv/helix/games?name=${currentGame}`, settings)
      .then(res => res.json())
      .then(data => {
        let gameImage = data.data[0].box_art_url;
        const gameRealName = data.data[0].name;
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
  let settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://api.twitch.tv/kraken/channels/${userID}`,
    "method": "PUT",
    "headers": {
      "Client-ID": clientID,
      "Accept": "application/vnd.twitchtv.v5+json",
      "Authorization": userOAuth,
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
      const img = '<span class="fas fa-clock"></span>';
      $('.uptime').replaceWith(`<div class="uptime">${img}</div>`);
      const splitted = uptime.split(' ');
      let hours = (splitted[0] < 10 ? '0': '') + splitted[0];
      let minutes = (splitted[2] < 10 ? '0': '') + splitted[2];
      $('.fa-clock').text(` ${hours}h${minutes}m`);
    }
  });
}

function getEvents() {
  let SEJWTToken = $('.options-item-streamElementsInfo').val();

  if (SEJWTToken == null || SEJWTToken < 40) { 
    $('.options-item-streamElementsInfo').css('border', '1px red solid'); 
    return;
  }

  $('.options-item-streamElementsInfo').css('border', '1px green solid');
  
  function parseJwt (SEJWTToken) {
    const base64Url = SEJWTToken.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };

  const decodedJWT = parseJwt(SEJWTToken);

  const SEChannelID = decodedJWT.channel;

  // Credits to LX from SE team
  let url = `https://api.streamelements.com/kappa/v2/activities/${SEChannelID}?types=["follow", "tip", "host", "subscriber", "cheer", "raid"]&limit=15`;
  let token = {
    headers: {
      'Host' : 'api.streamelements.com',
      'Authorization' : 'Bearer ' + SEJWTToken
    }
  };

  fetch(url, token)
    .then(res => res.json())
    .then(data => {
      let results = data.length;
      console.log('INTERROGATION DES EVENTS'); //REMOVE THIS

      if (results != 0) {
        $('.defaultEvent').remove();
        for (let i=0, len=results; i < len; i++) {
          let eventAvatar = data[i].data.avatar;
          let eventAuthor = data[i].data.username;
          let eventType = data[i].type;
          switch (eventType) {
            case 'tip':
              const amount = data[i].data.amount;
              const currency = data[i].data.currency;
              eventType = `<i class="fas fa-money-bill-wave-alt"></i> ${amount} ${currency}`;  
              break;
            case 'host':
            case 'raid':
              const viewersAmount = data[i].data.amount;
              eventType = `${eventType} <i class="far fa-eye"></i> ${viewersAmount}`;
              break;
            default:
              break;
          }
          let message = data[i].data.message;
          let eventID = data[i]._id;
          addStreamEvent(eventAvatar, eventAuthor, eventType, eventID, message);
        }
      }
    })
    .catch(err => console.error(err))
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
  modules.twitchEvents = true;
  $('.center').append(`
    <div class="module events">
      <div class="handle"></div>
    </div>`);
  
  if ($('.options-item-streamElementsInfo').val().length > 30) {
    $('.events').append(`<div class="defaultEvent" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align: center;">No events yet or invalid StreamElements JWT Token.</div>`);
  } else {
    $('.events').append(`<div class="defaultEvent" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align: center;">StreamElements JWT Token not configured.</div>`);
  }
  getEvents();
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
function createVibrations() {
  //TODO finish to implement vibration
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
  eventList = [];
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

function applyClassicMode() {

}

function applyAutoMode() {

}

function applyDarkMode() {

}

function welcome() {
  $('.settings').hide();
  $('.streamTitle').remove();
  $('.streamGame').remove();

  $('.center').append(`<div class="welcome" 
  style="
  position: absolute;
  top:50%; left:50%;
  transform:translate(-50%,-50%);
  border-right: .20em solid red;
  background: #2c2c2c;
  letter-spacing: .15em;
  "></div>`)
  $('.welcome').append(`<h1 style="color:white;">Hey <span style="color:red;">${displayName}</span>, welcome to BetterStreamerDashboard aka BSD ! Let's customize your dashboard !</h1>`);
  $('.welcome').append(`<button class="startButton" style="width: 8em; height: 3em; border: none; border-radius: 12px; font-weight: 800; font-size: 1em; color:white; background: red;">Start</button>`);
  $('.startButton').click(() => {
    showPreferences();
  });
  $('.close').click(() => {
    $('.welcome').remove();
    location.reload();
  });
}

function logged() {
  $('.loading').fadeOut(400, () => { $('.loading').remove(); });
  $('.login').fadeOut(400, () => { $('.login').remove(); });
  $('.top, .bottom').fadeIn(400);
  
  getStatic();
  getSettings();
  readData();
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

  $('input:radio').change(function() {
    switch(this['id']) {
      case 'classic':
        applyClassicMode();
        break;
      case 'auto':
        applyAutoMode();
        break;
      case 'dark':
        applyDarkMode();
        break;
    }
  });

  setInterval(() => { updateModules(); }, 1*60*1000);
}
