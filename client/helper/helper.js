let hideCount = 0;
const handleError = (message, change = false) =>
{
    $("#errorMessage").text(message);
    $("#domoMessage").animate({height: 'toggle'}, 350);

    let errorMessage = document.querySelector('#errorMessage');
    errorMessage.style.color = (change) ? '#1cc425' : 'red';

    hideCount++;
    setTimeout(hideError, 5000);
}; 

const hideError = () => {
    hideCount--;
    if (hideCount !== 0)
    {
        return;
    }
    $("#domoMessage").animate({height: 'hide'}, 350);
};

const redirect = (response) => {
    $("#domoMessage").animate({height: 'hide'}, 350);
    window.location = response.redirect;
}

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

const ShowAds = () => {
    console.log("showing ads?");
    ReactDOM.render(
        <AdView />, document.querySelector('#ads')
    );
};