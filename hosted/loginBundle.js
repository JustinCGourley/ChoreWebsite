"use strict";

//handles login button press
var handleLogin = function handleLogin(e) {
    e.preventDefault();

    $("#domoMessage").animate({ height: 'hide' }, 350);
    if ($("#user").val() == '' || $("#pass").val() == '') {
        handleError("username or password is wrong!");
        return false;
    }
    //sends post to server to login
    sendAjax('POST', $('#loginForm').attr("action"), $('#loginForm').serialize(), redirect);
    return false;
};
//handles signup button press
var handleSignup = function handleSignup(e) {
    e.preventDefault();

    $("#domoMessage").animate({ height: 'hide' }, 350);
    if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        handleError("All fields are required.");
        return false;
    }

    if ($("#pass").val() == '' != $("#pass2").val() == '') {
        handleError("Passwords do not match");
        return false;
    }

    //sends post to server to sign up
    sendAjax('POST', $('#signupForm').attr("action"), $('#signupForm').serialize(), redirect);
    return false;
};

//view for login window
var LoginWindow = function LoginWindow(props) {
    return React.createElement(
        "form",
        { id: "loginForm", name: "loginForm",
            onSubmit: handleLogin,
            action: "/login",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "username" },
            "Username: "
        ),
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" }),
        React.createElement(
            "label",
            { htmlFor: "pass" },
            "Password: "
        ),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign in" })
    );
};

//view for signup window
var SignupWindow = function SignupWindow(props) {
    return React.createElement(
        "form",
        { id: "signupForm", name: "signupForm",
            onSubmit: handleSignup,
            action: "/signup",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "username" },
            "Username: "
        ),
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" }),
        React.createElement(
            "label",
            { htmlFor: "pass" },
            "Password: "
        ),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" }),
        React.createElement(
            "label",
            { htmlFor: "pass2" },
            "Password: "
        ),
        React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "retype password" }),
        React.createElement(
            "label",
            { htmlFor: "type", id: "accountTypeLabel" },
            "Account Type: "
        ),
        React.createElement(
            "select",
            { id: "type", name: "type" },
            React.createElement(
                "option",
                { value: "Parent" },
                "Parent"
            ),
            React.createElement(
                "option",
                { value: "Child" },
                "Child"
            )
        ),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign Up" })
    );
};

//renders login window
var createLoginWindow = function createLoginWindow(csrf) {
    ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#content"));
};

//renders signup window
var createSignupWindow = function createSignupWindow(csrf) {
    ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#content"));
};

//sets up login/signup screens
var setup = function setup(csrf) {
    var loginButton = document.querySelector('#loginButton');
    var signupButton = document.querySelector('#signupButton');

    signupButton.addEventListener("click", function (e) {
        e.preventDefault();
        createSignupWindow(csrf);
        return false;
    });

    loginButton.addEventListener("click", function (e) {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });

    createLoginWindow(csrf); //default
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

var hideCount = 0;
//shows error message
var handleError = function handleError(message) {
    var change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var quick = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    $("#errorMessage").text(message);
    $("#domoMessage").animate({ height: 'toggle' }, 350);

    var errorMessage = document.querySelector('#errorMessage');
    errorMessage.style.color = change ? '#1cc425' : 'red';

    hideCount++;

    var time = quick ? 1500 : 5000;
    setTimeout(hideError, time);
};

//hides error window
var hideError = function hideError() {
    hideCount--;
    if (hideCount !== 0) {
        return;
    }
    $("#domoMessage").animate({ height: 'hide' }, 350);
};

//redirects window
var redirect = function redirect(response) {
    $("#domoMessage").animate({ height: 'hide' }, 350);
    window.location = response.redirect;
};

//helper funcion to send ajax message
var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};

//TEMPORARY - actual ad view would go here
var Ad = function Ad(props) {
    return React.createElement(
        "div",
        { className: "adView" },
        React.createElement(
            "h1",
            null,
            "AD HERE"
        ),
        React.createElement(
            "h1",
            null,
            "AD HERE"
        ),
        React.createElement(
            "h1",
            null,
            "AD HERE"
        )
    );
};

var AdView = function AdView(props) {
    return React.createElement(
        "div",
        { className: "adContainer" },
        React.createElement(Ad, null),
        React.createElement(Ad, null)
    );
};

//ran to show ads view
var ShowAds = function ShowAds() {
    ReactDOM.render(React.createElement(AdView, null), document.querySelector('#ads'));
};

var testNavBar = function testNavBar(accountType) {
    if (accountType === "Child") {
        document.querySelector('#navHistory').style.display = 'none';
        document.querySelector('#navStats').style.display = 'none';
    }
};
