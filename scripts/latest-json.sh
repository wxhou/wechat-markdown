#!/usr/bin/env bash
# 入参为 Release 的 tag，资产名从 stdin 逐行读入，向 stdout 输出站点用的版本信息 JSON。
# 缺任一平台安装包即非零退出且不输出——消费端把「字段缺失」当降级信号，半成品会绕过降级界面给出死链。
set -euo pipefail

tag="${1:?用法: latest-json.sh <tag>（资产名从 stdin 逐行读入）}"
repo="${GITHUB_REPOSITORY:?需要环境变量 GITHUB_REPOSITORY，形如 owner/repo}"
command -v jq >/dev/null || { printf '需要 jq\n' >&2; exit 1; }

assets=()
while IFS= read -r name; do
  if [ -n "$name" ]; then assets+=("$name"); fi
done

if [ "${#assets[@]}" -eq 0 ]; then
  printf '未从 stdin 读到任何资产名\n' >&2
  exit 1
fi

# key:后缀 —— 按后缀匹配而非文件名全等：打包产物名里含版本号，rpm 名还被历史固化成了带前导连字符的形态
mapping=(
  'macos-arm64:_aarch64.dmg'
  'macos-x64:_x64.dmg'
  'windows-x64:_x64-setup.exe'
  'linux-appimage:_amd64.AppImage'
  'linux-deb:_amd64.deb'
  'linux-rpm:.x86_64.rpm'
)

tab=$'\t'
base="https://github.com/${repo}/releases/download/${tag}"
rows=()
for entry in "${mapping[@]}"; do
  key="${entry%%:*}"
  suffix="${entry#*:}"
  matched=''
  for name in "${assets[@]}"; do
    case "$name" in *"$suffix") matched="$name"; break;; esac
  done
  if [ -z "$matched" ]; then
    printf '缺少安装包：本次 Release 没有任何资产以 %s 结尾（key %s）\n' "$suffix" "$key" >&2
    exit 1
  fi
  rows+=("${key}${tab}${base}/${matched}")
done

printf '%s\n' "${rows[@]}" | jq -Rn \
  --arg version "${tag#v}" \
  --arg tag "$tag" \
  --arg releaseUrl "https://github.com/${repo}/releases/tag/${tag}" \
  '([inputs | split("\t")] | map({key: .[0], value: .[1]}) | from_entries) as $assets
   | {version: $version, tag: $tag, releaseUrl: $releaseUrl, assets: $assets}'
