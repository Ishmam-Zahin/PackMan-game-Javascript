"use strict";

const tableElement = document.querySelector(".tableField");
const mainContainer = document.querySelector(".container");
const packMan = document.querySelector(".packMan");
const targetMan = document.querySelector(".target");
const startButton = document.querySelector(".startGame");
const totalPointsElement = document.querySelector(".totalPointsValue");
const timeLeftElement = document.querySelector(".timeLeft");
const hideContainerElement = document.querySelector(".hideContainer");
const hideTextElement = document.querySelector(".hideText");
let hasStarted = 0;
let totalPoints = 0;
let timeLeft = 60000;
const packManPos = [0, 0];
const targetPos = [0, 0];
const movements = [[1, 0], [-1, 0], [0, 1], [0, -1]];
let timer = undefined;
let tickTimer = undefined;
const gp = [
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
];
//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
const stopGame = function (){
    clearInterval(timer);
    clearInterval(tickTimer);

    mainContainer.removeEventListener("click", determinePath);
    document.removeEventListener("keyup", determinePath);

    hideContainerElement.style.display = "flex";
}

const movePackMan = function (direction){
    let x = parseFloat(packMan.style.left);
    let y = parseFloat(packMan.style.top);
    x += (32)*direction[1];
    y += (32)*direction[0];
    packMan.style.left = `${x}px`;
    packMan.style.top = `${y}px`;

    packManPos[0] += direction[0];
    packManPos[1] += direction[1];

    if(hasStarted && targetPos[0] === packManPos[0] && targetPos[1] === packManPos[1]){
        stopGame();
    }

    const boxElement = document.querySelector(`.box-${packManPos[0]}_${packManPos[1]}`);
    const point = (Number(boxElement.innerHTML) + 1) % 10;
    boxElement.innerHTML = point;
}

const moveTargetMan = function (direction){
    let x = parseFloat(targetMan.style.left);
    let y = parseFloat(targetMan.style.top);
    x += (32)*direction[1];
    y += (32)*direction[0];
    targetMan.style.left = `${x}px`;
    targetMan.style.top = `${y}px`;

    targetPos[0] += direction[0];
    targetPos[1] += direction[1];

    if(hasStarted && targetPos[0] === packManPos[0] && targetPos[1] === packManPos[1]){
        stopGame();
    }

    const boxElement = document.querySelector(`.box-${targetPos[0]}_${targetPos[1]}`);
    totalPoints += Number(boxElement.innerHTML);
    boxElement.innerHTML = "";
    totalPointsElement.innerHTML = totalPoints;
}

const findShortestPath = function (targetPos){
    const isvisited = [];
    for(const row of gp){
        const newArr = new Array(row.length);
        newArr.fill(0);
        isvisited.push(newArr);
    }
    const setContainer = [];
    setContainer.push(targetPos);
    isvisited[targetPos[0]][targetPos[1]] = 1;
    
    while(setContainer.length){
        const [parentX, parentY] = setContainer.shift();
        if(parentX === packManPos[0] && parentY === packManPos[1]) return [0, 0];

        for(const [x, y] of movements){
            const childX = parentX + x;
            const childY = parentY + y;
            if(childX > 9 || childX < 0 || childY > 9 || childY < 0) continue;
            if(gp[childX][childY] === 1) continue;
            if(isvisited[childX][childY]) continue;
            if(childX === packManPos[0] && childY === packManPos[1]){
                return [(parentX - childX), (parentY - childY)];
            }
            isvisited[childX][childY] = 1;
            setContainer.push([childX, childY])
        }
    }

    return [0, 0];
}

const startpackMan = function (){
    const dir = findShortestPath(targetPos);
    if(dir[0] === 0 && dir[1] === 0){
        stopGame();
    };
    movePackMan(dir);
}

const decreaseTime = function (){
    if(!hasStarted){
        hasStarted = 1;
        if(timer) clearInterval(timer);
        timer = setInterval(startpackMan, 400);
    }

    timeLeft -= 1000;

    const minutes = Math.floor(timeLeft/(1000*60));
    const seconds = (Math.floor(timeLeft/1000) - minutes * 60);

    if(timeLeft >= 0){
        timeLeftElement.innerHTML = `${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;
    }

    if(timeLeft <= 0){
        stopGame();
    }
}

const determinePath = function (event){
    if(event.target.classList.contains("moveUp")){
        if((targetPos[0] - 1) >= 0 && gp[targetPos[0] - 1][targetPos[1]] === 0){
            moveTargetMan([-1, 0]);
        }
    }
    else if(event.target.classList.contains("moveDown")){
        if((targetPos[0] + 1) <= 9 && gp[targetPos[0] + 1][targetPos[1]] === 0){
            moveTargetMan([1, 0]);
        }
    }
    else if(event.target.classList.contains("moveRight")){
        if((targetPos[1] + 1) <= 9 && gp[targetPos[0]][targetPos[1] + 1] === 0){
            moveTargetMan([0, 1]);
        }
    }
    else if(event.target.classList.contains("moveLeft")){
        if((targetPos[1] - 1) >=0 && gp[targetPos[0]][targetPos[1] - 1] === 0){
            moveTargetMan([0, -1]);
        }
    }
    else if(event.key?.toLowerCase() === 'd'){
        if((targetPos[1] + 1) <= 9 && gp[targetPos[0]][targetPos[1] + 1] === 0){
            moveTargetMan([0, 1]);
        }
    }
    else if(event.key?.toLowerCase() === 'a'){
        if((targetPos[1] - 1) >=0 && gp[targetPos[0]][targetPos[1] - 1] === 0){
            moveTargetMan([0, -1]);
        }
    }
    else if(event.key?.toLowerCase() === 'w'){
        if((targetPos[0] - 1) >= 0 && gp[targetPos[0] - 1][targetPos[1]] === 0){
            moveTargetMan([-1, 0]);
        }
    }
    else if(event.key?.toLowerCase() === 's'){
        if((targetPos[0] + 1) <= 9 && gp[targetPos[0] + 1][targetPos[1]] === 0){
            moveTargetMan([1, 0]);
        }
    }
    else return;
}

const resetStatus = function (){
    packMan.style.left = `0px`;
    packMan.style.top = `1px`;

    targetMan.style.left = `0px`;
    targetMan.style.top = `1px`;

    timeLeftElement.innerHTML = `01 : 00`;

    packManPos[0] = 0;
    packManPos[1] = 0;
    targetPos[0] = 0;
    targetPos[1] = 0;

    totalPoints = 0;

    totalPointsElement.innerHTML = "0";

    timeLeft = 60000;

    hasStarted = 0;
}

const updateTable = function (){
    tableElement.innerHTML = "";

    resetStatus();

    for(const [i, r] of gp.entries()){
        const row = document.createElement("tr");
        r.forEach((c, j) => {
            const col = document.createElement("td");
            col.classList.add(`box-${i}_${j}`);
            if(c === 1) col.style.backgroundColor = "red";

            row.append(col.cloneNode(true));
        })
        tableElement.append(row);
    }

    movePackMan([0, 0]);
    moveTargetMan([9, 9]);

    mainContainer.addEventListener("click", determinePath);
    document.addEventListener("keyup", determinePath);

    hideContainerElement.style.display = "none";

    if(tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(decreaseTime, 1000);
}
const startGame = function (event){
    if(event.target.classList.contains("startGame")){
        updateTable();
    }
    else return;
}
startButton.addEventListener("click", startGame);
