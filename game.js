/* Cerezas de Identidad — Phaser 3
   Escenas: Boot (carga loading.png) → Loading (pantalla de carga) → Dress (vestir) → Game (recoger cerezas) */
(() => {
  const W = 960, H = 600;
  const FD = '"Grandstander", "Trebuchet MS", sans-serif';
  const FB = '"Nunito", "Segoe UI", sans-serif';
  const COL = {
    plum: 0x2a1b2e, plumL: 0x4a3150, cream: 0xfff4e0, cherry: 0xd7263d,
    cherryD: 0xb81d31, mustard: 0xf2b134, skin: 0xe2a77c, ink: 0x2a1b2e
  };
  const HEX = n => '#' + n.toString(16).padStart(6, '0');
  const TOTAL = 8;        // cerezas = conceptos
  const MAX_ON_FIELD = 3; // cerezas visibles a la vez

  const SLOTS = [
    { id: 'cabeza', label: 'Cabeza' },
    { id: 'torso', label: 'Torso' },
    { id: 'piernas', label: 'Piernas' },
    { id: 'pies', label: 'Pies' }
  ];
  const ORDER = { pies: 1, piernas: 2, torso: 3, cabeza: 4 };

  // ---------- Dibujo de las prendas (coordenadas locales; x,y = posición sobre el cuerpo de 160x260) ----------
  const ITEMS = [
    {
      key: 'gorra', name: 'Gorra', art: 'la gorra roja', slot: 'cabeza', x: 38, y: 4, w: 90, h: 44,
      draw(g) {
        g.fillStyle(COL.cherry); g.beginPath(); g.slice(42, 40, 38, Math.PI, Math.PI * 2); g.closePath(); g.fillPath();
        g.fillStyle(COL.cherryD); g.fillRect(4, 34, 76, 7);
        g.fillStyle(COL.cherry); g.fillRoundedRect(44, 34, 46, 10, 5);
        g.fillStyle(COL.cream); g.fillCircle(42, 4, 4);
        g.lineStyle(2, COL.cherryD); g.lineBetween(42, 4, 42, 34);
      }
    },
    {
      key: 'sombrero', name: 'Sombrero vueltiao', art: 'el sombrero vueltiao', slot: 'cabeza', x: 10, y: 0, w: 140, h: 48,
      draw(g) {
        g.fillStyle(0xefe3c2); g.fillEllipse(70, 34, 138, 24);
        g.lineStyle(2, COL.ink); g.strokeEllipse(70, 34, 122, 18); g.strokeEllipse(70, 34, 98, 13);
        g.fillStyle(0xefe3c2); g.fillRoundedRect(44, 2, 52, 32, 10);
        g.fillStyle(COL.ink); g.fillRect(44, 20, 52, 4); g.fillRect(44, 27, 52, 3);
        g.lineStyle(1.5, COL.ink); g.lineBetween(56, 4, 56, 18); g.lineBetween(70, 3, 70, 18); g.lineBetween(84, 4, 84, 18);
      }
    },
    {
      key: 'camiseta', name: 'Camiseta', art: 'la camiseta turquesa', slot: 'torso', x: 26, y: 92, w: 108, h: 84,
      draw(g) {
        const c = 0x2b9aa0;
        g.fillStyle(c); g.fillRoundedRect(0, 6, 26, 32, 8); g.fillRoundedRect(82, 6, 26, 32, 8);
        g.fillRoundedRect(18, 2, 72, 80, 12);
        g.fillStyle(0x6cc6c9); g.fillRect(18, 38, 72, 8);
        g.fillStyle(COL.skin); g.beginPath(); g.slice(54, 1, 11, 0, Math.PI); g.closePath(); g.fillPath();
        g.fillStyle(COL.mustard); g.fillCircle(54, 62, 8);
      }
    },
    {
      key: 'ruana', name: 'Ruana', art: 'la ruana boyacense', slot: 'torso', x: 12, y: 86, w: 136, h: 100,
      draw(g) {
        g.fillStyle(0x8c2f2a);
        g.fillPoints([{ x: 46, y: 2 }, { x: 90, y: 2 }, { x: 136, y: 76 }, { x: 122, y: 92 }, { x: 14, y: 92 }, { x: 0, y: 76 }], true);
        g.fillStyle(0xefe3c2); g.fillRect(14, 58, 108, 6); g.fillRect(20, 70, 96, 3);
        g.fillStyle(0x5e1d1a); g.fillRect(64, 8, 8, 84);
        g.lineStyle(2, 0xefe3c2);
        for (let x = 18; x <= 118; x += 7) g.lineBetween(x, 92, x, 99);
        g.fillStyle(COL.skin); g.fillCircle(68, 4, 10);
      }
    },
    {
      key: 'jean', name: 'Jean', art: 'el jean', slot: 'piernas', x: 50, y: 164, w: 60, h: 78,
      draw(g) {
        g.fillStyle(0x2f4f8a); g.fillRect(0, 0, 60, 16);
        g.fillRoundedRect(0, 10, 28, 66, 6); g.fillRoundedRect(32, 10, 28, 66, 6);
        g.fillStyle(0x6b4a2b); g.fillRect(0, 3, 60, 5);
        g.lineStyle(1.5, 0x6d8fc9); g.lineBetween(14, 18, 14, 72); g.lineBetween(46, 18, 46, 72);
      }
    },
    {
      key: 'falda', name: 'Falda', art: 'la falda mostaza', slot: 'piernas', x: 38, y: 164, w: 84, h: 56,
      draw(g) {
        g.fillStyle(COL.mustard);
        g.fillPoints([{ x: 14, y: 0 }, { x: 70, y: 0 }, { x: 84, y: 54 }, { x: 0, y: 54 }], true);
        g.fillStyle(COL.plum); g.fillRect(14, 0, 56, 6);
        g.lineStyle(2, 0xc98a1e);
        [24, 42, 60].forEach(x => g.lineBetween(x, 8, x + (x - 42) * 0.4, 54));
      }
    },
    {
      key: 'tenis', name: 'Tenis', art: 'los tenis', slot: 'pies', x: 46, y: 234, w: 68, h: 24,
      draw(g) {
        [0, 36].forEach(x => {
          g.fillStyle(0xf7f7f2); g.fillRoundedRect(x, 4, 32, 16, 7);
          g.fillStyle(0x9a9a9a); g.fillRect(x + 1, 17, 30, 4);
          g.fillStyle(COL.cherry); g.fillRect(x + 8, 10, 16, 3);
        });
      }
    },
    {
      key: 'alpargatas', name: 'Alpargatas', art: 'las alpargatas', slot: 'pies', x: 46, y: 236, w: 68, h: 22,
      draw(g) {
        [16, 52].forEach(cx => {
          g.fillStyle(0xb8955a); g.fillEllipse(cx, 12, 34, 16);
          g.fillStyle(0xe9d8b0); g.fillEllipse(cx, 10, 30, 13);
          g.fillStyle(COL.ink); g.fillRect(cx - 10, 5, 20, 4);
        });
      }
    }
  ];

  // ---------- Conceptos sobre identidad personal ----------
  const CONCEPTS = [
    {
      title: '¿Qué es la identidad personal?',
      text: () => `<p>La identidad personal es el conjunto de rasgos, gustos, valores, recuerdos y experiencias que te hacen ser quien eres y te distinguen de las demás personas.</p>
        <p>Es la respuesta, siempre en construcción, a la pregunta <strong>«¿quién soy yo?»</strong>.</p>`,
      q: 'Si tuvieras que describirte en tres palabras, ¿cuáles elegirías?'
    },
    {
      title: 'Autoconcepto',
      text: () => `<p>El autoconcepto es la imagen que tienes de ti: cómo te describes, qué sabes hacer bien y qué te cuesta.</p>
        <p>Se forma con lo que vives y con lo que otras personas te dicen. Por eso vale la pena revisarlo: a veces nos describimos con ideas que no son justas.</p>`,
      q: '¿Qué habilidad tienes que a veces olvidas reconocer?'
    },
    {
      title: 'Autoestima',
      text: () => `<p>La autoestima es cómo te valoras y cuánto te aprecias.</p>
        <p>Una autoestima sana consiste en aceptarte con tus fortalezas y tus límites, y tratarte con el mismo respeto que le darías a un buen amigo.</p>`,
      q: '¿Cómo te hablas a ti mismo cuando algo te sale mal?'
    },
    {
      title: 'Pertenencia y cultura',
      text: () => `<p>Tu identidad también se nutre de los grupos a los que perteneces: tu familia, tu colegio, tu barrio, tu región y tu país.</p>
        <p>El idioma, la comida, la música, las fiestas y prendas como la ruana o el sombrero vueltiao son parte de una herencia cultural que compartes con otros.</p>`,
      q: '¿Qué tradición de tu familia o de tu región sientes como tuya?'
    },
    {
      title: 'Valores y creencias',
      text: () => `<p>Los valores son lo que consideras importante: la honestidad, el respeto, la solidaridad, la responsabilidad.</p>
        <p>Guían tus decisiones, sobre todo cuando nadie te está mirando.</p>`,
      q: '¿Qué valor mantendrías aunque tus amigos te presionaran para dejarlo?'
    },
    {
      title: 'Una identidad en construcción',
      text: () => `<p>La identidad no es fija: cambia a lo largo de la vida con nuevas experiencias, amistades y aprendizajes.</p>
        <p>El psicólogo Erik Erikson señaló la adolescencia como una etapa clave, en la que exploramos quiénes somos y quiénes queremos ser.</p>`,
      q: '¿En qué has cambiado respecto a hace dos años?'
    },
    {
      title: 'Expresarte a tu manera',
      text: (name, outfit) => `<p>Cuando vestiste a ${esc(name)} elegiste ${listJoin(outfit.map(i => i.art))}. La ropa, la forma de hablar, la música que escuchas o lo que dibujas son maneras de expresar quién eres.</p>
        <p>Lo que llevas puesto dice algo de ti, pero no lo dice todo: tu identidad va mucho más allá de lo que se ve.</p>`,
      q: '¿Qué cosa de ti no se nota a simple vista, pero es muy importante?'
    },
    {
      title: 'Derecho a ser y respeto por los demás',
      text: () => `<p>Toda persona tiene derecho a una identidad: un nombre, una nacionalidad y relaciones familiares, como reconoce la Convención sobre los Derechos del Niño. En Colombia, la Constitución protege el libre desarrollo de la personalidad, con el límite de los derechos de los demás.</p>
        <p>Reconocer tu identidad va de la mano de respetar la de otras personas, aunque sean muy diferentes a ti.</p>`,
      q: '¿Cómo puedes mostrar respeto por alguien cuya identidad es distinta a la tuya?'
    }
  ];

  // ---------- Utilidades ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function listJoin(arr) {
    return arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  }
  const CHERRY_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c-1 4-4 7-6 10M12 2c1 4 3 8 6 11" stroke="#3f7a2a" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="6" cy="16" r="5" fill="#d7263d"/><circle cx="18" cy="17" r="5" fill="#d7263d"/></svg>';

  // Ventana modal HTML (sobre el canvas)
  const overlay = document.getElementById('overlay');
  function showCard(opts, done) {
    overlay.innerHTML = `
      <div class="card" role="dialog" aria-modal="true" aria-labelledby="card-title">
        ${opts.eyebrow ? `<p class="eyebrow">${CHERRY_SVG}<span>${opts.eyebrow}</span></p>` : ''}
        <h2 id="card-title">${opts.title}</h2>
        ${opts.body || ''}
        ${opts.question ? `<div class="think"><span>Para pensar</span><p>${opts.question}</p></div>` : ''}
        ${opts.input ? `<label for="nombre">Nombre</label><input id="nombre" type="text" maxlength="18" autocomplete="off" placeholder="Por ejemplo: Sara, Juan, Mati…">` : ''}
        <button id="card-btn" type="button">${opts.button}</button>
      </div>`;
    overlay.hidden = false;
    const btn = overlay.querySelector('#card-btn');
    const inp = overlay.querySelector('#nombre');
    let closed = false;
    const onKey = e => { if (e.key === 'Enter') { e.preventDefault(); close(); } };
    function close() {
      if (closed) return; closed = true;
      const v = inp ? inp.value.trim() : null;
      document.removeEventListener('keydown', onKey);
      overlay.hidden = true; overlay.innerHTML = '';
      done && done(v);
    }
    btn.addEventListener('click', close);
    setTimeout(() => document.addEventListener('keydown', onKey), 200);
    setTimeout(() => (inp || btn).focus({ preventScroll: true }), 50);
  }

  function quadPoints(p0, p1, p2, n = 12) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
      pts.push({ x: a * p0.x + b * p1.x + c * p2.x, y: a * p0.y + b * p1.y + c * p2.y });
    }
    return pts;
  }

  // ---------- Texturas generadas ----------
  function makeTextures(scene) {
    const gen = (key, w, h, fn) => {
      if (scene.textures.exists(key)) return;
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      fn(g); g.generateTexture(key, w, h); g.destroy();
    };
    gen('body', 160, 260, g => {
      const base = 0xd9d1c3;
      g.fillStyle(base); g.fillRoundedRect(52, 168, 24, 74, 8); g.fillRoundedRect(84, 168, 24, 74, 8);
      g.fillStyle(COL.skin); g.fillEllipse(64, 246, 30, 14); g.fillEllipse(96, 246, 30, 14);
      g.fillRoundedRect(28, 100, 16, 66, 8); g.fillRoundedRect(116, 100, 16, 66, 8);
      g.fillStyle(base); g.fillRoundedRect(44, 94, 72, 80, 14);
      g.fillStyle(COL.skin); g.fillRect(72, 80, 16, 18);
      g.fillCircle(44, 54, 7); g.fillCircle(116, 54, 7);
      g.fillCircle(80, 50, 36);
      g.fillStyle(0x3b2416); g.beginPath(); g.slice(80, 40, 37, Math.PI, Math.PI * 2); g.closePath(); g.fillPath();
      g.fillRect(43, 38, 8, 14); g.fillRect(109, 38, 8, 14);
      g.fillStyle(COL.ink); g.fillCircle(67, 52, 4.5); g.fillCircle(93, 52, 4.5);
      g.fillStyle(0xe88a7a, 0.6); g.fillCircle(59, 63, 6); g.fillCircle(101, 63, 6);
      g.lineStyle(3, COL.ink); g.beginPath(); g.arc(80, 60, 10, 0.2 * Math.PI, 0.8 * Math.PI); g.strokePath();
    });
    ITEMS.forEach(it => gen(it.key, it.w, it.h, g => it.draw(g)));
    gen('cherry', 48, 48, g => {
      g.lineStyle(3, 0x4a7a2a);
      g.strokePoints(quadPoints({ x: 26, y: 4 }, { x: 18, y: 14 }, { x: 14, y: 26 }));
      g.strokePoints(quadPoints({ x: 26, y: 4 }, { x: 32, y: 16 }, { x: 34, y: 28 }));
      g.fillStyle(COL.leaf || 0x3f8f4a); g.fillEllipse(33, 7, 16, 8);
      g.fillStyle(COL.cherry); g.fillCircle(14, 34, 11); g.fillCircle(34, 35, 11);
      g.fillStyle(0xffffff, 0.55); g.fillCircle(10, 30, 3.5); g.fillCircle(30, 31, 3.5);
    });
    gen('spark', 12, 12, g => { g.fillStyle(0xffffff); g.fillCircle(6, 6, 6); });
  }

  // Une cuerpo + prendas en una sola textura para el juego
  function buildHero(scene, outfit) {
    if (scene.textures.exists('hero')) scene.textures.remove('hero');
    const dt = scene.textures.addDynamicTexture('hero', 160, 260);
    dt.draw('body', 0, 0);
    outfit.slice().sort((a, b) => ORDER[a.slot] - ORDER[b.slot]).forEach(it => dt.draw(it.key, it.x, it.y));
  }

  function makeButton(scene, x, y, w, h, label, onClick) {
    const g = scene.add.graphics();
    const t = scene.add.text(x, y, label, { fontFamily: FD, fontStyle: 'bold', fontSize: '21px', color: '#fff4e0' }).setOrigin(0.5);
    const z = scene.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    const btn = {
      enabled: true, hover: false,
      draw() {
        g.clear();
        const c = this.enabled ? (this.hover ? COL.cherryD : COL.cherry) : COL.plumL;
        if (this.enabled) g.fillStyle(0x000000, 0.3).fillRoundedRect(x - w / 2 + 3, y - h / 2 + 5, w, h, h / 2);
        g.fillStyle(c).fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
        t.setColor(this.enabled ? '#fff4e0' : '#bfaec4');
      },
      setEnabled(v, lbl) { this.enabled = v; if (lbl) t.setText(lbl); z.input.cursor = v ? 'pointer' : 'default'; this.draw(); }
    };
    z.on('pointerover', () => { btn.hover = true; btn.draw(); });
    z.on('pointerout', () => { btn.hover = false; btn.draw(); });
    z.on('pointerup', () => { if (btn.enabled) onClick(); });
    btn.draw();
    return btn;
  }

  // ================= ESCENAS =================

  class Boot extends Phaser.Scene {
    constructor() { super('Boot'); }
    preload() {
      this.load.on('loaderror', () => {}); // si no existe loading.png, se usa una pantalla dibujada
      this.load.image('loading', 'loading.png');
    }
    create() { this.scene.start('Loading'); }
  }

  class Loading extends Phaser.Scene {
    constructor() { super('Loading'); }
    create() {
      if (this.textures.exists('loading')) {
        const img = this.add.image(W / 2, H / 2, 'loading');
        img.setScale(Math.max(W / img.width, H / img.height));
      } else {
        this.add.rectangle(W / 2, H / 2, W, H, COL.cream);
        this.add.text(W / 2, H / 2 - 40, 'Cerezas de Identidad', { fontFamily: FD, fontStyle: 'bold', fontSize: '56px', color: HEX(COL.plum) }).setOrigin(0.5);
      }
      const bw = 520, bh = 20, by = H - 64;
      const track = this.add.graphics();
      track.fillStyle(COL.plum).fillRoundedRect(W / 2 - bw / 2 - 6, by - 6, bw + 12, bh + 12, (bh + 12) / 2);
      const bar = this.add.rectangle(W / 2 - bw / 2, by, bw, bh, COL.cherry).setOrigin(0, 0).setScale(0, 1);
      const label = this.add.text(W / 2, by - 26, 'Cargando 0%', {
        fontFamily: FD, fontStyle: 'bold', fontSize: '22px', color: HEX(COL.plum), stroke: '#fff4e0', strokeThickness: 6
      }).setOrigin(0.5);

      makeTextures(this);

      const p = { v: 0 };
      this.tweens.add({
        targets: p, v: 1, duration: 2600, ease: 'Sine.easeInOut',
        onUpdate: () => { bar.scaleX = p.v; label.setText(`Cargando ${Math.round(p.v * 100)}%`); },
        onComplete: () => {
          label.setText('¡Listo!');
          this.time.delayedCall(350, () => {
            this.cameras.main.fadeOut(400, 42, 27, 46);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Dress'));
          });
        }
      });
    }
  }

  class Dress extends Phaser.Scene {
    constructor() { super('Dress'); }
    create() {
      this.cameras.main.fadeIn(300, 42, 27, 46);
      this.equipped = {};
      this.starting = false;

      // Fondo
      this.add.rectangle(W / 2, H / 2, W, H, COL.cream);
      const deco = this.add.graphics();
      deco.fillStyle(COL.mustard, 0.22).fillCircle(70, 560, 150);
      deco.fillStyle(COL.cherry, 0.07).fillCircle(440, 210, 80);

      this.add.text(36, 24, 'Viste a tu personaje', { fontFamily: FD, fontStyle: 'bold', fontSize: '34px', color: HEX(COL.plum) });
      this.add.text(36, 68, 'Arrastra una prenda para cada parte del cuerpo. Toca una prenda puesta para quitarla.', {
        fontFamily: FB, fontSize: '15px', color: '#5a4560', wordWrap: { width: 430 }, lineSpacing: 2
      });

      // Personaje
      this.add.ellipse(250, 552, 250, 34, COL.plum, 0.12);
      this.charC = this.add.container(250, 360).setScale(1.45);
      const body = this.add.image(-80, -130, 'body').setOrigin(0);
      body.zOrder = 0;
      this.charC.add(body);
      this.tweens.add({ targets: this.charC, y: 354, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

      this.zone = new Phaser.Geom.Rectangle(250 - 130, 160, 260, 400);
      this.zoneG = this.add.graphics().setVisible(false);
      this.zoneG.lineStyle(3, COL.cherry, 1).strokeRoundedRect(this.zone.x, this.zone.y, this.zone.width, this.zone.height, 24);
      this.zoneG.fillStyle(COL.cherry, 0.06).fillRoundedRect(this.zone.x, this.zone.y, this.zone.width, this.zone.height, 24);

      // Indicadores de partes
      this.chipG = this.add.graphics();
      this.chipT = SLOTS.map((s, i) => this.add.text(36 + i * 104 + 48, 133, s.label, {
        fontFamily: FB, fontStyle: 'bold', fontSize: '14px', color: HEX(COL.plum)
      }).setOrigin(0.5));

      // Ropero
      const panel = this.add.graphics();
      panel.fillStyle(COL.plum).fillRoundedRect(500, 20, 440, 560, 24);
      this.add.text(524, 34, 'Ropero', { fontFamily: FD, fontStyle: 'bold', fontSize: '24px', color: '#fff4e0' });

      SLOTS.forEach((s, row) => {
        const cy = 128 + row * 104;
        this.add.text(524, cy, s.label.toUpperCase(), { fontFamily: FB, fontStyle: 'bold', fontSize: '13px', color: HEX(COL.mustard) })
          .setOrigin(0, 0.5).setLetterSpacing(1.5);
        ITEMS.filter(it => it.slot === s.id).forEach((it, col) => {
          const cx = 688 + col * 166;
          panel.fillStyle(0xffffff, 0.07).fillRoundedRect(cx - 76, cy - 44, 152, 88, 16);
          this.add.text(cx, cy + 30, it.name, { fontFamily: FB, fontSize: '13px', color: '#e9d6e2' }).setOrigin(0.5);
          const s0 = Math.min(118 / it.w, 50 / it.h, 1.3);
          const icon = this.add.image(cx, cy - 8, it.key).setScale(s0).setInteractive({ useHandCursor: true, draggable: true });
          icon.setData({ item: it, hx: cx, hy: cy - 8, hs: s0 });
          it.icon = icon;
        });
      });

      this.btn = makeButton(this, 720, 548, 360, 46, '', () => this.startGame());

      // Arrastre
      this.input.on('dragstart', (p, obj) => {
        obj.setDepth(50);
        this.tweens.add({ targets: obj, scale: 1.45, duration: 120 });
      });
      this.input.on('drag', (p, obj, dx, dy) => {
        obj.x = dx; obj.y = dy;
        this.zoneG.setVisible(Phaser.Geom.Rectangle.Contains(this.zone, p.x, p.y));
      });
      this.input.on('dragend', (p, obj) => {
        this.zoneG.setVisible(false);
        if (Phaser.Geom.Rectangle.Contains(this.zone, p.x, p.y)) {
          this.equip(obj.getData('item'));
        } else {
          this.tweens.add({ targets: obj, x: obj.getData('hx'), y: obj.getData('hy'), scale: obj.getData('hs'), duration: 220, ease: 'Back.easeOut',
            onComplete: () => obj.setDepth(0) });
        }
      });

      this.refreshUI();
    }

    equip(item) {
      if (this.equipped[item.slot]) this.unequip(item.slot, true);
      const icon = item.icon;
      this.tweens.killTweensOf(icon);
      icon.setVisible(false).setDepth(0).setPosition(icon.getData('hx'), icon.getData('hy')).setScale(icon.getData('hs'));

      const img = this.add.image(-80 + item.x, -130 + item.y, item.key).setOrigin(0).setInteractive({ useHandCursor: true });
      img.zOrder = ORDER[item.slot];
      img.on('pointerdown', () => this.unequip(item.slot));
      this.charC.add(img);
      this.charC.sort('zOrder');
      this.equipped[item.slot] = { item, img };
      img.setAlpha(0);
      this.tweens.add({ targets: img, alpha: 1, duration: 180 });
      this.tweens.add({ targets: this.charC, scaleX: 1.52, scaleY: 1.4, duration: 90, yoyo: true });
      this.refreshUI();
    }

    unequip(slot, silent) {
      const e = this.equipped[slot];
      if (!e) return;
      e.img.destroy();
      delete this.equipped[slot];
      const icon = e.item.icon;
      icon.setVisible(true).setScale(0);
      this.tweens.add({ targets: icon, scale: icon.getData('hs'), duration: 220, ease: 'Back.easeOut' });
      if (!silent) this.refreshUI();
    }

    refreshUI() {
      const g = this.chipG; g.clear();
      let n = 0;
      SLOTS.forEach((s, i) => {
        const x = 36 + i * 104, done = !!this.equipped[s.id];
        if (done) { n++; g.fillStyle(COL.mustard).fillRoundedRect(x, 118, 96, 30, 15); }
        else { g.lineStyle(2, COL.plum, 0.35).strokeRoundedRect(x + 1, 119, 94, 28, 14); }
        this.chipT[i].setText((done ? '✓ ' : '') + s.label).setAlpha(done ? 1 : 0.6);
      });
      const left = SLOTS.length - n;
      if (left === 0) this.btn.setEnabled(true, '¡Listo, a jugar!');
      else this.btn.setEnabled(false, left === 1 ? 'Falta 1 prenda' : `Faltan ${left} prendas`);
    }

    startGame() {
      if (this.starting || SLOTS.some(s => !this.equipped[s.id])) return;
      this.starting = true;
      showCard({
        title: '¿Cómo se llama tu personaje?',
        body: '<p>Un nombre es lo primero que nos identifica. Ponle uno a tu personaje antes de salir a recoger cerezas.</p>',
        input: true,
        button: 'Empezar a recoger cerezas'
      }, name => {
        const outfit = SLOTS.map(s => this.equipped[s.id].item);
        buildHero(this, outfit);
        this.cameras.main.fadeOut(300, 42, 27, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game', { name: name || 'Tu personaje', outfit }));
      });
    }
  }

  class Game extends Phaser.Scene {
    constructor() { super('Game'); }
    init(d) {
      this.heroName = d.name; this.outfit = d.outfit;
      this.collected = 0; this.spawned = 0; this.busy = false;
    }
    create() {
      this.cameras.main.fadeIn(300, 42, 27, 46);
      this.events.once('shutdown', () => this.input.keyboard.clearCaptures());
      this.drawMeadow();

      this.physics.world.setBounds(20, 66, W - 40, H - 80);
      this.shadow = this.add.ellipse(W / 2, H / 2, 60, 14, 0x000000, 0.18).setDepth(3);
      this.player = this.physics.add.image(W / 2, H / 2 + 30, 'hero').setScale(0.42).setCollideWorldBounds(true).setDepth(5);
      this.player.body.setSize(110, 220).setOffset(25, 30);

      this.cherries = this.physics.add.group();
      this.physics.add.overlap(this.player, this.cherries, (pl, c) => this.collect(c));

      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys('W,A,S,D');

      this.drawHud();
      this.hint = this.add.text(W / 2, H - 26, 'Muévete con las flechas o WASD, o mantén presionado donde quieras ir', {
        fontFamily: FB, fontStyle: 'bold', fontSize: '15px', color: '#fff4e0', backgroundColor: 'rgba(42,27,46,0.75)', padding: { x: 14, y: 7 }
      }).setOrigin(0.5).setDepth(20);

      this.refill();
    }

    drawMeadow() {
      const rnd = new Phaser.Math.RandomDataGenerator(['identidad']);
      const g = this.add.graphics().setDepth(0);
      g.fillStyle(0x8cc66f).fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) g.fillStyle(0x9fd27f, 0.6).fillEllipse(rnd.between(0, W), rnd.between(60, H), rnd.between(90, 200), rnd.between(30, 70));
      for (let i = 0; i < 70; i++) {
        const x = rnd.between(10, W - 10), y = rnd.between(70, H - 10);
        g.lineStyle(2, 0x6aa84f).lineBetween(x, y, x - 3, y - 8).lineBetween(x, y, x + 3, y - 9);
      }
      const petals = [0xffffff, 0xf2b134, 0xf4a6b8];
      for (let i = 0; i < 40; i++) {
        const x = rnd.between(15, W - 15), y = rnd.between(75, H - 15), c = rnd.pick(petals);
        g.fillStyle(c).fillCircle(x - 3, y, 3).fillCircle(x + 3, y, 3).fillCircle(x, y - 3, 3).fillCircle(x, y + 3, 3);
        g.fillStyle(0xf2b134).fillCircle(x, y, 2);
      }
      // árboles de cerezo en los bordes
      [[40, 140], [925, 190], [60, 520], [905, 520]].forEach(([x, y]) => {
        g.fillStyle(0x000000, 0.12).fillEllipse(x + 6, y + 46, 80, 18);
        g.fillStyle(0x7a4a2b).fillRect(x - 7, y + 4, 14, 42);
        g.fillStyle(0x3f8f4a).fillCircle(x, y - 10, 38).fillCircle(x - 24, y + 6, 24).fillCircle(x + 24, y + 6, 24);
        g.fillStyle(COL.cherry); for (let k = 0; k < 6; k++) g.fillCircle(x + rnd.between(-30, 30), y + rnd.between(-30, 14), 4);
      });
    }

    drawHud() {
      const g = this.add.graphics().setDepth(19);
      g.fillStyle(COL.plum).fillRect(0, 0, W, 56);
      this.add.text(22, 28, this.heroName, { fontFamily: FD, fontStyle: 'bold', fontSize: '24px', color: '#fff4e0' }).setOrigin(0, 0.5).setDepth(20);
      this.countT = this.add.text(W - 22, 28, `0/${TOTAL}`, { fontFamily: FD, fontStyle: 'bold', fontSize: '22px', color: HEX(COL.mustard) })
        .setOrigin(1, 0.5).setDepth(20);
      this.icons = [];
      for (let i = 0; i < TOTAL; i++) {
        this.icons.push(this.add.image(W - 90 - (TOTAL - 1 - i) * 32, 28, 'cherry').setScale(0.6).setAlpha(0.25).setDepth(20));
      }
    }

    refill() {
      const active = this.cherries.countActive(true);
      for (let k = active; k < MAX_ON_FIELD && this.spawned < TOTAL; k++) { this.spawnCherry(); this.spawned++; }
    }

    spawnCherry() {
      let x, y, ok = false;
      for (let t = 0; t < 40 && !ok; t++) {
        x = Phaser.Math.Between(110, W - 110); y = Phaser.Math.Between(110, H - 70);
        ok = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) > 170 &&
          this.cherries.getMatching('active', true).every(c => Phaser.Math.Distance.Between(x, y, c.x, c.y) > 110);
      }
      const c = this.cherries.create(x, y, 'cherry').setDepth(4).setScale(0);
      c.body.setCircle(18, 6, 10);
      this.tweens.add({ targets: c, scale: 1.05, duration: 300, ease: 'Back.easeOut',
        onComplete: () => this.tweens.add({ targets: c, scale: 1.18, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }) });
    }

    collect(c) {
      if (this.busy) return;
      this.busy = true;
      this.tweens.killTweensOf(c);
      c.disableBody(true, true);
      this.burst(c.x, c.y);
      this.collected++;
      const idx = this.collected - 1;
      this.icons[idx].setAlpha(1);
      this.tweens.add({ targets: this.icons[idx], scale: 0.85, duration: 140, yoyo: true });
      this.countT.setText(`${this.collected}/${TOTAL}`);
      if (this.hint) { this.tweens.add({ targets: this.hint, alpha: 0, duration: 400 }); this.hint = null; }

      this.player.setVelocity(0, 0);
      this.physics.pause();
      const concept = CONCEPTS[idx % CONCEPTS.length];
      this.time.delayedCall(280, () => {
        showCard({
          eyebrow: `Cereza ${this.collected} de ${TOTAL}`,
          title: concept.title,
          body: concept.text(this.heroName, this.outfit),
          question: concept.q,
          button: this.collected === TOTAL ? 'Ver mi recorrido' : 'Seguir recogiendo'
        }, () => {
          this.physics.resume();
          this.busy = false;
          if (this.collected >= TOTAL) this.finish(); else this.refill();
        });
      });
    }

    burst(x, y) {
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10;
        const s = this.add.image(x, y, 'spark').setTint(i % 2 ? COL.cherry : COL.mustard).setDepth(6).setScale(0.8);
        this.tweens.add({ targets: s, x: x + Math.cos(a) * 46, y: y + Math.sin(a) * 46, alpha: 0, scale: 0.2, duration: 420, onComplete: () => s.destroy() });
      }
      const t = this.add.text(x, y - 20, '+1', { fontFamily: FD, fontStyle: 'bold', fontSize: '26px', color: '#fff4e0', stroke: '#2a1b2e', strokeThickness: 5 })
        .setOrigin(0.5).setDepth(7);
      this.tweens.add({ targets: t, y: y - 60, alpha: 0, duration: 700, onComplete: () => t.destroy() });
    }

    finish() {
      this.busy = true;
      this.tweens.add({ targets: this.player, y: this.player.y - 24, duration: 260, yoyo: true, repeat: 2, ease: 'Sine.easeOut' });
      this.time.delayedCall(900, () => {
        showCard({
          eyebrow: `${TOTAL} de ${TOTAL} cerezas`,
          title: `¡${esc(this.heroName)} recogió todas las cerezas!`,
          body: `<p>En el camino descubriste estas ideas sobre la identidad personal:</p>
            <ol class="recap">${CONCEPTS.map(c => `<li>${c.title}</li>`).join('')}</ol>
            <p>Tu identidad es única y la sigues construyendo cada día.</p>`,
          button: 'Vestir de nuevo y jugar'
        }, () => this.scene.start('Dress'));
      });
    }

    update(time) {
      if (this.busy) { this.player.setVelocity(0, 0); return; }
      const k = this.cursors, w = this.wasd;
      let vx = 0, vy = 0;
      if (k.left.isDown || w.A.isDown) vx -= 1;
      if (k.right.isDown || w.D.isDown) vx += 1;
      if (k.up.isDown || w.W.isDown) vy -= 1;
      if (k.down.isDown || w.S.isDown) vy += 1;
      const p = this.input.activePointer;
      if (vx === 0 && vy === 0 && p.isDown) {
        const dx = p.worldX - this.player.x, dy = p.worldY - this.player.y, d = Math.hypot(dx, dy);
        if (d > 12) { vx = dx / d; vy = dy / d; }
      } else if (vx && vy) { vx *= Math.SQRT1_2; vy *= Math.SQRT1_2; }
      const speed = 240;
      this.player.setVelocity(vx * speed, vy * speed);
      if (vx < -0.1) this.player.setFlipX(true); else if (vx > 0.1) this.player.setFlipX(false);
      const moving = vx !== 0 || vy !== 0;
      this.player.angle = moving ? Math.sin(time / 85) * 6 : this.player.angle * 0.8;
      this.shadow.setPosition(this.player.x, this.player.y + 52);
    }
  }

  // ---------- Arranque (espera las fuentes para que el texto del canvas se vea bien) ----------
  const fontsReady = document.fonts
    ? Promise.race([
        Promise.all([document.fonts.load('700 24px Grandstander'), document.fonts.load('400 16px Nunito'), document.fonts.load('700 16px Nunito')]),
        new Promise(r => setTimeout(r, 2500))
      ]).catch(() => {})
    : Promise.resolve();

  fontsReady.then(() => {
    new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      backgroundColor: '#2a1b2e',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
      physics: { default: 'arcade', arcade: { debug: false } },
      scene: [Boot, Loading, Dress, Game]
    });
  });
})();
