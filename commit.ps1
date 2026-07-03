param([string]$m = "update")
Remove-Item '.git\refs\heads\main.lock' -Force -ErrorAction SilentlyContinue
Remove-Item '.git\HEAD.lock' -Force -ErrorAction SilentlyContinue
git add -A
git commit -m $m