# Step-by-Step Guide to Push Code to GitHub

## Step 1: Fix GitHub Email Privacy Settings

### Option A: Disable Email Privacy Protection (Easiest)

1. Open your web browser
2. Go to: **https://github.com/settings/emails**
3. Scroll down to find **"Block command line pushes that expose my email"**
4. **Uncheck** this option (make sure it's OFF)
5. Scroll down and click **"Update preferences"** button

### Option B: Make Email Public

1. Go to: **https://github.com/settings/emails**
2. Find **"Keep my email addresses private"**
3. Make sure it's **UNCHECKED** (OFF)
4. Click **"Update preferences"**

---

## Step 2: Configure Git Email (If needed)

After updating GitHub settings, configure your local git:

```bash
git config user.email "KishoriRaut@users.noreply.github.com"
git config user.name "Kishori Raut"
```

---

## Step 3: Update the Commit with Correct Email

```bash
git commit --amend --author="Kishori Raut <KishoriRaut@users.noreply.github.com>" --no-edit
```

---

## Step 4: Push to GitHub

```bash
git push -u origin main
```

---

## Alternative: If Still Having Issues

If you still get errors, you can also try:

1. **Check current git config:**
   ```bash
   git config user.email
   git config user.name
   ```

2. **Set email to GitHub no-reply format:**
   ```bash
   git config user.email "KishoriRaut@users.noreply.github.com"
   ```

3. **Amend the commit:**
   ```bash
   git commit --amend --reset-author --no-edit
   ```

4. **Force push (if needed):**
   ```bash
   git push -u origin main --force
   ```

---

## Quick Summary Commands

Run these commands in order:

```bash
# 1. Set git email
git config user.email "KishoriRaut@users.noreply.github.com"

# 2. Update commit author
git commit --amend --author="Kishori Raut <KishoriRaut@users.noreply.github.com>" --no-edit

# 3. Push to GitHub
git push -u origin main
```

**IMPORTANT:** Make sure you complete Step 1 (GitHub settings) first before running the commands!

