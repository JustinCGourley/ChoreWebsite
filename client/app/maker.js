
let account = {};
const handleDomo = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({width: 'hide'},350);

    if ($("#domoName").val() == '' || $("#domoAge").val() == '' || $('#domoDesc').val() == ''){
        handleError("All fields are required");
        return false;
    }

    sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function() {
        loadDomosFromServer();
    });
    return false;
};

const handleDelete = (e, domo) => {
    console.log(domo);
    let token = document.querySelector('#csrfToken').value;
    let data = `id=${domo._id}&_csrf=${token}`;

    sendAjax('POST', '/deleteDomo', data, function(){
        loadDomosFromServer();
    });

    return false;
};

const handleCheckClick = (e, domo) => {

    let token = document.querySelector('#csrfToken').value;
    
    let set = account.user;
    if (domo.completed !== 'false')
    {
        set = 'false';
    }
    let data = `set=${set}&_csrf=${token}&id=${domo._id}`;

    sendAjax('POST', '/updateCompleted', data, function(data){
        if (!data.status)
        {
            handleError("Unable to find domo?");
        }
        loadDomosFromServer();
    });
};

const handleAccountLink = (e, account) => {
    
    e.preventDefault();

    $("#domoMessage").animate({width: 'hide'}, 350);

    if ($('#linkName').val() == ''){
        handleError("Must enter a username to link!");
        return false;
    }

    sendAjax('POST', $("#linkForm").attr("action"), $("#linkForm").serialize(), function(err){
        if (err.status === false)
        {
            handleError(err.error);
        }
        else
        {
            setup();
        }
    });

    return false;
};

const DomoForm = (props) => {
    return (
        <form id="domoForm"
        onSubmit={handleDomo}
        name="domoForm"
        action="/maker"
        method="POST"
        className="domoForm"
        >
        
        <label htmlFor="title">Title: </label>
        <input id="domoName" type="text" name="title" placeholder="Chore Title"/>
        <label id= "domoDescLabel" htmlFor="description">Description: </label>
        <input id="domoDescription" type="text" name="description" placeholder="Chore Description"/>
        <label htmlFor="cost">Cost: </label>
        <input id="domoAge" type="text" name="cost" placeholder="Chore Cost"/>
        <label htmlFor="day">Day: </label>
        <select id="domoDay" name="day">
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
        </select>
        <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
        <input className="makeDomoSubmit" type="submit" value="Make Domo"/>
        </form>
    );
};

const CompletedCheck = (props) => {
    console.log("completed: " + props.completed);
    return(
        <div className = "domoCompleted">
            <h3 className = {(props.completed !== 'false') ? "completedDesc domoIsCompleted" : "completedDesc domoNotCompleted"} >
            {(props.completed !== 'false') ? `Completed by: ${props.completed}` : "Not Completed"}
            </h3>
            <input type="submit" onClick={props.onClick} 
            className="completedSubmit" value={(props.completed === 'false') ? "Finish Chore" : "Undo"}/>
        </div>
    );
};

const DeleteOption = (props) => {
    return (
        <img src="/assets/img/trashcan.png" alt="trash" 
        className="domoDelete" onClick={(e) => handleDelete(e,props.info)} name="test"/>
    );
};

const DomoList = function(props) {
    

    const domoNodes = props.domos.map(function(domo) {
        return(
            <div key={domo._id} className="domo">
            <h3 className="domoCost">${domo.cost}</h3>
            <h3 className="domoName">{domo.title}</h3>
            <h3 className="domoDesc">{domo.description}</h3>
            <CompletedCheck completed={domo.completed} onClick={(e) => handleCheckClick(e,domo)} />
            {account.type === "Parent" ? <DeleteOption info={domo}/> : null}
            </div>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
        </div>
    );
};

const sortDomosByDay = (domos) => {
    const sortedList = {monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []};
    for (let i = 0; i < domos.length; i++)
    {
        switch(domos[i].day)
        {
            case 'monday':
                sortedList.monday.push(domos[i]);
            break;
            case 'tuesday':
                sortedList.tuesday.push(domos[i]);
            break;
            case 'wednesday':
                sortedList.wednesday.push(domos[i]);
            break;
            case 'thursday':
                sortedList.thursday.push(domos[i]);
            break;
            case 'friday':
                sortedList.friday.push(domos[i]);
            break;
            case 'saturday':
                sortedList.saturday.push(domos[i]);
            break;
            case 'sunday':
                sortedList.sunday.push(domos[i]);
            break;
        }
    }

    return sortedList;
}

const DomoListDay = function(props){
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Chores Added</h3>
                <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
            </div>
        );
    }

    let domos = sortDomosByDay(props.domos);

    return (
        <div>
            <div className="day">
                <h1>Monday</h1>
                <DomoList domos={domos.monday} csrf={props.csrf} />
            </div>
            <div className="day">
                <h1>Tuesday</h1>
                <DomoList domos={domos.tuesday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Wednesday</h1>
                <DomoList domos={domos.wednesday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Thursday</h1>
                <DomoList domos={domos.thursday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Friday</h1>
                <DomoList domos={domos.friday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Saturday</h1>
                <DomoList domos={domos.saturday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Sunday</h1>
                <DomoList domos={domos.sunday} csrf={props.csrf}/>
            </div>
        </div>
    );
}

const LinkView = function(props) {
    return (
        <div className="noLinkView">
            <h1>Your account is not linked to any parent, please link it!</h1>
            <form id="linkForm"
            onSubmit={handleAccountLink}
            name="linkForm"
            action="/linkAccount"
            method="POST"
            className="linkForm"
            >
            
            <label htmlFor="user">Parents Username: </label>
            <input id="linkName" type="text" name="name" placeholder="Parents Username"/>
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
            <input className="linkUserSubmit" type="submit" value="Link Account"/>
            </form>
        </div>
    );
}

const loadDomosFromServer = () => {

    let token = document.querySelector('#csrfToken').value;

    let dataSend = `link=${account.link}&type=${account.type}&_csrf=${token}`;
    sendAjax('POST', '/getDomos', dataSend, (data) => {

        ReactDOM.render(
            <DomoListDay domos={data.domos} csrf={token}/>, document.querySelector("#domos")
        );

        if (account.type === 'Child' && account.link !== 'none')
        {
            document.querySelector('#makeDomo').innerHTML = "";
        }
    });
};

const setup = function(csrf) {
    sendAjax('GET', '/getCurrentAccount', null, (result) => {
        account = result.data;
        setupViews(csrf);
    });
};

const setupViews = function(csrf)
{
    if (account.type === "Child" && account.link === 'none')
    {
        ReactDOM.render(
            <LinkView csrf={csrf} />, document.querySelector('#makeDomo')
        );
    }
    else if (account.type === "Child" && account.link !== 'none')
    {
        ReactDOM.render(
            <DomoListDay domos={[]} csrf={csrf}/>, document.querySelector("#domos")
        );

        loadDomosFromServer();
    }
    else
    {
        ReactDOM.render(
            <DomoForm csrf={csrf} />, document.querySelector("#makeDomo")
        );
        
        ReactDOM.render(
            <DomoListDay domos={[]} csrf={csrf}/>, document.querySelector("#domos")
        );
        

        loadDomosFromServer();
    }
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});