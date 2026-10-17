# METRO DASH 3D — Premium Endless Runner Game

A high-performance, immersive 3D railway endless runner built with **React**, **Three.js**, **Zustand**, and the **Web Audio API**. Inspired by classic arcade runners like *Subway Surfers* and *Temple Run*, Metro Dash 3D features original stylized 3D cartoon athletes, procedural subway trains, ramps, hurdles, interactive power-ups, and an articulated chasing inspector.

---

## 🎮 Gameplay & Controls

### Desktop Keyboard Controls
- **Change Lanes**: `A` / `D` or `Left Arrow` / `Right Arrow`
- **Jump / Leap**: `W` / `Space` / `Up Arrow`
- **Slide Under Barriers**: `S` / `Down Arrow`
- **Fast Air-Dive**: Press `S` or `Down Arrow` while in the air to dive down immediately
- **Pause Game**: `Escape` or `P`

### Mobile Touch Controls
- **Swipe Left / Right**: Change lanes
- **Swipe Up**: Jump over hurdles and onto train ramps
- **Swipe Down**: Slide under overhead signs and barriers
- **On-Screen Touch Buttons**: Left, Right, Jump, and Slide buttons for easy thumb gaming

---

## ✨ Features

1. **Stylized 3D Cartoon Characters**
   - **Jax**: Agile street skater in a teal hoodie with high-top kicks (+10% Coin Magnet radius).
   - **Luna**: Cyberpunk runner equipped with neon twin-buns and holographic visor (+15% Super Sneakers jump height).
   - **Rex**: Urban parkour acrobat in racing yellow and tinted shades (+20% Jetpack duration).
   - **Blitz-9**: Autonomous security android with titanium chassis (Starts every run with an Energy Shield).
   - Dynamic articulated limb kinematics: natural arm swing, running strides, knee bends, jump tucks, low slide postures, and collision stumble reactions.

2. **Original Chaser Inspector & Drone Companion**
   - **Inspector Grump**: Comic authority figure with security peaked cap, uniform, mustache, and police whistle.
   - **Robotic K9 Drone**: Levitating companion pod pacing alongside the inspector with scanning lights.
   - Cinematic chase launch sequence during the 3-2-1 countdown.

3. **High-Fidelity 3D Railway World**
   - 3-Lane railway tracks with steel rails, wooden sleepers, ballast gravel, and side curbs.
   - **Passenger Trains**: Aerodynamic nose cabs, glowing headlights, passenger windows, and rooftop air-conditioning units.
   - **Train Ramps**: Leap onto loading ramps to run on top of train roofs!
   - **Freight Trains**: Flatbed cars loaded with heavy cargo containers.
   - **Low Hurdles & High Barriers**: Barricades requiring timely jumps and slide maneuvers.
   - **Three Dynamic Atmospheres**: Metro Downtown (Day), Neon Night Subway, and Sunset Industrial Yard.

4. **Dynamic Power-Ups & Upgrades**
   - **Coin Magnet**: Automatically draws all coins on adjacent lanes towards the runner.
   - **Rocket Jetpack**: Elevates runner high above tracks into a sky of golden coins with rocket flame particles.
   - **Super Sneakers**: High-spring bounce leaps over entire trains.
   - **2x Multiplier**: Doubles score and coin pickups.
   - **Energy Shield**: Absorbs a collision impact with protective energy bubble.
   - **Hyper Dash / Speed Boost**: Invincible high-speed burst with camera FOV widening and dynamic speed lines.

5. **Audio & Sound Synthesizer**
   - 100% procedural Web Audio engine: zero 404 external audio failures!
   - Dynamic synthwave rhythm bassline, footstep taps, jump whooshes, slide sweeps, ascending pentatonic coin chimes, train horns, and inspector whistles.

6. **Progression, Missions & Achievements**
   - Daily and career missions with coin rewards.
   - Career trophies & badges (First Step on Rails, Subway Tycoon, Speed Demon, Sky Surfer, Untouchable).
   - Upgrades shop to permanently extend power-up durations using banked coins.
   - LocalStorage save system preserving progress across sessions.

7. **Mobile Haptic Vibration Feedback**
   - Utilizes the **Navigator Vibration API** to provide tactile physical pulses on supported mobile devices:
     - **Fatal Collisions**: Dramatic impact pulse sequence `[120, 50, 220]`.
     - **Shield Absorptions**: Crisp double impact `[70, 40, 90]`.
     - **Power-Up Activations**: Uplifting dual pulse `[40, 30, 65]`.
     - **Near-Miss Sweeps**: Sharp adrenaline tick `[35]`.
   - Fully toggleable in Settings with persistent LocalStorage state.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **3D Graphics Engine**: Three.js (r160+ with PBR shaders, RoomEnvironment reflection, PCF soft shadows)
- **State Management**: Zustand with persistent LocalStorage
- **Audio Management**: Procedural Web Audio API synthesizer
- **Styling**: Tailwind CSS
- **Particle Effects**: High-performance buffer geometry particle engine
- **Confetti Celebration**: Canvas Confetti

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`.

---

## 🌐 Deploying to Netlify

To deploy Metro Dash 3D to Netlify:

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The compiled assets will be in the `dist` directory.
3. In Netlify:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. The game will run with zero external backend dependencies.
