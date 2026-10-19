#!/usr/bin/env bash
# Filme "Saúde e Educação" (narrado): narração -> quadros (4 processos) -> mixagem -> MP4 limpo e legendado.
# Uso: bash render.sh [fps]   (padrão 60; SKIP_FRAMES=1 reaproveita os quadros; SKIP_TTS=1 reaproveita a narração)
set -euo pipefail
cd "$(dirname "$0")"
FPS=${1:-60}; J=4
OUT=../../build/saude; FR=$OUT/frames; DEL=../../deliverables/saude
mkdir -p "$FR" "$DEL"
[ -n "${SKIP_TTS:-}" ] || python3 narration.py
DUR=$(python3 -c "import json;print(json.load(open('timeline.json'))['end'])")
TOTAL=$(python3 -c "import math;print(math.ceil($DUR*$FPS))")
export PORT=${PORT:-8771}
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV' EXIT; sleep 1
CH=$(( (TOTAL+J-1)/J )); PIDS=()
if [ -z "${SKIP_FRAMES:-}" ]; then
  rm -f "$FR"/*.jpg
  for k in $(seq 0 $((J-1))); do
    a=$((k*CH)); b=$(( (k+1)*CH < TOTAL ? (k+1)*CH : TOTAL ))
    node render.mjs frames "$FPS" "$a" "$b" "$FR" > "$OUT/log$k.txt" 2>&1 & PIDS+=($!)
  done
  for p in "${PIDS[@]}"; do wait "$p"; done
fi
n=$(ls "$FR" | wc -l); [ "$n" -eq "$TOTAL" ] || { echo "faltam quadros: $n/$TOTAL"; exit 1; }

python3 audio.py
J1=$(ffmpeg -hide_banner -i "$OUT/mix_raw.wav" -af loudnorm=I=-14:TP=-1.3:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J1" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -loglevel error -y -i "$OUT/mix_raw.wav" -af "loudnorm=I=-14:TP=-1.3:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le "$DEL/mix_final_48k24.wav"
cp "$OUT/legendas_ptBR.srt" "$DEL/"
mkdir -p "$DEL/stems"; for s in voz trilha efeitos; do ffmpeg -loglevel error -y -i "$OUT/stem_$s.wav" -c:a flac "$DEL/stems/stem_$s.flac"; done

VF="scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p"
ENC=(-c:v libx264 -preset slow -crf 16 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -movflags +faststart)
ffmpeg -loglevel error -y -framerate "$FPS" -i "$FR/f%05d.jpg" -i "$DEL/mix_final_48k24.wav" -map 0:v -map 1:a -vf "$VF" "${ENC[@]}" "$DEL/V4_FabricaGov_Saude_Educacao_1080p.mp4"
STY="FontName=Inter,FontSize=15,PrimaryColour=&H00E8EFF2,OutlineColour=&H00161211,BackColour=&H10161211,BorderStyle=4,Outline=0,Shadow=0,MarginV=26,Bold=1"
ffmpeg -loglevel error -y -i "$DEL/V4_FabricaGov_Saude_Educacao_1080p.mp4" -vf "subtitles=$DEL/legendas_ptBR.srt:fontsdir=/usr/share/fonts/opentype/inter:force_style='$STY'" \
  "${ENC[@]}" "$DEL/V4_FabricaGov_Saude_Educacao_1080p_legendado.mp4"
echo "ok: $DEL"
