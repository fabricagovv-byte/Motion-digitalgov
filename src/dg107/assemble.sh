#!/usr/bin/env bash
# Monta o filme DIGITALGOV 10.7 (90 s) a partir dos quadros 1080p e da mixagem.
# Uso: bash src/dg107/assemble.sh [pasta_de_quadros]   (padrão: build/dg107_frames)
set -euo pipefail
cd "$(dirname "$0")/../.."
FR=${1:-build/dg107_frames}
OUT=deliverables/digitalgov-10.7
mkdir -p "$OUT/audio" build
COLOR="-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"
N=$(ls "$FR"/f*.jpg | wc -l); [ "$N" -eq 2700 ] || { echo "faltam quadros: $N/2700"; exit 1; }

# 1) Principal: 1080p H.264 (alta qualidade, compatível com tudo) + faixa de legenda opcional
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i "$FR/f%05d.jpg" -i audio/dg107/mix_master.wav -i "$OUT/legendas_ptBR.srt" \
  -map 0:v -map 1:a -map 2:s -c:v libx264 -preset slow -crf 16 -maxrate 16000k -bufsize 24000k -pix_fmt yuv420p $COLOR -tune animation \
  -c:a aac -b:a 320k -ar 48000 -c:s mov_text -metadata:s:s:0 language=por -movflags +faststart -t 90 "$OUT/DIGITALGOV_10.7_90s_1080p.mp4"

# 2) Com legendas embutidas (redes sociais / reprodução sem som)
ffmpeg -y -hide_banner -loglevel error -i "$OUT/DIGITALGOV_10.7_90s_1080p.mp4" -map 0:v -map 0:a \
  -vf "ass=build/legendas_dg107.ass" -c:v libx264 -preset slow -crf 17 -maxrate 14000k -bufsize 20000k -pix_fmt yuv420p $COLOR \
  -c:a copy -movflags +faststart "$OUT/DIGITALGOV_10.7_90s_1080p_legendado.mp4"

# 3) Áudio: mix final + stems
cp audio/dg107/mix_master.wav "$OUT/audio/mix_final_48k24.wav"
for s in narration:stem_narracao music:stem_trilha music_ducked:stem_trilha_com_ducking sfx:stem_efeitos; do
  ffmpeg -y -hide_banner -loglevel error -i "audio/dg107/stems/${s%%:*}.wav" -c:a flac -sample_fmt s32 "$OUT/audio/${s##*:}.flac"
done
ls -lh "$OUT" "$OUT/audio"
ffmpeg -y -hide_banner -loglevel error -i audio/dg107/mix_master.wav -c:a libmp3lame -b:a 256k "$OUT/audio/mix_final.mp3"
