# Initial push runbook — `invidtiv/tensorflowcourse`

This is a one-time set of commands to publish `tensorflow-course/` to
`github.com/invidtiv/tensorflowcourse`. It must be run **on Tiago's Windows
host** (PowerShell or Git Bash) because (a) the sandbox has no GitHub
credentials, and (b) the current `.git/` folder under `tensorflow-course/` is
incomplete and needs to be re-initialized.

---

## 1. `.gitignore` is ready

Already sanity-checked and tightened in this session:

```
node_modules/
.next/
.next-old/
out/
dist/
*.tsbuildinfo

.env
.env.*
.env.local
.env*.local

.DS_Store
Thumbs.db
*.log
.fuse_hidden*
.vscode/
.idea/
*.swp
```

All three patterns you asked me to verify (`.next/`, `node_modules/`,
`.fuse_hidden*`) are present. I also added `*.tsbuildinfo` (there's a
`tsconfig.tsbuildinfo` sitting in the working tree right now), hardened the
`.env` coverage, and added the usual editor junk.

Secrets scan came back empty: no `.env*`, no `*.pem`, no `id_rsa*` anywhere
in the working tree. Large-files scan (>5 MB outside `node_modules`, `.next`,
`.git`) is also empty.

## 2. Fix the broken `.git/` first

From the sandbox I can see that `tensorflow-course/.git/` is missing its
`objects/` directory and `config` is empty — looks like an interrupted
`git init`. Easiest recovery is to remove it and start over:

```powershell
cd C:\Users\tiaz\Desktop\Github\tensorflowcourse\tensorflow-course
# Make sure no stray git process is holding the folder.
# Then blow away the half-initialized repo:
Remove-Item -Recurse -Force .git
```

## 3. Initialize, configure, commit

```powershell
git init -b main
git config user.name  "Tiago Pereira dos Santos"
git config user.email "tiago.pereira.dos.santos@gmail.com"

# Verify nothing toxic is about to be staged.
git status

# Stage everything except what .gitignore excludes.
git add .

# Double-check the staged set before committing.
# You should see src/, content/, scripts/, public/, Dockerfile,
# docker-compose.yml, package.json, package-lock.json, tsconfig.json,
# next.config.ts, etc. — and NOT node_modules/, .next/, .next-old/, or
# any .fuse_hidden* files.
git status --short | head -40

git commit -m "Initial commit: TensorFlow course website scaffold

- Next.js 14 + TypeScript + Tailwind + MDX setup
- 10 modules with 148 lab MDX files and quiz.json per module
- Theory content converted md -> mdx with enriched frontmatter,
  HTML callouts, KaTeX-ready math wrappers
- Layout shell (Navbar, Sidebar, Footer, Breadcrumb, MobileMenu,
  ReadingProgress) and ui primitives (Button, Card, Badge, Tooltip,
  ModuleCard)
- Quiz UI: Quiz, QuizQuestion, QuizResult, QuizProgress wired to
  zustand quizStore and progressStore
- NeuralNetworkHero + ParticleBackground animations
- Docker multi-stage build + docker-compose (port 6124)"
```

## 4. Add the remote and push

Create the repo on GitHub first (or use `gh repo create`):

```powershell
# Option A — gh CLI (recommended, handles auth + remote + push)
gh repo create invidtiv/tensorflowcourse --public --source=. --remote=origin --push

# Option B — manual
# 1. Create the empty repo on github.com/invidtiv/tensorflowcourse (no README, no .gitignore, no license)
# 2. git remote add origin git@github.com:invidtiv/tensorflowcourse.git
#    # or https://github.com/invidtiv/tensorflowcourse.git
# 3. git push -u origin main
```

## 5. Verify

```powershell
git remote -v
git log --oneline -1
gh repo view invidtiv/tensorflowcourse --web  # or just open it in a browser
```

You should land on the repo page showing a single commit with the full
source tree, no `node_modules/`, no `.next/`, no `.fuse_hidden*` files.

---

## Notes on why this runs on the host, not from the sandbox

1. **Credentials.** The sandbox has no `gh` token, no GitHub SSH key, and no
   credential helper. Any `git push` would fail at the auth step.
2. **Broken `.git/`.** The current folder is missing `.git/objects/` and has
   an empty `config`. Cleaning it up via `Remove-Item` from Windows is
   safer than fighting virtiofs permissions from the sandbox (we already
   saw `Operation not permitted` on `.next/` files earlier).
3. **Active host Next.js process.** The `.fuse_hidden*` files under `.next/`
   indicate a live Next process on the host is holding files. Doing
   repo-level work from the host avoids any chance of the sandbox writing
   something the host is simultaneously mutating.

Once step 4 is green, every subsequent session — including the hourly
check-ins — can use `git log`, `gh pr`, etc. to actually verify commit
activity, which has been a gap in the last few status reports.
