# Go Fish

A calm lakeside Go Fish card game by Ironite. You play against Grandpa Walt,
Captain Rosie and Little Finn at dawn on Loon Lake. It has original card art,
music and sounds. Go Fish ships on its own and inside the Ironite Launcher.

## How to play

- Everyone gets 5 cards and the rest go in the pond.
- Click a card to pick its rank, then click the player you want to ask. You can only ask for a rank you already hold.
- If they have any, they hand them all over and you go again. If they don't, it's "Go fish!" and you draw from the pond. If you draw the rank you asked for, you go again.
- Four of a rank makes a set, which is laid on the dock automatically. When the pond runs out, the player with the most sets wins.
- F2 starts a new game, M toggles music, F11 toggles full screen.

Saves and settings are kept in `%APPDATA%\Ironite\GoFish`, outside the
install folder, so updating or reinstalling never wipes them.

## Layout

| Path | What it is |
|---|---|
| `web/` | The game itself (HTML/CSS/JS, fonts, art). `CHANGELOG.md` here sets the version. |
| `shell/` | Small Go program that serves `web/` locally and opens it in an Edge app window. |
| `tools/mkres/` | Writes the Windows icon and version info into the .exe. |
| `tools/mkinstallerart.py` | Regenerates `installer/assets/` from `installer/art-src/` and `icon-1024.png` (needs Pillow). |
| `installer/` | Inno Setup scripts for the standalone `GoFish-Setup-v<version>.exe`. |
| `README.txt`, `CREDITS.txt` | Text files shipped next to the .exe. |

`web/core.js` and `web/base.css` are shared with the other Ironite card
games. Keep them in sync with the copies in the launcher source.

## Building

You need Go 1.24 or newer and bash (Git Bash works on Windows).

```bash
./build.sh
```

This writes `dist/GoFish/GoFish.exe` along with its README, CREDITS,
CHANGELOG and license files. The first build downloads the icon tool's Go
dependencies.

To build the installer, install Inno Setup 6.3 or newer, run `./build.sh`, then:

```
ISCC.exe installer\GoFishSetup.iss
```

The setup is written to `Output\GoFish-Setup-v1.0.0.exe`. It installs into
the Ironite folder, next to Ironite Launcher if that's installed.

(c) 2026 Ironite
