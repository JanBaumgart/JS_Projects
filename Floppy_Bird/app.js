// ===== Flappy-style Demo (scaled to your assets) =====
// Phaser 3 game config
const BG_HEIGHT = 900;
const ROAD_HEIGHT = 160;
const GAME_WIDTH = 1536;
const GAME_HEIGHT = BG_HEIGHT + ROAD_HEIGHT;




// --- Tuning knobs (easy to change) ---
const BIRD_SIZE = 88;      // sichtbare Größe des Vogels (Quelle 1024×1024)

const COL_WIDTH = 70;      // sichtbare Breite der Säulen
const COL_HEIGHT = GAME_HEIGHT - 800 // etwas Überstand
const BIRD_SPEED_X = 200;   // Vorwärtsgeschwindigkeit
const JUMP_VY = -250;      // Sprung-Impuls
const GRAVITY_Y = 320;     // Welt-Gravitation



let cursors;
let messageToPlayer;
let bird;
let isGameStarted = false;
let hasLanded = false;
let hasBumped = false;
let hasWon = false;
let currentSkinKey = 'sarah';
let skinBtn, uiBg;



const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game',
    physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY_Y }, debug: false } },
    scene: { key: 'Main', preload, create, update }, // <-- Key vergeben!
    scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.CENTER_BOTH }
};

const game = new Phaser.Game(config);








// ---------- Scene: Preload ----------
function preload() {
    // Passe die Pfade an deine Ordnerstruktur an
    this.load.image('background', 'assets/background.png');  // 1536×1024 (wird gestreckt)
    this.load.image('road', 'assets/road.png');              // 1536×249
    this.load.image('column', 'assets/column.png');          // 297×1422
    this.load.image('sarah', 'assets/sarah.png');
    this.load.image('delfini', 'assets/delfini.png');
}







// 0.6 = 60% der sichtbaren Breite -> deutlich schmaler
const COL_HITBOX_SCALE_X_BOTTOM = 0.7;
const COL_HITBOX_SCALE_X_TOP = 0.6;

// Helper zum Anpassen der Hitbox einer Säule (static body!)
function applyColumnHitbox(sprite, widthScale) {
    const hitW = COL_WIDTH * widthScale;
    // erst DisplaySize/refreshBody setzen, dann Body verengen + nochmal refreshBody
    sprite.body.setSize(hitW, COL_HEIGHT);
    sprite.body.setOffset((COL_WIDTH - hitW) / 2, 0); // zentrieren
    sprite.refreshBody(); // wichtig bei static bodies
}









// ---------- Scene: Create ----------
function create() {

    isGameStarted = false;
    hasLanded = false;
    hasBumped = false;
    hasWon = false;


    // Hintergrund auf Canvas-Größe ziehen
    const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg.setDisplaySize(GAME_WIDTH, BG_HEIGHT);

    // Straße unten anhängen
    const roads = this.physics.add.staticGroup();
    const roadY = BG_HEIGHT + ROAD_HEIGHT / 2;
    const road = roads.create(GAME_WIDTH / 2, roadY, 'road');
    road.setDisplaySize(GAME_WIDTH, ROAD_HEIGHT).refreshBody();

    // Vogel erstellen
    bird = this.physics.add.sprite(60, 100, currentSkinKey);
    bird.setDisplaySize(BIRD_SIZE, BIRD_SIZE);
    bird.setCollideWorldBounds(true);
    bird.setBounce(0.2);

    // bis Spielstart „ruhig“
    bird.body.allowGravity = false;
    bird.setVelocity(0, 0);

    // World-bounds-Event aktivieren
    bird.body.onWorldBounds = true;

    // Gewonnen-Event (rechter Rand)
    this.physics.world.on('worldbounds', (body, up, down, left, right) => {
        if (body.gameObject !== bird || !right || hasWon) return;

        hasWon = true;

        // Vogel einfrieren
        bird.setVelocity(0, 0);
        bird.body.allowGravity = false;

        // Glückwunsch-Text groß & mittig
        messageToPlayer.setText('🎉 Glückwunsch! Du hast das Ziel erreicht!');
        messageToPlayer.setStyle({ fontSize: '36px', padding: { x: 12, y: 8 } });
        messageToPlayer.setOrigin(0.5);
        messageToPlayer.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }, this);

    // Säulen-Gruppen
    const bottomColumns = this.physics.add.staticGroup();
    const topColumns = this.physics.add.staticGroup();

    // Layout der Säulen
    const bottomXs = [280, 815, 1350];
    const topXs = [547.5, 1082.5];

    const hitW = COL_WIDTH * 0.7;

    bottomXs.forEach(x => {
        const c = bottomColumns.create(x, BG_HEIGHT - (COL_HEIGHT / 2), 'column');
        c.setDisplaySize(COL_WIDTH, COL_HEIGHT).refreshBody();
        applyColumnHitbox(c, COL_HITBOX_SCALE_X_BOTTOM);

        // Body verschmälern und mittig ausrichten
        c.body.setSize(hitW, COL_HEIGHT);
        c.body.setOffset((COL_WIDTH - hitW) / 2, 0);
        c.refreshBody();
    });


    topXs.forEach(x => {
        const c = topColumns.create(x, (COL_HEIGHT / 2), 'column');
        c.setDisplaySize(COL_WIDTH, COL_HEIGHT);
        c.toggleFlipY();
        c.refreshBody();
        applyColumnHitbox(c, COL_HITBOX_SCALE_X_TOP);

        c.body.setSize(hitW, COL_HEIGHT);
        c.body.setOffset((COL_WIDTH - hitW) / 2, 0);
        c.refreshBody();
    });


    // Kollisionen
    this.physics.add.collider(bird, roads, () => hasLanded = true, null, this);
    this.physics.add.collider(bird, bottomColumns, () => hasBumped = true, null, this);
    this.physics.add.collider(bird, topColumns, () => hasBumped = true, null, this);

    // 
    // Steuerung
    cursors = this.input.keyboard.createCursorKeys();


    // Hinweis-Text
    messageToPlayer = this.add.text(0, 0, 'Leertaste zum starten drücken', {
        fontFamily: '"Comic Sans MS", Times, serif',
        fontSize: '40px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 6 }
    });
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, bg, 0, -10);



    // Skin-Button
    const label = () => currentSkinKey === 'sarah'
        ? 'Sarah (klicken)'
        : 'Delfini (klicken)';

    // halbtransparenter Button-Hintergrund
    uiBg = this.add.rectangle(120, 44, 220, 40, 0x000000, 0.55)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1000);

    skinBtn = this.add.text(120, 44, label(), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ffffff'
    })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(1001);      // über dem Rechteck

    skinBtn.on('pointerdown', () => {
        if (isGameStarted || hasWon || hasBumped || hasLanded) return;
        currentSkinKey = (currentSkinKey === 'sarah') ? 'delfini' : 'sarah';
        bird.setTexture(currentSkinKey);
        bird.setDisplaySize(BIRD_SIZE, BIRD_SIZE);
        // falls du eine kleinere Hitbox nutzt:
        // bird.body.setSize(BIRD_SIZE * 0.7, BIRD_SIZE * 0.7, true);
        skinBtn.setText(label());
    });


    // Start beim ersten SPACE-Drücken
    this.input.keyboard.on('keydown-SPACE', () => {
        if (!isGameStarted) {
            isGameStarted = true;
            messageToPlayer.setText('Du schaffst das!');

            bird.body.allowGravity = true;
            bird.setVelocityY(JUMP_VY);

            // Button ausblenden & deaktivieren
            skinBtn?.setVisible(false);
            uiBg?.setVisible(false);
            skinBtn?.disableInteractive();
        }
    });
}





// ---------- Scene: Update ----------
function update() {
    // Jump (Pfeil hoch oder Space)
    if (cursors.up?.isDown && !hasLanded && !hasBumped) {
        bird.setVelocityY(JUMP_VY);
    }
    if (cursors.space?.isDown && !hasLanded && !hasBumped) {
        bird.setVelocityY(JUMP_VY);
    }

    // Vorwärtsbewegung nur während des Spiels
    if (!isGameStarted || hasLanded || hasBumped || hasWon) {
        bird.body.velocity.x = 0;
    }
    else {
        bird.body.velocity.x = BIRD_SPEED_X;
    }

    // Statusmeldungen
    if (!hasWon && hasBumped && messageToPlayer.text !== 'Köpfchen gestoßen, aber tut ned weh!') {
        messageToPlayer.setText('Köpfchen gestoßen, aber tut ned weh!');
    }
    if (!hasWon && hasLanded && !hasBumped && messageToPlayer.text !== 'Oh Nein! aber alles gut, hat ned weh getan!') {
        messageToPlayer.setText('Oh Nein! aber alles gut, hat ned weh getan!');
    }
}

// globale Restart-Funktion
window.restartGame = function () {
    const scene = game.scene.getScene('Main');
    scene.scene.restart(); // lädt preload nicht neu, aber create/update laufen frisch
};

// Button-Listener anhängen, sobald DOM da ist
window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('restart-btn');
    btn?.addEventListener('click', () => {
        window.restartGame();
    });
});