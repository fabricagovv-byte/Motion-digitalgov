#!/usr/bin/env bash
# Monta os vídeos finais a partir dos quadros renderizados e da mixagem.
# Uso: bash src/assemble.sh [pasta_de_quadros]   (padrão: build/frames, 3840x2160)
set -euo pipefail
cd "$(dirname "$0")/.."
FR=${1:-build/frames}
OUT=deliverables
mkdir -p "$OUT/audio" build
COLOR="-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"

# 1) Master de alta qualidade (local, não versionado): H.264 CRF 14
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i "$FR/f%05d.jpg" -i audio/mix_master.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p $COLOR -tune film \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest build/GED_master_4K_alta.mp4

# 2) 4K HEVC para distribuição (≈ 10 Mb/s) com faixa de legenda opcional
ffmpeg -y -hide_banner -loglevel error -i build/GED_master_4K_alta.mp4 -i deliverables/legendas_ptBR.srt \
  -map 0:v -map 0:a -map 1:s -c:v libx265 -preset slow -b:v 9500k -maxrate 14000k -bufsize 20000k -pix_fmt yuv420p $COLOR -tag:v hvc1 \
  -x265-params log-level=error -c:a copy -c:s mov_text -metadata:s:s:0 language=por -movflags +faststart \
  "$OUT/GED_Digital_Gov_4K_HEVC.mp4"

# 3) 1080p H.264 (máxima compatibilidade) com faixa de legenda opcional
ffmpeg -y -hide_banner -loglevel error -i build/GED_master_4K_alta.mp4 -i deliverables/legendas_ptBR.srt \
  -map 0:v -map 0:a -map 1:s -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -preset slow -crf 18 -maxrate 9000k -bufsize 14000k -pix_fmt yuv420p $COLOR \
  -c:a copy -c:s mov_text -metadata:s:s:0 language=por -movflags +faststart "$OUT/GED_Digital_Gov_1080p.mp4"

# 4) 1080p com legendas embutidas (redes sociais / reprodução sem som)
ffmpeg -y -hide_banner -loglevel error -i build/GED_master_4K_alta.mp4 \
  -vf "scale=1920:1080:flags=lanczos,ass=build/legendas.ass" -c:v libx264 -preset slow -crf 18 -maxrate 9000k -bufsize 14000k -pix_fmt yuv420p $COLOR \
  -c:a copy -movflags +faststart "$OUT/GED_Digital_Gov_1080p_legendado.mp4"

# 5) Áudio: mix final + stems separados para futuras alterações
# (stems em FLAC: sem perdas, metade do tamanho)
cp audio/mix_master.wav "$OUT/audio/mix_final_48k24.wav"
for s in narration:stem_narracao music:stem_trilha music_ducked:stem_trilha_com_ducking sfx:stem_efeitos; do
  ffmpeg -y -hide_banner -loglevel error -i "audio/stems/${s%%:*}.wav" -c:a flac -sample_fmt s32 "$OUT/audio/${s##*:}.flac"
done
ls -lh "$OUT" "$OUT/audio"
