#!/usr/bin/env bash
# Logo V4.7 animada (aura): 16:9, 9:16 e 1:1. Rode desta pasta: bash render.sh
set -euo pipefail
B=../../../build/v47_logo_aura; DEL=../../../deliverables/v47/logo_aura; mkdir -p "$B" "$DEL"
python3 audio.py
ffmpeg -loglevel error -y -i $B/mix_raw.wav -af "loudnorm=I=-14:TP=-1.3,aresample=48000" $B/mix.wav
export PORT=${PORT:-8896} FILM=logo_aura
( cd .. && exec python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 ) & SRV=$!; trap 'kill $SRV' EXIT; sleep 1
LIST=("1920 1080 16x9" "1080 1920 9x16" "1080 1080 1x1"); [ -n "${ONLY:-}" ] && LIST=("$ONLY")
for f in "${LIST[@]}"; do
  set -- $f; FR=$B/f_$3; rm -rf $FR; mkdir -p $FR; PIDS=()
  for k in 0 1 2 3; do VW=$1 VH=$2 node ../kit/render.mjs frames 60 $((k*150)) $(((k+1)*150)) $FR > /dev/null & PIDS+=($!); done
  for p in "${PIDS[@]}"; do wait $p; done
  ffmpeg -loglevel error -y -framerate 60 -i $FR/f%05d.jpg -i $B/mix.wav -map 0:v -map 1:a -vf "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
    -c:v libx264 -preset slow -crf 15 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -movflags +faststart -shortest "$DEL/V47_Logo_Aura_$3.mp4"
  rm -rf $FR; echo "ok $3"
done
