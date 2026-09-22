# Running Ease Disease locally

A guide for getting this Angular project running on your own machine, so you can preview changes without waiting on a deployed build. Written for someone comfortable with basic terminal use who already has Node/npm and the Angular CLI installed — no deep Angular knowledge required.

You already have:
- npm 11
- `@angular/cli` installed globally

That's everything you need besides the code itself.

## 1. Clone the repo

Open a terminal and run:

```bash
git clone <repo-url>
cd ease-disease-angular
```

Replace `<repo-url>` with the GitHub URL for this project (copy it from the green "Code" button on the repo page — pick HTTPS unless you already use SSH with GitHub).

## 2. Install dependencies

From inside the project folder:

```bash
npm install
```

This reads `package.json` and downloads everything the project needs into a `node_modules` folder. Only needs to be run once (and again later if `package.json` changes).

## 3. Start the development server

```bash
npm start
```

This runs `ng serve` under the hood. Once it finishes compiling, you'll see something like:

```
Local:   http://localhost:4200/
```

Open that URL in your browser. The app is now running locally.

## 4. Making the most of it

- The dev server watches your files — if you (or Claude Code) edit something, the browser refreshes automatically. No need to restart it after every change.
- To stop the server, go back to the terminal and press `Ctrl+C`.
- If port 4200 is already in use (e.g. another project running), start with a different port:
  ```bash
  ng serve --port 4300
  ```

## 5. If something goes wrong

- **"ng: command not found"** — the global Angular CLI install didn't complete or isn't on your PATH. Re-run `npm install -g @angular/cli` and open a new terminal.
- **Install errors on `npm install`** — delete `node_modules` and the `package-lock.json` file, then run `npm install` again.
- **Blank page or console errors in the browser** — check the terminal running `npm start` for a red `[ERROR]` line; that's almost always the real cause.

## 6. Using this with Claude Code

Once you have Claude Code installed and this folder open as your working directory, you can just ask it in plain language to start the dev server, make a change, or check for errors — it can run these same commands for you. This file is here so you (or Claude Code) always have the exact steps on hand, without needing to ask anyone else how the project is set up.
