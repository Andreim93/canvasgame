'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; //window poate sa lipseasca!!!
canvas.height = window.innerHeight;
const scoreEl = document.querySelector('#score');
const startBtn = document.querySelector('#startBtn');
const modalEl = document.querySelector('#modalEl');
const scoreModal = document.querySelector('#scoreModal');
//clase, definitii, prototipuri
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

}
const friction = 0.98;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }

}

// const clickFunction = function (event) {
//     const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', null);

//     projectile.draw();
// };

// instantieri
const x = canvas.width / 2;
const y = canvas.height / 2;

let player1 = new Player(x, y, 30, 'white');
let projectiles = [];
let enemies = [];
let particles = [];
let interval;
function init() {
    clearInterval(interval);
    // player1 = new Player(x, y, 30, 'white');
    projectiles = [];
    //  enemies.splice(0, enemies.lenght - 1);
    enemies = [];
    // while (enemies.length > 0) {
    //     enemies.pop();
    // }
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    scoreModal.innerHTML = score;

    console.log(enemies);
}



// const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', {
//     x: -1,
//     y: 1
// });


function spawnEnemies() {
    console.log('func called');

    interval = setInterval(() => {
        const radius = Math.random() * (30 - 5) + 5;

        let x;
        let y;
        if (Math.random() < 0.5) {
            x = (Math.random() < 0.5) ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = (Math.random() < 0.5) ? 0 - radius : canvas.height + radius;
        }


        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;


        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        console.log('enemy spawned')
        enemies.push(new Enemy(x, y, radius, color, velocity));

    }, 1000);
}

let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate);//salvam numarul frame-ului
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player1.draw();
    particles.forEach((particle, partIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(partIndex, 1);
        } else {
            particle.update();
        }
    })
    // projectile loop update
    projectiles.forEach((projectile, pIndex) => {

        projectile.update();
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width - 0 || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {

            setTimeout(() => { projectiles.splice(pIndex, 1); }, 0);
        }

    });
    //enemy loop update
    enemies.forEach((enemy, index) => {
        enemy.update();
        //verific distanta dintre player si enemy
        const dist = Math.hypot(player1.x - enemy.x, player1.y - enemy.y);
        //end game
        if (dist - player1.radius - enemy.radius < 1) {

            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            scoreModal.innerHTML = score;
        }

        projectiles.forEach((projectile, pIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - projectile.radius - enemy.radius < 1) {



                //explozii
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 8),
                        y: (Math.random() - 0.5) * (Math.random() * 8)
                    }))
                }

                if (enemy.radius - 10 > 5) {
                    //increase score
                    //scoreEl.textContent = Number(scoreEl.textContent) + 10;
                    score += 10;
                    scoreEl.textContent = score;
                    //scoreEl.innerHTML = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    // enemy.radius -= 10;
                    setTimeout(() => {
                        projectiles.splice(pIndex, 1);
                    }, 0)
                } else {
                    //setTimeout - ca sa nu mai sacadeze cand un inamic este distrus
                    setTimeout(() => {
                        score += 50;
                        scoreEl.textContent = score;
                        enemies.splice(index, 1);
                        projectiles.splice(pIndex, 1);
                    }, 0)
                }

            }

        });
    })

    //     projectile.draw();
    //     projectile.update();
}

window.addEventListener('click', (event) => {
    player1.radius += 5;
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    //console.log(angle);
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
    //  console.log(projectiles);
});
document.querySelector('canvas').addEventListener('touchstart', (event) => {
    player1.radius += 5;
    const angle = Math.atan2(event.touches[0].clientY - canvas.height / 2, event.touches[0].clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    //console.log(angle);
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
    //  console.log(projectiles);
}, false);

startBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';

})

// animate();
// spawnEnemies();