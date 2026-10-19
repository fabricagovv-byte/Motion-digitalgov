"""Narração pt-BR (Piper, voz pt_BR-cadu-medium + tratamento de estúdio) do filme "DigitalGov · Digitalização".
Gera um WAV por fala e digitalgov/timeline.json com o início de cada fala no filme.
As cenas do film.html e as legendas usam esse mesmo arquivo."""
import json, os, subprocess, sys, wave

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE = os.path.join(ROOT, "../../voices/vits-piper-pt_BR-cadu-medium/pt_BR-cadu-medium.onnx")
OUT = os.path.join(ROOT, "../../build/digitalgov/voice")

# id, legenda, texto para o TTS (grafia ajustada para a pronúncia), pausa depois da fala (s)
LINES = [
    ("n1", "Você sabe quanto papel o Brasil produz? São mais de dois milhões de toneladas de papel de imprimir e escrever por ano.",
           "Você sabe quanto papel o Brasil produz? São mais de dois milhões de toneladas de papel de imprimir e escrever, por ano.", 0.6),
    ("n2", "É como se, todo mês, saíssem 38 bilhões de folhas A4. Só em papel, mais de um bilhão de reais por mês.",
           "É como se, todo mês, saíssem trinta e oito bilhões de folhas A quatro. Só em papel, mais de um bilhão de reais por mês.", 0.7),
    ("n3", "No serviço público, cada folha vira processo, arquivo, caixa e tempo perdido procurando.",
           "No serviço público, cada folha vira processo, arquivo, caixa. E tempo perdido, procurando.", 0.7),
    ("n4", "A DigitalGov digitaliza os seus documentos: cada folha é escaneada, lida automaticamente e organizada para ser encontrada em segundos.",
           "A Digital Gov digitaliza os seus documentos: cada folha é escaneada, lida automaticamente, e organizada para ser encontrada em segundos.", 0.7),
    ("n5", "Com tudo digital, você acessa de qualquer lugar, com segurança, e para de gastar com impressão, papel e espaço.",
           "Com tudo digital, você acessa de qualquer lugar, com segurança. E para de gastar com impressão, papel, e espaço.", 0.7),
    ("n6", "Veja a Bahia: só em 2024, o processo eletrônico gerou mais de 50 milhões de reais de economia para o governo do estado.",
           "Veja a Bahia: só em dois mil e vinte e quatro, o processo eletrônico gerou mais de cinquenta milhões de reais de economia, para o governo do estado.", 0.8),
    ("n7", "Agora imagine o seu estado. Minas Gerais tem 853 municípios. Se cada prefeitura imprimisse 20 mil folhas por mês, seriam 17 milhões de folhas.",
           "Agora, imagine o seu estado. Minas Gerais tem oitocentos e cinquenta e três municípios. Se cada prefeitura imprimisse vinte mil folhas por mês, seriam dezessete milhões de folhas.", 0.7),
    ("n8", "A 30 centavos por página, são 5 milhões de reais por mês. Mais de 60 milhões por ano que podem virar economia.",
           "A trinta centavos por página, são cinco milhões de reais por mês. Mais de sessenta milhões por ano, que podem virar economia.", 0.8),
    ("n9", "A DigitalGov tem sede em Alvorada de Minas, no coração de Minas Gerais, e atende todo o Brasil.",
           "A Digital Gov tem sede em Alvorada de Minas, no coração de Minas Gerais. E atende todo o Brasil.", 0.8),
    ("n10", "DigitalGov. Tecnologia a serviço da sua empresa. Fale com o Warley, nosso diretor.",
            "Digital Gov. Tecnologia a serviço da sua empresa. Fale com o Uórlei, nosso diretor.", 0.0),
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
