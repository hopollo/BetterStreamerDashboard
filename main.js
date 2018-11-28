function getViewers() {
  $.get('https://decapi.me/twitch/viewercount/shroud', (viewers) => {
    $('.viewers').innerHtml = viewers || '??';
  });
}

function getFollowers() {
  $.get('https://decapi.me/twitch/followers/hopollo', (followers) => {
    $('.followers').innerHtml = followers || '??';
  });
}

function getViews() {
  $.get('https://decapi.me/twitch/total_views/hopollo', (views) => {
    $('.views').innerHtml = views || '??';
  });
}

function getTitle() {
  $.get('https://decapi.me/twitch/title/hopollo', (title) => {
    $('.streamTitle').innerHtml = title || '...';
  })
}

function getGame() {
  $.get('https://decapi.me/twitch/game/hopollo', (game) => {
    $('.streamGame').innerHtml = game || "...";
  })
}

function getActivities() {
  $.get('https://api.streamelements.com/kappa/v2/activities/hopollo', (activities) => {
    $('.activities').innerHtml = activities;
  });
}

window.setInterval(() => {
  getViewers();
  getFollowers();
  getViews();
  getTitle();
  getActivities();
}, 2000);
