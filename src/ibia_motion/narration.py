"""Narração pt-BR (Kokoro v1.0, voz pm_alex, mais rápida e natural, + tratamento leve) do filme "Ibiá – MG".
Gera um WAV por fala e ibia_motion/timeline.json com o início de cada fala no filme.
As cenas do film.html e as legendas usam esse mesmo arquivo."""
import json, os, subprocess, sys, wave
import soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
KDIR = os.path.join(ROOT, "../../voices/kokoro")
VOICE = os.environ.get("KOKORO_VOICE", "pm_alex")
SPEED = float(os.environ.get("KOKORO_SPEED", "1.05"))
OUT = os.path.join(ROOT, "../../build/ibia_motion/voice")

# id, legenda, texto para o TTS (grafia ajustada para a pronúncia), pausa depois da fala (s)
LINES = [
    ("n1", "No Alto Paranaíba, em Minas Gerais, existe uma cidade que guarda três séculos de história.",
           "No Alto Paranaíba, em Minas Gerais, existe uma cidade que guarda três séculos de história.", 0.5),
    ("n2", "Ibiá. Mais de 22 mil habitantes, 2.700 quilômetros quadrados, a 895 metros de altitude.",
           "Ibiá. Mais de vinte e dois mil habitantes. Dois mil e setecentos quilômetros quadrados, a oitocentos e noventa e cinco metros de altitude.", 0.6),
    ("n3", "Tudo começou com um pouso à beira da estrada e com uma promessa a São Pedro de Alcântara, o primeiro nome do povoado.",
           "Tudo começou com um pouso à beira da estrada. E com uma promessa a São Pedro de Alcântara, o primeiro nome do povoado.", 0.6),
    ("n4", "No século XVIII, a região viu nascer o Quilombo do Ambrósio, símbolo de resistência negra em Minas, destruído em 1759.",
           "No século dezoito, a região viu nascer o Quilombo do Ambrósio, símbolo de resistência negra em Minas, destruído em mil setecentos e cinquenta e nove.", 0.6),
    ("n5", "Do alto do Morro da Espia, conta a tradição, os quilombolas vigiavam quem chegava. Os dois são patrimônio tombado desde 1998.",
           "Do alto do Morro da Espia, conta a tradição, os quilombolas vigiavam quem chegava. Os dois são patrimônio tombado desde mil novecentos e noventa e oito.", 0.6),
    ("n6", "Depois vieram os trilhos. A ferrovia fez de Ibiá um entroncamento ferroviário.",
           "Depois, vieram os trilhos. A ferrovia fez de Ibiá um entroncamento ferroviário.", 0.6),
    ("n7", "Em 7 de setembro de 1923, Ibiá se tornou município.",
           "Em sete de setembro de mil novecentos e vinte e três, Ibiá se tornou município.", 0.6),
    ("n8", "Hoje, o Museu Histórico guarda essa memória: fotos, peças arqueológicas e urnas indígenas.",
           "Hoje, o Museu Histórico guarda essa memória: fotos, peças arqueológicas, e urnas indígenas.", 0.6),
    ("n9", "Em setembro, a Festa do Ibiaense reúne a cidade: rodeio, queima do alho, desfile e muita música.",
           "Em setembro, a Festa do Ibiaense reúne a cidade: rodeio, queima do alho, desfile, e muita música.", 0.6),
    ("n10", "No campo, soja, café e milho movem a economia: quase 1 bilhão de reais em lavouras em 2023.",
            "No campo, soja, café e milho movem a economia: quase um bilhão de reais em lavouras, em dois mil e vinte e três.", 0.7),
    ("n11", "Ibiá. Memória, fé e trabalho.",
            "Ibiá. Memória, fé, e trabalho.", 0.0),
]
# corta silêncio nas pontas, EQ suave, compressão leve, sem eco
FX = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
      "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,"
      "highpass=f=70,equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=3500:t=q:w=1.4:g=1.5,"
      "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,"
      "aresample=48000:resampler=soxr,loudnorm=I=-16:TP=-1.5:LRA=7")
START = 0.7        # primeira fala
BEFORE_END = 1.0   # respiro extra antes da assinatura final


def main():
    global K
    from kokoro_onnx import Kokoro
    K = Kokoro(f"{KDIR}/kokoro-v1.0.onnx", f"{KDIR}/voices-v1.0.bin")
    os.makedirs(OUT, exist_ok=True)
    t = START; tl = []
    for i, (lid, cap, tts, pause) in enumerate(LINES):
        path = f"{OUT}/{lid}.wav"; raw = f"{OUT}/{lid}_raw.wav"
        samples, sr = K.create(tts, voice=VOICE, speed=SPEED, lang="pt-br")
        sf.write(raw, samples, sr)
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
