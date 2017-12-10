angular.module('lazHack6', ['firebase', 'ui.router'])
    .config(function(){

        var config = {
            apiKey: "AIzaSyD1UpC3qnghh_tnubRqRRaEAJ0-3yKY-eo",
            authDomain: "whiteboard-57ece.firebaseapp.com",
            databaseURL: "https://whiteboard-57ece.firebaseio.com",
            projectId: "whiteboard-57ece",
            storageBucket: "whiteboard-57ece.appspot.com",
            messagingSenderId: "233386822869"
        };

        firebase.initializeApp(config);
    });
