"""Narração pt-BR (Piper, voz pt_BR-cadu-medium + tratamento de estúdio) do filme "Restauração de documentos".
Gera um WAV por fala e restauracao/timeline.json com o início de cada fala no filme.
As cenas do film.html e as legendas usam esse mesmo arquivo."""
import json, os, subprocess, sys, wave

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE = os.path.join(ROOT, "../../voices/vits-piper-pt_BR-cadu-medium/pt_BR-cadu-medium.onnx")
OUT = os.path.join(ROOT, "../../build/restauracao/voice")

# id, legenda, texto para o TTS (grafia ajustada para a pronúncia), pausa depois da fala (s)
LINES = [
    ("n1", "Um documento manchado, rasgado ou apagado pode guardar a história de uma cidade inteira.",
           "Um documento manchado, rasgado, ou apagado, pode guardar a história de uma cidade inteira.", 0.8),
    ("n2", "Agora a V4 FábricaGov tem uma plataforma de restauração de documentos, para órgãos públicos e empresas.",
           "Agora, a Vê Quatro Fábrica Gov tem uma plataforma de restauração de documentos. Para órgãos públicos, e empresas.", 0.7),
    ("n3", "Você envia a imagem, e o software remove manchas, corrige o papel amarelado e recupera o texto apagado.",
           "Você envia a imagem, e o software remove manchas, corrige o papel amarelado, e recupera o texto apagado.", 0.7),
    ("n4", "E você recebe duas versões: o documento restaurado e o texto limpo, transcrito do que está escrito na folha.",
           "E você recebe duas versões: o documento restaurado. E o texto limpo, transcrito do que está escrito na folha.", 0.8),
    ("n5", "No mercado, a restauração manual custa de 50 a 500 reais por página. Com a V4, de 15 a 30 reais.",
           "No mercado, a restauração manual custa de cinquenta a quinhentos reais por página. Com a Vê Quatro, de quinze a trinta reais.", 0.8),
    ("n6", "Imagine um órgão que precisa restaurar 20 mil páginas. No mercado, de 1 a 10 milhões de reais. Com a V4, de 300 a 600 mil.",
           "Imagine um órgão que precisa restaurar vinte mil páginas. No mercado, de um a dez milhões de reais. Com a Vê Quatro, de trezentos a seiscentos mil.", 0.8),
    ("n7", "E por ser software, a entrega é muito mais rápida que a restauração feita à mão.",
           "E por ser software, a entrega é muito mais rápida que a restauração feita à mão.", 0.7),
    ("n8", "A entrega é segura: o documento restaurado fica na palma da mão, com acesso controlado.",
           "A entrega é segura: o documento restaurado fica na palma da mão, com acesso controlado.", 0.7),
    ("n9", "Você também pode enviar documentos já restaurados, organizar o acervo e exportar quando precisar.",
           "Você também pode enviar documentos já restaurados, organizar o acervo, e exportar quando precisar.", 0.7),
    ("n10", "E tem uma área de trabalho para a sua equipe: apresentar documentos, preparar respostas e compartilhar com outros órgãos.",
            "E tem uma área de trabalho para a sua equipe: apresentar documentos, preparar respostas, e compartilhar com outros órgãos.", 0.9),
    ("n11", "V4 FábricaGov. Restauração de documentos mais rápida, mais segura, e por uma fração do preço.",
            "Vê Quatro Fábrica Gov. Restauração de documentos: mais rápida, mais segura, e por uma fração do preço.", 0.0),
]
FX = ("highpass=f=70,equalizer=f=220:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.4:g=2.5,equalizer=f=9000:t=q:w=1:g=1.5,"
      "acompressor=threshold=-21dB:ratio=3:attack=6:release=90:makeup=3,deesser=i=0.35,aecho=0.85:0.55:28|46:0.07|0.05,"
      "aresample=48000:resampler=soxr,loudnorm=I=-16:TP=-1.5:LRA=7")
START = 0.9        # primeira fala
BEFORE_END = 1.6   # respiro extra antes da assinatura final


def main():
    os.makedirs(OUT, exist_ok=True)
    t = START; tl = []
    for i, (lid, cap, tts, pause) in enumerate(LINES):
        path = f"{OUT}/{lid}.wav"; raw = f"{OUT}/{lid}_raw.wav"
        subprocess.run([sys.executable, "-m", "piper", "-m", VOICE, "-f", raw, "--length-scale", "0.98",
                        "--noise-scale", "0.6", "--noise-w-scale", "0.7", "--sentence-silence", "0.25"],
                       input=tts.encode(), check=True, capture_output=True)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", FX, "-ac", "1", path], check=True)
        with wave.open(path) as w:
            d = w.getnframes() / w.getframerate()
        if i == len(LINES) - 1:
            t += BEFORE_END
        tl.append({"id": lid, "start": round(t, 3), "dur": round(d, 3), "caption": cap})
        t += d + pause
    end = round(t + 3.2, 2)
    json.dump({"lines": tl, "end": end}, open(os.path.join(ROOT, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    for l in tl:
        print(l["id"], l["start"], l["dur"])
    print("end", end)


if __name__ == "__main__":
    main()
