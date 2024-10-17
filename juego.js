var fondo;
var carro;
var cursores;
var enemigos;
var gasolinaGroup;
var juego = new Phaser.Game(290, 540, Phaser.CANVAS, 'bloque_juego');
var contadorGasolina = 0; // Contador de gasolina
var textoContador; // Texto para mostrar el contador
var vidas = 3; // Número de vidas
var textoVidas; // Texto para mostrar las vidas
var score = 0; // Puntuación
var textoScore; // Texto para mostrar la puntuación
var nivel = 1; // Nivel actual
var velocidadEnemigos = 200; // Velocidad inicial de los enemigos
var sonidoFondo; // Sonido de fondo
var sonidoColision; // Sonido de colisión

var Juego = {
    preload: function() {
        juego.load.image('bg', './img/bg.png');
        juego.load.image('carro', './img/carro.png');
        juego.load.image('carroMalo', './img/carroMalo.png');
        juego.load.image('carroMalo2', './img/carroMalo2.png'); // Cargar nuevo sprite
        juego.load.image('gasolina', './img/gas.png');
        juego.load.audio('fondo', './audio/fondo.mp3'); // Sonido de fondo
        juego.load.audio('colision', './audio/colision.mp3'); // Sonido de colisión
    },
    create: function() {
        sonidoFondo = juego.add.audio('fondo');
        sonidoColision = juego.add.audio('colision');

        fondo = juego.add.tileSprite(0, 0, 290, 540, 'bg');
        carro = juego.add.sprite(juego.width / 2, 496, 'carro');
        carro.anchor.setTo(0.5);
        juego.physics.arcade.enable(carro);

        enemigos = juego.add.group();
        juego.physics.arcade.enable(enemigos);
        enemigos.enableBody = true;
        enemigos.createMultiple(20, 'carroMalo');
        enemigos.setAll('anchor.x', 0.5);
        enemigos.setAll('anchor.y', 0.5);
        enemigos.setAll('outOfBoundsKill', true);
        enemigos.setAll('checkWorldBounds', true);

        gasolinaGroup = juego.add.group();
        juego.physics.arcade.enable(gasolinaGroup);
        gasolinaGroup.enableBody = true;
        gasolinaGroup.createMultiple(20, 'gasolina');
        gasolinaGroup.setAll('outOfBoundsKill', true);
        gasolinaGroup.setAll('checkWorldBounds', true);

        cursores = juego.input.keyboard.createCursorKeys();
        juego.time.events.loop(1500, this.crearCarroMalo, this);
        juego.time.events.loop(2000, this.crearGasolina, this);

        // Crear textos para el contador de gasolina y vidas
        textoContador = juego.add.text(10, 10, 'Gasolina: 0', { font: '16px Arial', fill: '#ffffff' });
        textoVidas = juego.add.text(10, 30, 'Vidas: 3', { font: '16px Arial', fill: '#ffffff' });
        textoScore = juego.add.text(10, 50, 'Puntuación: 0', { font: '16px Arial', fill: '#ffffff' });

        // Mostrar la portada con el nombre
        var titulo = juego.add.text(juego.world.centerX, juego.world.centerY - 20, 'Ivan Manrique', 
            { font: '20px Arial', fill: '#ffffff' });
        titulo.anchor.set(0.5);
        juego.time.events.add(Phaser.Timer.SECOND * 2, function() { titulo.destroy(); }, this);
    },
    update: function() {
        fondo.tilePosition.y += 3;
        if (cursores.right.isDown && carro.position.x < 245) {
            carro.position.x += 5;
        } else if (cursores.left.isDown && carro.position.x > 45) {
            carro.position.x -= 5;
        }

        juego.physics.arcade.overlap(carro, enemigos, this.restartGame, null, this);
        juego.physics.arcade.overlap(carro, gasolinaGroup, this.recogerGasolina, null, this);

        // Aumentar la velocidad de los enemigos si el puntaje es 3
        if (score >= 3 && nivel === 1) {
            nivel = 2;
            velocidadEnemigos += 100; // Aumentar velocidad para el segundo nivel
            juego.time.events.loop(1500, this.crearCarroMalo, this); // Cambiar la creación de enemigos
        }
    },
    crearCarroMalo: function() {
        var posicion = Math.floor(Math.random() * 3) + 1;
        var enemigo = enemigos.getFirstDead();
        if (enemigo) {
            enemigo.reset(posicion * 73, 0);
            enemigo.body.velocity.y = velocidadEnemigos; // Velocidad de los enemigos
            enemigo.anchor.setTo(0.5);
            
            // Cambiar el sprite dependiendo del nivel
            if (nivel === 2) {
                enemigo.loadTexture('carroMalo2'); // Usar carroMalo2 en nivel 2
            } else {
                enemigo.loadTexture('carroMalo'); // Usar carroMalo en nivel 1
            }
        }
    },
    crearGasolina: function() {
        var posicion = Math.floor(Math.random() * 3) + 1;
        var nuevaGasolina = gasolinaGroup.getFirstDead();
        if (nuevaGasolina) {
            nuevaGasolina.reset(posicion * 73, 0);
            nuevaGasolina.body.velocity.y = 200; // Velocidad de la gasolina
            nuevaGasolina.anchor.setTo(0.5);
        }
    },
    recogerGasolina: function(carro, gasolina) {
        gasolina.kill(); // Eliminar la gasolina al recogerla
        contadorGasolina++; // Aumentar el contador
        score++; // Aumentar puntuación
        textoContador.text = 'Gasolina: ' + contadorGasolina; // Actualizar el texto del contador
        textoScore.text = 'Puntuación: ' + score; // Actualizar puntuación

        // Reproducir sonido de fondo al recoger gasolina
        sonidoFondo.play(); // Reproducir sonido de fondo

        // Comprobar si se han recogido 10 puntos
        if (score >= 10) {
            alert("¡Ganaste!");
            this.resetGame(); // Reiniciar el juego
        }
    },
    restartGame: function() {
        sonidoColision.play(); // Reproducir sonido de colisión
        vidas--; // Disminuir vidas
        textoVidas.text = 'Vidas: ' + vidas; // Actualizar texto de vidas

        // Reiniciar contador de gasolina y puntaje
        contadorGasolina = 0; // Reiniciar el contador de gasolina
        score = 0; // Reiniciar puntuación
        textoContador.text = 'Gasolina: 0'; // Reiniciar el texto del contador
        textoScore.text = 'Puntuación: 0'; // Reiniciar el texto de puntuación

        if (vidas <= 0) {
            alert("¡Vuelve a intentarlo!");
            this.resetGame(); // Reiniciar el juego
        }
        
        // Volver el carro a la posición inicial
        carro.position.x = juego.width / 2; 
        carro.position.y = 496; 

        // Reubicar los enemigos y gasolinas sin eliminarlos
        enemigos.callAll('kill'); // Eliminar todos los enemigos
        gasolinaGroup.callAll('kill'); // Eliminar todas las gasolinas
    },
    resetGame: function() {
        contadorGasolina = 0; // Reiniciar el contador
        textoContador.text = 'Gasolina: 0'; // Reiniciar el texto del contador
        vidas = 3; // Reiniciar vidas
        textoVidas.text = 'Vidas: 3'; // Reiniciar el texto de vidas
        score = 0; // Reiniciar puntuación
        textoScore.text = 'Puntuación: 0'; // Reiniciar el texto de puntuación
        nivel = 1; // Reiniciar nivel
        velocidadEnemigos = 200; // Reiniciar velocidad
        juego.state.start('Juego'); // Reiniciar el estado del juego
    }
};

juego.state.add('Juego', Juego);
juego.state.start('Juego');