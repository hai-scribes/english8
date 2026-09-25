---
name: clone-setup
description: Set up a fresh clone of this repo so pushes authenticate as hai-scribes and main is gated by the pre-push hook. Use in a new clone, when a push fails with a 403 naming the wrong GitHub user, or when .git/hooks/pre-push is missing.
---

# Fresh-clone setup

Neither `.git/hooks` nor `.git/config` is committed, so a fresh clone needs both
steps below again.

## 1. Install the pre-push hook

```sh
ln -sf ../../tools/hooks/pre-push .git/hooks/pre-push
```

A symlink, not a copy, so editing the tracked file is the whole update.

## 2. Pin pushes to the hai-scribes account

`gh` can hold several logged-in accounts, and its git credential helper hands
git the token of whichever one is **active**. It ignores the username git asks
for, so `credential.username` will not fix it. If the active account is somebody
else, the push dies with a 403 that names the wrong user.

```sh
git config --local --replace-all 'credential.https://github.com.helper' ''
git config --local --add 'credential.https://github.com.helper' \
  '!f() { test "$1" = get && printf "username=hai-scribes\npassword=%s\n" \
   "$(gh auth token -u hai-scribes)"; }; f'
git config --local user.name  "hai-scribes"
git config --local user.email "230175965+hai-scribes@users.noreply.github.com"
```

The empty first value is load-bearing: it resets the helper list inherited from
global config so only this one runs. Check it took with

```sh
printf 'protocol=https\nhost=github.com\n\n' | git credential fill | grep username
```

This changes nothing globally — other repos keep using whichever account is
active, and `gh auth switch` is not needed.
