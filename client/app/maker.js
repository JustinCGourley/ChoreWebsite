
let account = {};
let curDomos = [];
let loadedWeek = true;
//handles creating a new chore
const handleDomo = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({height: 'hide'},350);

    if ($("#domoName").val() == '' || $("#domoCost").val() == '' || $('#domoDesc').val() == ''){
        handleError("All * fields are required");
        return false;
    }

    sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function() {
        handleError("Created Chore", true, true);
        loadDomosFromServer();
    });
    return false;
};
//handles deleting a chore
const handleDelete = (e, domo) => {
    let token = document.querySelector('#csrfToken').value;
    let data = `id=${domo._id}&_csrf=${token}`;

    sendAjax('POST', '/deleteDomo', data, function(err){
        if (err.done === false)
        {
            console.log(err);
            handleError("Unable to delete domo");
        }
        handleError("Deleted Chore", true);
        loadDomosFromServer();
    });

    return false;
};
//handles pressing complete chore button
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
//handles linking account - for child accounts
const handleAccountLink = (e, account) => {
    
    e.preventDefault();

    $("#domoMessage").animate({height: 'hide'}, 350);

    if ($('#linkName').val() == '' || $('#linkPass').val() == ''){
        handleError("Fill out everything to link!");
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
//handles next week button being pressed
const handleNextWeek = (e) => {
    e.preventDefault();

    let token = document.querySelector('#csrfToken').value;
    let data = `_csrf=${token}`;

    sendAjax('POST', '/newWeek', data, function(err){
        if (err.status === false)
        {
            console.log("ERROR");
            handleError(err.error);
        }
        handleError("Finished Week", true, true);
        sendAjax('GET', '/getCurrentAccount', null, (result) => {
            account = result.data;
            loadDomosFromServer();
        });
    });
};
//reload views to show either week or other category
const changeView = (e, view) => {
    if (view == 'week')
    {
        if (loadedWeek){return;}
        loadedWeek = true;
    }
    else
    {
        if (!loadedWeek){return;}
        loadedWeek = false;
    }

    loadDomosFromServer();
}

//display for chore creation window
const DomoForm = (props) => {
    return (
        <form id="domoForm"
        onSubmit={handleDomo}
        name="domoForm"
        action="/maker"
        method="POST"
        className="domoForm"
        >
        
            <label htmlFor="title">* Title: </label>
            <input id="domoName" type="text" name="title" placeholder="Chore Title"/>
            <br/>
            <label id= "domoDescLabel" htmlFor="description">Description: </label>
            <input id="domoDescription" type="text" name="description" placeholder="Chore Description"/>
            <br/>
            <label htmlFor="cost">* Cost: </label>
            <input id="domoCost" type="number" min="0.0" step="0.01" name="cost" placeholder="Chore Cost"/>
            <br/>
            <label htmlFor="day">* Day: </label>
            <select id="domoDay" className="domoMakeLabel" name="day">
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
                <option value="other">Other</option>
            </select>
            <br/>
            <label htmlFor="type">* Type:</label>
            <select id="domoType" className="domoMakeLabel" name="type">
                <option value="recurring">Recurring Chore</option>
                <option value="single">One-Time Chore</option>
            </select>
            <br/>
            <label htmlFor="childSet">Child</label>
            <select id="" className="domoMakeLabel" name="childSet">
                <option value="any">Any</option>
                {
                    props.data.map(function(child){
                        return <option value={child.username}>{child.username}</option>
                    })
                }
            </select>
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
            <br/>
            <input className="makeDomoSubmit" type="submit" value="Make Chore"/>
        </form>
    );
};
//gets how much a child has currently earned
const getAmountForChild = (name) => {
    let amount = 0.0;
    for (let i = 0; i < curDomos.length; i++)
    {
        if (curDomos[i].completed === name)
        {
            amount += curDomos[i].cost;
        }
    }
    return amount;
};
//shows linked accounts
const ChildInfo = (props) => {
    if (props.data.length <= 0)
    {
        return(
            <div>
                <h3>None Linked</h3>
            </div>
        );    
    }

    const childNodes = props.data.map(function(child) {
        return(
            <div key={child._id} className="child">
                <h2>Account: {child.username}</h2>
                <h3 className="childEarned">Earned Amount: ${getAmountForChild(child.username)}</h3>
            </div>
        );
    });

    return (
        <div className="childList">
            {childNodes}
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
        </div>
    );
};
//Shows info on week, and linked accounts
const ChoreInfo = (props) => {
    return(
        <div className="ChoreInfo">
            {(account.linkSet) ? null : <a id="setLinkPass" href="/account">Please set your link password!</a>}
            <h1 id="weekHeader">Week {account.currentWeek}</h1>
            <h2>Linked Accounts:</h2>
            <ChildInfo csrf={props.csrf} data={props.data}/>
            <input type="submit" onClick={handleNextWeek} className="makeDomoSubmit" value="Finish Week"/>
        </div>
    );
};
//view setup for creating chores and linked info
const DomoMake = (props) => {
    return (
        <div className={account.subscription ? "mainViewSubbed" : "mainView"}>
            <ChoreInfo csrf={props.csrf} data={props.data}/>
            <DomoForm csrf={props.csrf} data={props.data}/>
        </div>
    );
};
//shows completion status on each chore
const CompletedCheck = (props) => {
    return(
        <div className = "domoCompleted">
            <h3 className = {(props.completed !== 'false') ? "completedDesc domoIsCompleted" : "completedDesc domoNotCompleted"} >
            {(props.completed !== 'false') ? `Completed by: ${props.completed}` : "Not Completed"}
            </h3>
            {/* Only show the undo/finish chore button if account is type parent, or if 
            the current child has completed the chore (or the chore isnt completed) */}
            {(account.type === 'Parent' || 
            (account.type === 'Child' && props.completed === account.user) ||
            (props.completed === 'false')) ?
            <input type="submit" onClick={props.onClick} 
            className="completedSubmit makeDomoSubmit" value={(props.completed === 'false') ? "Finish Chore" : "Undo"}/>
            : null
            }
        </div>
    );
};
//view for delete button on each chore
const DeleteOption = (props) => {
    return (
        <img src="/assets/img/trashcan.png" alt="trash" 
        className="domoDelete" onClick={(e) => handleDelete(e,props.info)} name="test"/>
    );
};

//view for a single chore
const DomoList = function(props) {
    
    const domoNodes = props.domos.map(function(domo) {
        return(
            <div key={domo._id} className="domo">
            <h3 className="domoCost">${domo.cost}</h3>
            <h3 className="domoName">{domo.title}</h3>
            {(domo.description) ? <h3 className="domoDesc">{domo.description}</h3> : null}
            <CompletedCheck completed={domo.completed} onClick={(e) => handleCheckClick(e,domo)} />
            {account.type === "Parent" && domo.childSet ? 
            <h3 className="domoSet">Set to Child: {domo.childSet}</h3> : null}
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
//sorts out chores based on day
const sortDomosByDay = (domos) => {
    
    if (loadedWeek === false)
    {
        const list = [];
        for (let i = 0; i < domos.length; i++)
        {
            if (domos[i].day === 'other')
            {
                list.push(domos[i]);
            }
        }

        return list;
    }

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
//displays each chore based on day
const DomoListDay = function(props){

    if (props.domos.length === 0) {
        return (
            <div className={(account.subscription) ? "domoList" : "domoList"}>
                <h3 className="emptyDomo">No Chores Added</h3>
                <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
            </div>
        );
    }

    let domos = sortDomosByDay(props.domos);

    //if showing other list - show one row of chores
    if (loadedWeek === false)
    {
        return(
            <div className="domoList">
                <div className="day">
                    <h1>Other</h1>
                    <DomoList domos={domos} csrf={props.csrf} />
                </div>
            </div>
        );
    }

    return (
            <div className="domoList">
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
};
//shows list of chores
const DomoListView = function(props) {
    return(
        <div className={(account.subscription) ? "mainViewSubbed" : "mainView"}>
            <div>
                <input type="submit" value="View Week" 
                id="weekViewButton" className="makeDomoSubmit viewButton"
                onClick={(e) => changeView(e, 'week')}/>
                <input type="submit" value="View Other" 
                id="otherViewButton" className="makeDomoSubmit viewButton"
                onClick={(e) => changeView(e, 'other')}/>
            </div>
            <DomoListDay domos={props.domos} csrf={props.csrf}/>
        </div>
    )
}

//view for child requesting them to link their account
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
            <br/>
            <label htmlFor="linkPass">Link Password: </label>
            <input id="linkPass" type="text" name="pass" placeholder="Link Password"/>
            <br/>
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
            <input className="linkPassSubmit makeDomoSubmit" id="noLinkSubmit"
            type="submit" value="Link Account"/>
            </form>
        </div>
    );
}
//load linked accounts if account is parent type and render them
const loadLinkedAccounts = () => {
    let token = document.querySelector('#csrfToken').value;

    let dataSend = `link=${account.link}&_csrf=${token}`;

    sendAjax('POST', '/getLinked', dataSend, (data) => {
        if (data.status === false)
        {
            handleError('Error when loading linked accounts');
            return;
        }
        ReactDOM.render(
            <DomoMake csrf={token} data={data.data} />, document.querySelector('#makeDomo')
        )

    });
};
//load all chores from the server and render them into the view
const loadDomosFromServer = () => {

    let token = document.querySelector('#csrfToken').value;

    let dataSend = `link=${account.link}&type=${account.type}&_csrf=${token}`;
    sendAjax('POST', '/getDomos', dataSend, (data) => {
        
        curDomos = data.domos;

        ReactDOM.render(
            <DomoListView domos={data.domos} csrf={token}/>, document.querySelector("#domos")
        );

        if (account.type === 'Child' && account.link !== 'none')
        {
            document.querySelector('#makeDomo').innerHTML = "";
        }

        if (account.type === 'Parent')
        {
            loadLinkedAccounts();
        }
    });
};
//grab account and start setting up views
const setup = function(csrf) {
    sendAjax('GET', '/getCurrentAccount', null, (result) => {
        account = result.data;
        testNavBar(account.type);
        if (account.subscription === false)
        {
            ShowAds();
        }
        else
        {
            document.querySelector('#ads').innerHTML = "";
        }
        setupViews(csrf);
    });
};

//sets up all views based on account and account type
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
            <DomoListView domos={[]} csrf={csrf}/>, document.querySelector("#domos")
        );

        loadDomosFromServer();
    }
    else
    {
        ReactDOM.render(
            <DomoMake csrf={csrf} data={[]}/>, document.querySelector("#makeDomo")
        );
        
        ReactDOM.render(
            <DomoListView domos={[]} csrf={csrf}/>, document.querySelector("#domos")
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