starting();

function starting() {
  $('body').append(`<div class="loading"><div class="gear"></div></div>`);
}

$(window).ready(() => {
  $('.loading').fadeOut(400, () => { $('.loading').hide(); });
  $('body').append(`
    <div class="login">
      <div class="loginTitle">
        <h1>Get the Best Streamer Tool</h1>
        <h2>The Ultimate Dashboard</h2>
      </div>
      <div class="twitchLogin">
        <button class="twitchLoginButton">
        <i class="fab fa-twitch"></i> connect with twitch
        </button>
      </div>
    </div>
  `);
  $('.login').fadeIn(1000, () => { $('.login').css('display', 'block'); });
  $('.twitchLoginButton').click(() => { validate(); });
});

function validate() {
  $('.login').fadeOut(400, () => { $('.login').hide(); });
  $('.loading').fadeIn(400, () => { $('.loading').show(); });
  clientID = "e37g4ru5n1o7f1g7ysspjfacb74rtr";
  var link = `https://id.twitch.tv/oauth2/authorize?client_id=${clientID}&redirect_uri=https://betterstreamerdashboard.netlify.com/welcomeback/&response_type=token+id_token&scope=openid+user:read:broadcast+bits:read+channel_check_subscription+channel_commercial+channel_editor+channel_subscriptions+chat:read&state=hopollo609ea11e793ae92361f002671`;
  $(location).attr("href", link);
}
