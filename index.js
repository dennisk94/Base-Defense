'use strict';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const scoreEl = document.querySelector('#score');
const modal = document.querySelector('#modal');
const modalScore = document.querySelector('#modal-score');
const restartBtn = document.querySelector('#restart-button');
const startBtn = document.querySelector('#start-btn'); 
const startModal = document.querySelector('#game-start-modal');
const volumeUp = document.querySelector('#volumeUp');
const volumeOff = document.querySelector('#volumeOff');

// Create player class

const x = canvas.width / 2;
const y = canvas.height / 2;
let player = new Player ( x, y, 10, 'white');
let projectiles = [];
let enemies     = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;
let powerUps = [];
let frames = 0;
let backgroundParticles = [];
let game = {
    active: false
}

const init = () => {
    player = new Player ( x, y, 10, 'white');
    projectiles = [];
    enemies     = [];
    particles = [];
    powerUps = [
        new PowerUp( {
            position: {
                x: -30,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: Math.random() + .5,
                y: 0
            }
        } )
    ];
    animationId;
    score = 0;
    scoreEl.textContent = 0;
    frames = 0;
    backgroundParticles = [];
    game = {
        active: true
    }
    const spacing = 30;
    for  ( let x = 0; x < canvas.width + spacing; x += spacing ) {
        for ( let y = 0; y < canvas.height + spacing; y += spacing ) {
            backgroundParticles.push( new BackgroundParticle( {
                position: {
                    x,
                    y,
                },
                radius: 3,
            }) )
        }
    }
}

const spawnEnemies = () => {
    intervalId = setInterval( () => {
        const radius = Math.random() * (30 - 4) + 4;
        const color = `hsl( ${ Math.random() * 360 }, 50%, 50%)`;
        const xCanvas = canvas.width / 2 ;
        const yCanvas = canvas.height / 2;
        let x;
        let y;

        if ( Math.random() < .5 ) {
            x = Math.random() < .5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
            // y = Math.random() < .5 ? 0 - radius : canvas.height + radius;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < .5 ? 0 - radius : canvas.height + radius;
        }

        // Return angle in radians
        const angle = Math.atan2( yCanvas - y, xCanvas - x );
        // Convert radians to x and y length
        const velocity = {
            x: Math.cos( angle ),
            y: Math.sin( angle ),
        }

        enemies.push( new Enemy ( x, y, radius, color, velocity ) )
    }, 1000 );
}

let spawnPowerUpsId;
const spawnPowerUps = () => {
    spawnPowerUpsId = setInterval( () => {
        powerUps.push( new PowerUp( {
            position: {
                x: -30,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: Math.random() + 1,
                y: 0
            }
        }))
    }, 10000);
}

const createScoreLabel = ( { position, score } ) => {
    const scoreLabel = document.createElement('label');
    scoreLabel.innerHTML = score;
    scoreLabel.style.color = 'white';
    scoreLabel.style.position = 'absolute';
    scoreLabel.style.left = position.x + 'px';
    scoreLabel.style.top = position.y + 'px';
    scoreLabel.style.userSelect = 'none';
    document.body.appendChild(scoreLabel);
    gsap.to( scoreLabel, {
        opacity: 0,
        y: -30,
        duration: .75,
        onComplete: () => {
            scoreLabel.parentNode.removeChild(scoreLabel);
        }
    })
}

const animate = () => {
    animationId = requestAnimationFrame( animate );
    context.fillStyle = 'rgba( 0, 0, 0, .1 )';
    context.fillRect( 0, 0, canvas.width, canvas.height );
    frames++;
    backgroundParticles.forEach(backgroundParticle => {
        backgroundParticle.draw();
        const dist = Math.hypot(player.x - backgroundParticle.position.x, player.y - backgroundParticle.position.y);

        if ( dist < 100 ) {
            backgroundParticle.alpha = 0;
            if ( dist > 70 ) {
                backgroundParticle.alpha = .5
            }
        } else if ( dist > 100 && backgroundParticle.alpha < .1 ) {
            backgroundParticle.alpha += .01;
        } else if ( dist > 100 && backgroundParticle.alpha > .1 ) {
            backgroundParticle.alpha -= .01;
        }
    })
    player.update();
    for ( let i = powerUps.length - 1; i >= 0; i-- ) {
        const powerUp = powerUps[i];
        // For each power up, create a power up
        if ( powerUp.position.x > canvas.width ) {
            powerUps.splice( i, 1 );
        } else {
            powerUp.update();
        }
        powerUp.update();
        // Get the distance between power up and player
        const dist = Math.hypot( player.x - powerUp.position.x , player.y - powerUp.position.y );
        // If player and powerup collide, remove from powerups array
        if ( dist < powerUp.image.height / 2 + player.radius ) {
            powerUps.splice( i, 1 );
            player.powerUp = 'MachineGun';
            player.color = 'yellow';
            audio.powerUp.play();

            setTimeout( () => {
                player.powerUp = null;
                player.color = 'white';
            }, 5000);
        }
    }

    console.log(powerUps);

    // Machine gun animation / implementation
    if ( player.powerUp === 'MachineGun' ) {
        // Return angle in radians
        const angle = Math.atan2( mouse.position.y - player.y, mouse.position.x - player.x );
        // Convert radians to x and y length
        const velocity = {
        x: Math.cos( angle ) * 5,
        y: Math.sin( angle ) * 5,
    }
        if ( frames % 2 === 0 ) {
            projectiles.push( new Projectile( player.x, player.y, 5, 'yellow', velocity ) );
        }
        
        if ( frames % 5 === 0 ) {
            audio.shoot.play();
        }
    }

    for ( let particleIndex = particles.length - 1; particleIndex >= 0; particleIndex-- ) {
        const particle = particles[ particleIndex ];
        if ( particle.alpha <= 0 ) {
            particles.splice( particleIndex, 1 );
        } else {
            particle.update();
        }
    }
    for ( let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex-- ) {
        const projectile = projectiles[ projectileIndex ];

        projectile.update();

        if ( 
                projectile.x + projectile.radius < 0            ||
                projectile.x - projectile.radius > canvas.width ||
                projectile.y + projectile.radius < 0            ||
                projectile.y - projectile.radius > canvas.height
            ) {
                projectiles.splice(projectileIndex, 1);
        }
    }

    for ( let index = enemies.length - 1; index >= 0; index-- ) {
        const enemy = enemies[ index ];

        enemy.update();

        // Obtain distance between player and enemy x, y
        const dist = Math.hypot( player.x - enemy.x , player.y - enemy.y );
        if ( dist - enemy.radius - player.radius < 1 ) {
            // If distance between enemy and player is < 1 stop animation on the animationId frame.
            cancelAnimationFrame(animationId);
            clearInterval(intervalId);
            clearInterval(spawnPowerUpsId);
            audio.death.play();
            game.active = false;
            modal.style.display = 'block';
            gsap.fromTo('#modal', {
                scale: .8,
                opacity: 0,
            },
            {
                scale: 1,
                opacity: 1,
                ease: 'expo'
            }
            )
            modalScore.textContent = score;
        }

        // Check for collision between enemy and projectile
        for ( let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex-- ) {
            const projectile = projectiles[ projectileIndex ];
            // hypot() returns the distance between projectile and enemy
            const dist = Math.hypot( projectile.x - enemy.x , projectile.y - enemy.y );
            // When enemy and projectile touch
            if ( dist - enemy.radius - projectile.radius < 1 ) {

                // Create explosions
                for ( let i = 0; i < enemy.radius * 2; i++ ) {
                    particles.push( new Particle( 
                        projectile.x, 
                        projectile.y,
                        Math.random() * 2,
                        enemy.color,
                        {
                            x: (Math.random() - .5) * (Math.random() * 6),
                            y: (Math.random() - .5) * (Math.random() * 6),
                        }
                    ))
                }

                // If enemy radius is greater than 10 decrease its radius by 10, else remove the enemy entirely
                // Minimum enemy radius is 10
                // Shrink enemy
                if ( enemy.radius - 10 > 5 ) {
                    audio.damageTaken.play();
                    // Add 100 points every time we shrink an enemy
                    score += 100;
                    scoreEl.innerHTML = score;
                    gsap.to( enemy, {
                        radius: enemy.radius - 10
                    })
                    createScoreLabel( { 
                        position: {
                            x: projectile.x,
                            y: projectile.y,
                        },
                        score: 100
                } );
                    // Remove projectile to prevent enemy radius reducing constantly.
                        projectiles.splice(projectileIndex, 1);
                } else {
                    // Remove enemy
                    // Add 150 points every time we remove enemy
                    audio.explode.play();
                    score += 150;
                    scoreEl.innerHTML = score;
                    createScoreLabel({ 
                        position: {
                            x: projectile.x,
                            y: projectile.y,
                        },
                        score: 150 
                });
                    // Change bgc color
                    backgroundParticles.forEach( backgroundParticle => {
                        gsap.set( backgroundParticle, {
                            color: 'white',
                            alpha: 1,
                        });
                        gsap.to(backgroundParticle, {
                            color: enemy.color,
                            alpha: .1,
                        })
                        // backgroundParticle.color = enemy.color
                    } );
                    enemies.splice(index, 1);
                    projectiles.splice(projectileIndex, 1);
                }
            }
        }
    }
}

let audioInit = false;

// Event listener for mouse click, then create projectile
window.addEventListener('click', (e) => {
    if ( !audio.bgc.playing() && !audioInit ) {
        audio.bgc.play();
        audioInit = true;
    }
    if ( game.active ) {
        // Get x and y of center of canvas width and height
        const x = player.x;
        const y = player.y;
        // x and y coordinates of click event
        const xDirection = e.clientX;
        const yDirection = e.clientY;
        // Return angle in radians
        const angle = Math.atan2( yDirection - y, xDirection - x );
        // Convert radians to x and y length
        const velocity = {
            x: Math.cos( angle ) * 5,
            y: Math.sin( angle ) * 5,
        }
        projectiles.push( new Projectile ( x, y, 5, 'white', velocity ) );
        audio.shoot.play();
    }
  
});

const mouse = {
    position: {
        x: 0,
        y: 0,
    }
}
addEventListener('mousemove', (e) => {
    mouse.position.x = e.clientX;
    mouse.position.y = e.clientY;
});

restartBtn.addEventListener('click', () => {
    audio.select.play();
    init();
    animate();
    spawnEnemies();
    spawnPowerUps();
    gsap.to('#modal', {
        opacity: 0,
        scale: .8,
        duration: .3,
        ease: 'expo.in',
        onComplete: () => {
            modal.style.display = 'none';
        }
    });
    // modal.style.display = 'none';
});

startBtn.addEventListener('click', () => {
    audio.select.play();
    init();
    animate();
    spawnEnemies();
    spawnPowerUps();
    gsap.to('#game-start-modal', {
        opacity: 0,
        scale: .8,
        duration: .3,
        ease: 'expo.in',
        onComplete: () => {
            startModal.style.display = 'none';
        }
    });
})

// Mute everything
volumeUp.addEventListener('click', () => {
    audio.bgc.pause();
    volumeOff.style.display = 'block';
    volumeUp.style.display  = 'none';

    for ( let key in audio ) {
        audio[key].mute(true);
    }
})

// Unmute everything
volumeOff.addEventListener('click', () => {
    if ( audioInit ) {
        audio.bgc.play();
    }
    volumeOff.style.display = 'none';
    volumeUp.style.display  = 'block';
    for ( let key in audio ) {
        audio[key].mute(false);
    }
})

document.addEventListener('visibilitychange', () => {
    if ( document.hidden ) {
        // Pause enemies and powerups
        clearInterval(intervalId);
        clearInterval(spawnPowerUpsId);
    } else {
        // Spawn enemies and powerups
        spawnEnemies();
        spawnPowerUps();
    }
})

window.addEventListener( 'keydown', (e) => {
    switch ( e.key ) {
        case 'd':
        player.velocity.x += 1;
            break;
        case 'w':
            player.velocity.y -= 1;
            break;
        case 'a':
            player.velocity.x -= 1;
            break;
        case 's':
            player.velocity.y += 1;
            break;
    }
});


