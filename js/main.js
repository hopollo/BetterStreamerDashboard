:root {
  --top-height: 8vh;
  --center-height: calc(100vh - var(--top-height) - var(--bottom-height));
  --bottom-height: 5vh;
  --link-color: red;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: rgb(44, 44, 44);
  max-width: 100vw;
  max-height: 100vh;
  grid-template-columns: repeat(4, 1f);
  grid-template-areas:
  "top top top top"
  "center center center center"
  "bottom bottom bottom bottom";
}

li { list-style: none; }

a {
  text-decoration: none;
  color: var(--link-color);
}

a:hover,
a:visited { color: var(--link-color); }

.top {
  display: none;
  font-weight: bold;
  justify-items: center;
  align-items: center;
  grid-area: top;
  grid-template-columns: var(--top-height) auto auto auto auto;
  grid-template-areas:
  "userLogo settings streamTitle streamTitle streamGame";
  height: var(--top-height);
  color: white;
  background: rgb(20, 20, 20);
}

.userLogo {
  grid-area: userLogo;
  height: 100%;
}

.settings {
  display: grid;
  grid-area: settings;
  grid-column-gap: 30px;
  grid-template-areas:
  "settings lock";
}

.preferences, .lock {
  display: none;
  height: var(--top-height);
  width: 50px;
}

.modal {
  display: none;
  position: fixed;
  z-index: 1;
  padding-top: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  position: relative;
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 60%;
}

.options { display: block; }

.donate {
  margin-left: auto;
  margin-right: auto;
  height: 50px;
  width: 90px;
}
.donate-button {
  height: 100%; 
  width: 100%;
}

.close {
  color: #aaaaaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

.streamTitle { grid-area: streamTitle; }

.streamGame { grid-area: streamGame; }

.center {
  display: grid;
  grid-area: center;
  height: var(--center-height);
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 10px solid #f3f3f3;
  border-radius: 50%;
  border-top: 10px solid #ff0000;
  height: 10vh;
  width: 10vh;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

.chat {
  cursor: move;
  position: relative;
  height: var(--center-height);
  width: calc(100vw/4);
  transform: translateY(50%, -50%);
}

.handle {
  display: none;
  position: absolute;
  width: 100%;
  height: 9%;
  background:darkgrey;
}

iframe {
  height: calc(var(--center-height) - 10px);
  width: 100%;
  height: 100%;
}

.bottom {
  display: none;
  grid-area: bottom;
  font-weight: bold;
  justify-items: center;
  align-items: center;
  height: var(--bottom-height);
  color: white;
  background: rgb(20,20,20);
  grid-template-columns: auto auto auto auto;
  grid-template-areas:
  "views uptime followers viewers";
}

.views { grid-area: views; }
.uptime { grid-area: uptime; }
.followers { grid-area: followers; }
.viewers { grid-area: viewers; }

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(720deg); }
}

/* IPADs */
@media only screen and (max-width : 1050px) and (max-height : 1400px) {
  :root {
    --top-height: 6vh;
    --center-height: calc(100vh - var(--top-height) - var(--bottom-height));
    --bottom-height: 5vh;
  }
  
  .top {
    height: var(--top-height);
    grid-template-columns: 80px auto auto auto auto;
  }

  .userLogo {
    height: 100%;
    width: auto;
  }

  .preferences, .lock { width: 85px; }

  #drag-tchat {
    width: 100vw;
    height: 80%;
  }

  .handle { height: 5%; }
}

@media only screen and (max-width : 1400px) and (max-height : 1024px) {
  :root {
    --top-height: 6vh;
    --center-height: calc(100vh - var(--top-height) - var(--bottom-height));
    --bottom-height: 5vh;
  }
  
  .top { height: var(--top-height); }

  #drag-tchat {
    width: calc(100vw/1.5);
    height: calc(100vh - 6vh - var(--bottom-height));
  }
}

/* POPULAR smartphones */
@media only screen and (max-width : 850px) and (max-height : 420px) {
  .top { grid-template-columns: 20px auto auto auto auto;}
  
  .userLogo {
    height: 100%;
    width: auto;
  }

  .settings { grid-column-gap: 20px; }
  .preferences, .lock { width: 40px; }
  .handle { height: 15%; }
}

@media only screen and (max-width : 420px) and (max-height : 850px) {
  :root { --top-height: 40px; }
  
  .top {
    height: var(--top-height);
    grid-template-columns: 40px auto auto auto auto;
  }

  .settings { grid-column-gap: 5px; }
  .streamTitle { display: none; }

  #drag-tchat { /* tchat */
    width: 100vw;
    height: 70vh;
  }

  .views { display: none; }

  .userLogo {
    height: var(--top-height);
    width: auto;
  }

  .handle { height: 50px; }
}
