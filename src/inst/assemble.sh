#!/usr/bin/env bash
# Monta o vídeo institucional (60 s) a partir dos quadros 1080p e da mixagem.
# Uso: bash src/inst/assemble.sh [pasta_de_quadros]   (padrão: build/inst_frames)
set -euo pipefail
cd "$(dirname "$0")/../.."
FR=${1:-build/inst_frames}
OUT=deliverables/institucional
mkdir -p "$OUT/audio" build
COLOR="-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"
N=$(ls "$FR"/f*.jpg | wc -l); [ "$N" -eq 1800 ] || { echo "faltam quadros: $N/1800"; exit 1; }

# 1) Principal: 1080p H.264 (alta qualidade, compatível com tudo) + faixa de legenda opcional
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i "$FR/f%05d.jpg" -i audio/inst/mix_master.wav -i "$OUT/legendas_ptBR.srt" \
  -map 0:v -map 1:a -map 2:s -c:v libx264 -preset slow -crf 16 -maxrate 16000k -bufsize 24000k -pix_fmt yuv420p $COLOR -tune animation \
  -c:a aac -b:a 320k -ar 48000 -c:s mov_text -metadata:s:s:0 language=por -movflags +faststart -t 60 "$OUT/DigitalGov_Institucional_60s_1080p.mp4"

# 2) Com legendas embutidas (redes sociais / reprodução sem som)
ffmpeg -y -hide_banner -loglevel error -i "$OUT/DigitalGov_Institucional_60s_1080p.mp4" -map 0:v -map 0:a \
  -vf "ass=build/legendas_inst.ass" -c:v libx264 -preset slow -crf 17 -maxrate 14000k -bufsize 20000k -pix_fmt yuv420p $COLOR \
  -c:a copy -movflags +faststart "$OUT/DigitalGov_Institucional_60s_1080p_legendado.mp4"

# 3) Áudio: mix final + stems
cp audio/inst/mix_master.wav "$OUT/audio/mix_final_48k24.wav"
for s in narration:stem_narracao music:stem_trilha music_ducked:stem_trilha_com_ducking sfx:stem_efeitos; do
  ffmpeg -y -hide_banner -loglevel error -i "audio/inst/stems/${s%%:*}.wav" -c:a flac -sample_fmt s32 "$OUT/audio/${s##*:}.flac"
done
ls -lh "$OUT" "$OUT/audio"
