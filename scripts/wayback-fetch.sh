#!/usr/bin/env bash
# Recover old wegeekout.com material from the Internet Archive.
# Run on your own machine from the repo root (the dev container can't reach archive.org):
#
#   bash scripts/wayback-fetch.sh
#
# Needs only bash + curl. Re-runnable; skips files it already has. Writes:
#   public/sites/wegeekout.com/files/*   missing Drupal images, if archived
#   .work/old-theme/                     the old Drupal theme's CSS/images, if archived
#   .work/wayback/home-snapshots.txt     snapshots of the old home page, to look at
#   .work/wayback/links.tsv              external links -> closest archived copy
set -u
cd "$(dirname "$0")/.."
CDX="https://web.archive.org/cdx/search/cdx"
UA="wegeekout-archive-recovery (personal site migration)"
mkdir -p .work/wayback .work/old-theme public/sites/wegeekout.com/files

get() { curl -sS -L --retry 3 --retry-delay 5 -A "$UA" "$@"; }

# True if a file is really HTML (Wayback sometimes serves an error page with status 200).
is_html() { head -c 512 "$1" | grep -qiE '<!doctype html|<html'; }

# Download the raw (id_) copy of every archived 200 response under a URL prefix.
fetch_prefix() { # $1 = prefix, $2 = local dir, $3 = path part to strip
  get "$CDX?url=$1*&output=txt&fl=timestamp,original&filter=statuscode:200&collapse=urlkey" |
  while read -r ts orig; do
    rel="${orig#*$3}"; rel="${rel%%\?*}"
    out="$2/$(printf '%s' "$rel" | sed 's/%20/ /g')"
    case "$rel" in *'"'*|*'<'*|*'>'*|*' '*'='*) continue;; esac   # junk URLs from page scraping
    [ -s "$out" ] && ! is_html "$out" && { echo "have  $rel"; continue; }
    mkdir -p "$(dirname "$out")"
    if get -f -o "$out" "https://web.archive.org/web/${ts}id_/${orig}" && ! { is_html "$out" && [[ "$out" != *.html ]]; }; then
      echo "got   $rel ($ts)"
    else echo "FAIL  $rel"; rm -f "$out"; fi
    sleep 1
  done
}

# Try every capture of one exact URL, newest first, until one is a real image.
fetch_exact() { # $1 = URL without scheme, $2 = output file
  [ -s "$2" ] && ! is_html "$2" && { echo "have  $2"; return; }
  mkdir -p "$(dirname "$2")"
  for ts in $(get "$CDX?url=$1&output=txt&fl=timestamp&filter=statuscode:200" | sort -r); do
    if get -f -o "$2" "https://web.archive.org/web/${ts}id_/http://$1" && ! is_html "$2"; then echo "got   $2 ($ts)"; return; fi
    rm -f "$2"; sleep 1
  done
  echo "NONE  $1"
}

echo "== Images still missing after the first run (2026-11-03)"
D=public/sites/wegeekout.com/files
for f in git-diff2-250.png frets-small.jpg strum-small.jpg; do
  fetch_exact "wegeekout.com/sites/wegeekout.com/files/$f" "$D/$f"
done
# Hotlinked image in "How to Merge into Traffic" (reactiongifs.com is gone).
fetch_exact "www.reactiongifs.com/r/lkrwtf.gif" public/images/blog/how-merge-traffic-right-way/lkrwtf.gif
# The old site's header banner (referenced by bloggrail/custom.css).
fetch_exact "wegeekout.com/sites/all/themes/bloggrail/images/wegeekout.gif" .work/old-theme/bloggrail/images/wegeekout.gif

echo "== Drupal uploaded files"
fetch_prefix "wegeekout.com/sites/wegeekout.com/files/" public/sites/wegeekout.com/files "/sites/wegeekout.com/files/"

echo "== Old theme (bloggrail desktop theme + custom mobile theme)"
fetch_prefix "wegeekout.com/sites/all/themes/bloggrail/" .work/old-theme/bloggrail "/themes/bloggrail/"
fetch_prefix "wegeekout.com/sites/all/themes/zen/" .work/old-theme/zen "/themes/zen/"
fetch_prefix "wegeekout.com/sites/default/themes/wegeekout_mobile_jquery/" .work/old-theme/wegeekout_mobile_jquery "/themes/wegeekout_mobile_jquery/"

echo "== Home page snapshots 2011-2016"
get "$CDX?url=wegeekout.com/&output=txt&fl=timestamp&filter=statuscode:200&from=2011&to=2016&collapse=timestamp:6" |
  sed 's|^|https://web.archive.org/web/|; s|$|/http://wegeekout.com/|' > .work/wayback/home-snapshots.txt
wc -l < .work/wayback/home-snapshots.txt | xargs echo "snapshots:"

echo "== External links -> closest archived copy (this takes a few minutes)"
printf 'file\tdate\turl\tlive_status\tarchived_url\n' > .work/wayback/links.tsv
for f in src/content/*/*.md; do
  date=$(sed -n 's/^pubDate: \([0-9-]*\).*/\1/p' "$f" | tr -d '-'); date=${date:-20120101}
  grep -ohE '\]\(https?://[^) ]+|href="https?://[^"]+' "$f" | sed -E 's/^\]\(//; s/^href="//' | sort -u |
  while read -r url; do
    case "$url" in *wegeekout.com*|*web.archive.org*) continue;; esac
    live=$(curl -s -o /dev/null -m 15 -L -A "$UA" -w '%{http_code}' "$url")
    enc=$(printf '%s' "$url" | sed 's/%/%25/g; s/&/%26/g; s/?/%3F/g; s/#/%23/g; s/+/%2B/g')
    arch=$(get "https://archive.org/wayback/available?url=${enc}&timestamp=${date}" |
           sed -n 's/.*"closest": *{[^}]*"url": *"\([^"]*\)".*/\1/p')
    printf '%s\t%s\t%s\t%s\t%s\n' "$f" "$date" "$url" "$live" "${arch:-NONE}" >> .work/wayback/links.tsv
    printf '%s  %s\n' "$live" "$url"
    sleep 1
  done
done
echo "Done. Missing images still not found:"
for img in scavengeroo-screencap.png frets-small.jpg strum-small.jpg notes-small.jpg CMD32.png android_200.jpg \
  batteries-IMG_2129_250.jpg happiness-activities.png happiness-activities_matrix.png happiness-hours.png \
  "yahoo pipes.png" pacworld-thumb150.png seated_man_thinks_of_clipboard.png; do
  [ -s "public/sites/wegeekout.com/files/$img" ] || echo "  $img"
done
