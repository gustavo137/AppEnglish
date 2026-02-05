# 🧩 AppEnglish – Basic Development Workflow (Vite + nvm)

This is a **minimal, practical cheat‑sheet** for working with the AppEnglish PWA project on macOS.

---

## 1️⃣ Open the project

```bash
cd ~/Documents/MHPC/AppEnglish
```

---

## 2️⃣ Activate the Node environment (ALWAYS)

```bash
nvm use
```

* Uses the correct Node.js version for the project
* Equivalent to `conda activate` (but for Node)

---

## 3️⃣ Install dependencies (only once)

```bash
npm install
```

Run this **only if** `node_modules/` does not exist.

---

## 4️⃣ Start the app (development mode)

```bash
npm run dev
```

* Starts the Vite development server
* You will see a local URL such as:

  ```
  http://localhost:5173
  ```
* Open it in your browser

✅ **Hot reload enabled**: save code → browser updates automatically

---

## 5️⃣ Modify the code

Edit files in:

```text
src/
public/
```

* Just save the file
* No rebuild needed
* No restart needed

---

## 6️⃣ Stop / close Vite

In the terminal where `npm run dev` is running:

```text
Ctrl + C
```

This:

* Stops the dev server
* Frees the port

---

## 7️⃣ Resume work another day

```bash
cd ~/Documents/MHPC/AppEnglish
nvm use
npm run dev
```

---

## 8️⃣ Build the production version

Only when you want a **final / PWA‑ready build**:

```bash
npm run build
```

This generates:

```text
dist/
```

---

## 9️⃣ Preview the production build locally

```bash
npm run preview
```

Serves the `dist/` folder as a production‑like app.

---

## 🧠 Quick command summary

| Action        | Command           |
| ------------- | ----------------- |
| Enter project | `cd AppEnglish`   |
| Activate env  | `nvm use`         |
| Install deps  | `npm install` (only once)     |
| Run cleaning data | `npm run data` |
| Run app       | `npm run dev`     |
| Stop app      | `Ctrl + C`        |
| Build         | `npm run build`   |
| Preview       | `npm run preview` |

---

## ❗ Important rules

* ❌ Do NOT use conda for Node/npm
* ❌ Do NOT run `npm audit fix --force`
* ✅ Always run `nvm use` before working
* ✅ Use `npm run dev` for development
* ✅ Let hot reload handle recompilation

---

**Next logical steps**

* Connect `verbs.json` to the quiz logic
* Add randomization and scoring
* Enable real offline PWA behavior
* Add install prompt for mobile

