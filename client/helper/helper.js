let hideCount = 0;
//shows error message
const handleError = (message, change = false, quick = false) =>
{
    $("#errorMessage").text(message);
    $("#domoMessage").animate({height: 'toggle'}, 350);

    let errorMessage = document.querySelector('#errorMessage');
    errorMessage.style.color = (change) ? '#1cc425' : 'red';

    hideCount++;

    let time = (quick) ? 1500 : 5000;
    setTimeout(hideError, time);
}; 

//hides error window
const hideError = () => {
    hideCount--;
    if (hideCount !== 0)
    {
        return;
    }
    $("#domoMessage").animate({height: 'hide'}, 350);
};

//redirects window
const redirect = (response) => {
    $("#domoMessage").animate({height: 'hide'}, 350);
    window.location = response.redirect;
}

//helper funcion to send ajax message
const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function(xhr, status, error){
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};

//TEMPORARY - actual ad view would go here
const Ad = (props) => {
    return(
        <div className="adView">
            <h1>AD HERE</h1>
            <h1>AD HERE</h1>
            <h1>AD HERE</h1>
        </div>
    );
};

const AdView = (props) => {
    return(
        <div className="adContainer">
            <Ad />
            <Ad />
        </div>
    );
};

//ran to show ads view
const ShowAds = () => {
    ReactDOM.render(
        <AdView />, document.querySelector('#ads')
    );
};