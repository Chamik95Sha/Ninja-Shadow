import './style.css'

await new Promise((resolve)=>{
    document.querySelector("#start-screen > button")
        .addEventListener('click', async ()=>{
            await document.querySelector("html").requestFullscreen({
                navigationUI: 'hide'
            });
            document.querySelector("#start-screen").remove();
            resolve();
        });
});
const btnPlayAgain = document.getElementById('btnPlayAgain');
btnPlayAgain.addEventListener('click', () => {
    location.reload();
});
document.getElementById('btnExit').addEventListener('click', () => {

});
await new Promise(function (resolve) {

    const images = ['/image/BG1.jpg',
        '/image/Tiles/Tile (1).png',
        '/image/Tiles/Tile (2).png',
        '/image/Tiles/Tile (3).png',
        ...Array(10).fill('/image/character')
            .flatMap((v, i) => [
                `${v}/Jump__00${i}.png`,
                `${v}/Idle__00${i}.png`,
                `${v}/Run__00${i}.png`
            ])
    ];
    for (const image of images) {
        const img = new Image();
        img.src = image;
        img.addEventListener('load', progress);
    }

    const barElm = document.getElementById('bar');
    const totalImages = images.length;

    function progress(){
        images.pop();
        barElm.style.width = `${100 / totalImages * (totalImages - images.length)}%`
        if (!images.length){
            setTimeout(()=>{
                document.getElementById('overlay').classList.add('hide');
                resolve();
            }, 1000);
        }
    }
});













const char = document.querySelector("#character");

const dy = 10;   //Initial Fall
let dx = 0;        //Run
let i = 0;  //Rendering
let run = false;
let glide = false;
let jump = false;
let nthrow = false;
let attack = false;
let fnJump;
let fnRun;
let angle = 0;
let direction_right = true;
let fnThrowRight;
let fnThrowLeft;
let dtRight;
let dtLeft;
let e_Run;
let e_dtRight;
let e_dtLeft;
let e_fnRunLeft;
let e_nthrow = false;
let knife_a = [];
let enemy = [];
let e_knife_collection = [];
let game_over=false;
let previousTouch;
let fnCharRender;
let fnEnmRender;
let fnEnmGeneration;
// Rendering Function


fnCharRender=setInterval(() => {
    if (run) {
        char.style.backgroundImage = `url('/image/character/Run__00${i++}.png')`
        if (i === 10) i = 0;
    } else if (glide) {
        char.style.backgroundImage = `url('/image/character/Glide_00${i++}.png')`
        if (i === 10) i = 0;
    } else if (jump) {
        char.style.backgroundImage = `url('/image/character/Jump__00${i++}.png')`
        if (i === 10) i = 0;

    } else if (attack) {
        char.style.backgroundImage = `url('/image/character/Jump_Attack__00${i++}.png')`
        if (i === 10) i = 0;
    } else if (nthrow) {
        char.style.backgroundImage = `url('/image/character/Jump_Throw__00${i++}.png')`
        if (i === 10) {
            nthrow = false;
            i = 0;
            char.style.backgroundImage = `url('/image/character/Idle__00${i++}.png')`
        }
    } else {
        char.style.backgroundImage = `url('/image/character/Idle__00${i++}.png')`
        if (i === 10) i = 0;
    }
}, 1500 / 22)


fnEnmRender=setInterval(() => {
    const enemy_collection = document.querySelectorAll('.enemy');
    enemy_collection.forEach(enemy_Elm => {
        if (e_Run) {
            enemy_Elm.style.backgroundImage = `url('/image/enemy/Run__00${i++}.png')`
            if (i === 10) i = 0;
            // } else if (jump) {
            //     enemy_Elm.style.backgroundImage = `url('/image/enemy/Jump__00${i++}.png')`
            //     if (i === 10) i = 0;
            // } else if (attack) {
            //     enemy_Elm.style.backgroundImage = `url('/image/enemy/Jump_Attack__00${i++}.png')`
            //     if (i === 10) i = 0;
        } else if (e_nthrow) {
            enemy_Elm.style.backgroundImage = `url('/image/enemy/Jump_Throw__00${i++}.png')`
            if (i === 10) {
                e_nthrow = false;
                e_Run = true;
                i = 0;
                enemy_Elm.style.backgroundImage = `url('/image/enemy/Run__00${i++}.png')`
            }
        } else {
            enemy_Elm.style.backgroundImage = `url('/image/enemy/Idle__00${i++}.png')`
            if (i === 10) i = 0;
        }
    })
}, 1400 / 15)


// Initial Fall
const tmrId = setInterval(() => {
    glide = false;
    const top = char.offsetTop + dy;
    if (char.offsetTop <= (innerHeight - 280)) {
        char.style.top = `${top}px`;
    }
}, 100);

//run function
function doRun(left) {
    if (fnRun) return;
    run = true;
    i = 0;
    if (left) {
        dx = -10;
        char.classList.add('rotate');
        direction_right = false;
    } else {
        dx = 10;
        char.classList.remove('rotate');
        direction_right = true;
    }
    fnRun = setInterval(() => {
        if (dx === 0) {
            clearInterval(fnRun);
            fnRun = undefined;
            run = false;
            i = 0;
            return;
        }
        const left = char.offsetLeft + dx;
        if (left + char.offsetWidth >= innerWidth ||
            left <= 0) {
            if (left <= 0) {
                char.style.left = '0';
            } else {
                char.style.left = `${innerWidth - char.offsetWidth - 1}px`
            }
            dx = 0;
            return;
        }
        char.style.left = `${left}px`;
    }, 40);
}

//jump function
function doJump() {
    if (fnJump) return;
    i = 0;
    jump = true;
    const initialTop = char.offsetTop;
    fnJump = setInterval(() => {
        const top = initialTop - (Math.sin(toRadians(angle++))) * 160;
        char.style.top = `${top}px`
        if (angle === 181) {
            clearInterval(fnJump);
            fnJump = undefined;
            jump = false;
            angle = 0;
            i = 0;
        }
    }, 5);
}

//creat Knife function
function creatKnife() {
    const knife_elm = document.createElement("div");
    knife_elm.classList.add("knife");
    knife_elm.style.backgroundImage = `url('/image/character/Kunai.png')`
    const initialTop = (char.offsetTop);
    knife_elm.style.top = `${initialTop + 30}px`;
    if (!direction_right) {
        knife_elm.classList.add("rotate");
        knife_elm.style.left = `${char.offsetLeft - 60}px`
    } else {
        knife_elm.style.left = `${char.offsetLeft + char.offsetWidth - 10}px`
    }
    document.getElementById("play-screen").appendChild(knife_elm);
    return knife_elm;
}

//throw function
fnThrowRight = setInterval(() => {
    dtRight = 10;
    if (knife_a.length > 0) {
        knife_a.forEach((localKnife) => {
            const left = localKnife.offsetLeft + dtRight;
            if (left + localKnife.offsetWidth >= innerWidth) {
                knife_a.shift();
                localKnife.remove();
                return;
            }
            localKnife.style.left = `${left}px`;
        })
    }
}, 30);


// } else {
//     dtLeft = -10;
//     fnThrowLeft = setInterval(() => {
//         if (dtLeft === 0) {
//             // clearInterval(fnThrowLeft);
//             // fnThrowLeft = undefined;
//             nthrow = false;
//             i = 0;
//             return;
//         }
//         const left = knife.offsetLeft + dtLeft;
//         if (left <= 0) {
//             knife.remove();
//             document.body.removeChild(knife);
//             dtLeft = 0;
//             return;
//         }
//         knife.style.left = `${left}px`;
//     }, 30);
// }


// Utility Fn (Degrees to Radians)
function toRadians(angle) {
    return angle * Math.PI / 180;
}

//creat enemy function
function creatEnemy() {
    const enemy_elm = document.createElement("div");
    enemy_elm.classList.add("enemy");
    enemy_elm.classList.add("rotate");
    const initialTop = (char.offsetTop);
    enemy_elm.style.top = `${initialTop}px`;
    enemy_elm.style.left = `${innerWidth}px`;
    // if (!direction_right) {
    //     knife_elm.classList.add("rotate");
    //     knife_elm.style.left = `${characterElm.offsetLeft - 60}px`
    // } else {
    //     knife_elm.style.left = `${characterElm.offsetLeft + characterElm.offsetWidth - 10}px`
    // }
    document.getElementById("play-screen").appendChild(enemy_elm);
    return enemy_elm;
}

//enemy generator

fnEnmGeneration=setInterval(() => {
    const enemy_collection = document.querySelectorAll('.enemy');
    if (char.offsetTop > (innerHeight - 280) && Math.random()<0.3 && enemy_collection.length < 1) {
        enemy.push(creatEnemy());
        i = 0;
        e_Run = true;
    }
}, 700);

//enemy run;
e_fnRunLeft = setInterval(() => {
    e_dtLeft = -5;
    if (enemy.length > 0) {
        enemy.forEach((e) => {
            const left = e.offsetLeft + e_dtLeft;
            if (left <= 0 || e_dead(e)) {
                e.classList.add("hide");
                setTimeout(() => {
                    e.remove();
                }, 700)
                //e.remove();
                enemy.shift();
                return;
            }
            e.style.left = `${left}px`;
        })
    }
}, 60);

//e_knife create
function e_creatKnife() {
    const e_knife_elm = document.createElement("div");
    e_knife_elm.classList.add("e_knife");
    e_knife_elm.style.backgroundImage = `url('/image/character/Kunai.png')`
    const initialTop = (enemy[0].offsetTop);
    e_knife_elm.style.top = `${initialTop + 30}px`;
    e_knife_elm.classList.add("rotate");
    e_knife_elm.style.left = `${enemy[0].offsetLeft - 60}px`
    document.getElementById("play-screen").appendChild(e_knife_elm);
    return e_knife_elm;
}

//enemy throws start
let fnEnmyKnifeThrow;
fnEnmyKnifeThrow=setInterval(() => {
    if (Math.random() < 0.6 && e_knife_collection.length<1 && enemy.length === 1
        && enemy[0].offsetLeft <= innerWidth + 10 && enemy[0].offsetLeft >= char.offsetLeft) {
        e_Run = false;
        e_nthrow = true;
        i = 0;
        e_knife_collection.push(e_creatKnife());
    }
}, 1400);

//e_knife throw
fnThrowLeft = setInterval(() => {
    e_dtLeft = -10;
    e_knife_collection.forEach((e) => {
        const left = e.offsetLeft + e_dtLeft;
        if (left <= 0) {
            e.remove();
            e_knife_collection.shift();
            return;
        }
        e.style.left = `${left}px`;
    })
}, 61);

//enemy dead
function e_dead(e) {

    let en_left = e.offsetLeft
    if (knife_a.length > 0) {
        let k = knife_a[0];
        if (k.offsetLeft + k.offsetWidth >= en_left) {
            k.remove();
            return true;
        }
    } else if (attack && char.offsetLeft + char.offsetWidth - 50 <= en_left
        && char.offsetLeft + char.offsetWidth + 10 >= en_left) {
        return true;
    }
    return false;
}

//game over-check
setInterval(() => {

    if (e_knife_collection.length > 0) {
       e_knife_collection.forEach(knife=>{
           let l=char.offsetTop+char.offsetHeight;
           let w1=char.offsetLeft+char.offsetWidth;
           let w2=knife.offsetLeft+knife.offsetWidth;
           if(knife.offsetTop<=l-100 && w1 >= knife.offsetLeft+30 && w2 >= char.offsetLeft+30){
                   gameOver();
               knife.remove();
               debugger;

           }
       })
    }
    if (enemy.length > 0) {
       enemy.forEach(e=>{
           let l=char.offsetTop+char.offsetHeight;
           let w1=char.offsetLeft+char.offsetWidth;
           let w2=e.offsetLeft+e.offsetWidth;
           if(e.offsetTop<=l-30 && w1 >= e.offsetLeft+30 && w2 >= char.offsetLeft+30){
               debugger;
               gameOver();
           }
       })
    }
}, 50);


function gameOver(){
      document.getElementById("play-screen").classList.add("hide");
    setTimeout(() => {
        document.getElementById("play-screen").remove();
    }, 700)
}

function remove(e){
    document.getElementById("play-screen").classList.add("hide");
    setTimeout(() => {
        e.remove();
    }, 700)
}
addEventListener('keydown', (e) => {
    switch (e.code) {
        case "ArrowLeft":
        case "ArrowRight":
            doRun(e.code === "ArrowLeft");
            break;
        case "Space":
            doJump();
            break;
        case "KeyA":
            attack = true;
            break;
        case "KeyT":
            if (direction_right) knife_a.push(creatKnife());
            nthrow = true;
            break;
    }
});
addEventListener("keyup", (e) => {
    switch (e.code) {
        case "KeyA":
            setTimeout(() => {
                attack = false;
            }, 30);
            break;
        case "ArrowLeft":
        case "ArrowRight":
            dx = 0;
            run = false;
            break;

    }
})



const resizeFn = ()=>{
    char.style.top = `${innerHeight - 280}px`;
    if (char.offsetLeft < 0){
        char.style.left = '0';
    }else if (char.offsetLeft >= innerWidth ){
        char.style.left = `${innerWidth - char.offsetWidth - 1}px`
    }
}

addEventListener('resize', resizeFn);
/* Fix screen orientation issue in mobile devices */
screen.orientation.addEventListener('change', resizeFn);

char.addEventListener('touchmove', (e)=>{
    if (!previousTouch){

        previousTouch = e.touches.item(0);
        return;
    }
    const currentTouch = e.touches.item(0);
    doRun((currentTouch.clientX - previousTouch.clientX) < 0);
    if (currentTouch.clientY < previousTouch.clientY) doJump();
    previousTouch = currentTouch;
});

char.addEventListener('touchend', (e)=>{
    previousTouch = null;
    dx = 0;
})