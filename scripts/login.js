window.fbAsyncInit = function() {
    FB.init({
      appId      : '140711213239353',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.11'
    });
      
    FB.AppEvents.logPageView();

    FB.getLoginStatus(function(response) {
	    statusChangeCallback(response);
	});
      
  };

function checkLoginState() {
	FB.getLoginStatus(function(response) { 
		statusChangeCallback(response); 
	});
}

function statusChangeCallback(response) {
	console.log(response);
	if (response.status === 'connected') {
		window.userID = response.authResponse.userID;
		window.accessToken = response.authResponse.accessToken;
		window.location.replace('/index.html');
	}
}

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.11&appId=140711213239353';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));