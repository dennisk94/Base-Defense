class Player {

    constructor ( x, y, radius, color ) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = {
            x: 0,
            y: 0,
        }
        this.powerUp;
    }

    draw () {
        context.beginPath()
        context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
        context.fillStyle = this.color;
        context.fill();
    }

    update() {
        const friction = .99;
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        // Collision detection for x axis
        if ( 
                this.x + this.radius + this.velocity.x <= canvas.width  &&
                this.x - this.radius + this.velocity.x >= 0
            ) {
            this.x += this.velocity.x
        } else {
            this.velocity.x = 0;
        }
        // Collision detection for y axis
        if ( 
            this.y + this.radius + this.velocity.y <= canvas.height  &&
            this.y - this.radius + this.velocity.y >= 0
        ) {
        this.y += this.velocity.y
        } else {
            this.velocity.y = 0;
        }
    }
}

class Projectile extends Player {

    constructor ( x, y, radius, color, velocity ) {
        super( x, y, radius, color );
        this.velocity = velocity;
    }

    draw () {
        context.beginPath()
        context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
        context.fillStyle = this.color;
        context.fill();
    }

    // Update position of projectile using new x, y coordinates and velocity
    update () {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy extends Projectile {
    constructor ( x, y, radius, color, velocity ) {
        super ( x, y, radius, color, velocity );
        this.type = 'Linear';
        this.radians = 0;
        this.center = {
            x,
            y,
        }

        // Determine and set randomly if enemy is going to follow player or move linearly to center
        if ( Math.random() < .5 ) {
            this.type = 'Homing';

            if ( Math.random() < .5 ) {
                this.type = 'Spinning';

                if ( Math.random() < .5 ) {
                    this.type = 'Homing Spinning'
                }
            }
        }
    }

    draw () {
        context.beginPath()
        context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
        context.fillStyle = this.color;
        context.fill();
    }

    // Update position of projectile using new x, y coordinates and velocity
    update () {
        this.draw();
        if ( this.type === 'Spinning' ) {
            // Spinning
            this.radians += .1;
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;
            this.x = this.center.x + Math.cos(this.radians) * 30;
            this.y = this.center.y + Math.sin(this.radians) * 30;
        }
        // Check for type of enemy
        else if ( this.type === 'Homing' ) {
            // Homing
            // Get angle necessary for enemy to target player location
            const angle = Math.atan2( player.y - this.y, player.x - this.x );
            this.velocity.x = Math.cos(angle); // x length
            this.velocity.y = Math.sin(angle); // y length
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        } 
        else if ( this.type === 'Homing Spinning' ) {
            this.radians += .1;
            const angle = Math.atan2( player.y - this.center.y, player.x - this.center.x );
            this.velocity.x = Math.cos(angle); // x length
            this.velocity.y = Math.sin(angle); // y length
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;
            this.x = this.center.x + Math.cos(this.radians) * 30;
            this.y = this.center.y + Math.sin(this.radians) * 30;
        }
        else {
            // Linear
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        }
    }
}

const friction = .99;

class Particle extends Projectile {
    constructor ( x, y, radius, color, velocity ) {
        super ( x, y, radius, color, velocity );
        this.alpha = 1;
    }

    draw () {
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }

    // Update position of projectile using new x, y coordinates and velocity
    update () {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= .01;
    }
}

class BackgroundParticle {
    constructor ( { position, radius = 3, color = 'blue' } ) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.alpha = .1;
    }
    draw () {
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }
}

// Create powerup
class PowerUp {
    constructor ( { position = { x: 0, y: 0 }, velocity } ) {
        this.position = position;
        this.velocity = velocity;
        this.image = new Image();
        this.image.src = './img/lightningBolt.png';
        this.alpha = 1;
        gsap.to( this, {
            alpha: 0,
            duration: .3,
            repeat: -1,
            yoyo: true,
            ease: 'linear'
        });
        this.radians = 0;
    }

    draw () {
        context.save();
        context.globalAlpha = this.alpha;
        context.translate(this.position.x + this.image.width / 2, this.position.y + this.image.height / 2);
        context.rotate(this.radians);
        context.translate(-this.position.x - this.image.width / 2, -this.position.y - this.image.height / 2);
        context.drawImage(this.image, this.position.x, this.position.y);
        context.restore();
    }

    update () {
        this.draw();
        this.radians += .01;
        this.position.x += this.velocity.x;
        // console.log(this.position.x);
    }
}