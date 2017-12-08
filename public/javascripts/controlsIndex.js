function disableGera () {
    document.getElementById("btnGeraArq").disabled = true;
    //document.getElementById("arqGerado").style.display = "inline-block";
}

function initGera () {
    document.getElementById("btnGeraArq").disabled = true;
    //document.getElementById("arqGerado").style.display = "none";
}

function EnableGera () {
    document.getElementById("btnGeraArq").disabled = false;
}

function changeCenso () {
    /*
     document.getElementById("colecao").selectedIndex = 0;
     document.getElementById("estado").selectedIndex = 0;
     */
    initGera ();
}

function changeCollection () {
    strCol = $('input[name="typeSel"]:checked').val();
    if (document.getElementById("colecao").value != strCol) {
        document.getElementById("colecao").value = strCol;
        console.log ("JS-Change Collection:", strCol);
        angular.element(document.getElementById('colecao')).triggerHandler('change');
        changeFkCollection();
        initGera ();
    }
}

function changeFkCollection () {
    console.log ("JS-Change FK Coll");
}

function clickCenso(intAno) {
    if (document.getElementById("ano").value != intAno) {
        document.getElementById("ano").value = intAno;
        console.log ("JS-Change-Censo", intAno);
        angular.element(document.getElementById('ano')).triggerHandler('change');
    }
}

function changeTheme () {
    console.log ("onChangeTheme - index.html");
}

function changeUF () {
    initGera ();
}

function varSelect () {
    console.log ("VarSelect");
}

function myfunc(div) {
    /*
    var className = div.getAttribute("class");
    var classDisable = div.getAttribute("class");
    console.log ("MyFunc",div,className)
    console.log ("CLASSNAME",className)
    if(className == "option-selected") {
      div.className = "";
    }
    else{
      div.className = "option-selected";
    }
    */
}