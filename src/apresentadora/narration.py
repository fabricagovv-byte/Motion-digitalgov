"""Narração pt-BR (Kokoro v1.0, voz pf_dora (feminina), mais rápida e natural, + tratamento leve) do filme "DigitalGov · Digitalização".
Gera um WAV por fala e digitalgov/timeline.json com o início de cada fala no filme.
As cenas do film.html e as legendas usam esse mesmo arquivo."""
import json, os, subprocess, sys, wave
import soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
KDIR = os.path.join(ROOT, "../../voices/kokoro")
VOICE = os.environ.get("KOKORO_VOICE", "pf_dora")
SPEED = float(os.environ.get("KOKORO_SPEED", "1.05"))
OUT = os.path.join(ROOT, "../../build/apresentadora/voice")

# id, legenda, texto para o TTS (grafia ajustada para a pronúncia), pausa depois da fala (s)
LINES = [
    ("n1", "Olá! Aqui é da DigitalGov, e hoje eu vou te mostrar como a digitalização pode transformar o seu órgão.",
           "Olá! Aqui é da Digital Gov. E hoje, eu vou te mostrar como a digitalização pode transformar o seu órgão.", 0.6),
    ("n2", "Todo mês, o Brasil produz o equivalente a 38 bilhões de folhas de papel. E boa parte disso vira processo, arquivo e caixa.",
           "Todo mês, o Brasil produz o equivalente a trinta e oito bilhões de folhas de papel. E boa parte disso vira processo, arquivo, e caixa.", 0.6),
    ("n3", "Na DigitalGov, a gente digitaliza tudo em seis etapas: preparação, digitalização, tratamento da imagem, leitura e indexação, controle de qualidade e publicação.",
           "Na Digital Gov, a gente digitaliza tudo em seis etapas: preparação, digitalização, tratamento da imagem, leitura e indexação, controle de qualidade, e publicação.", 0.6),
    ("n4", "E aí entra o GED, a nossa gestão eletrônica de documentos. Olha só como fica fácil encontrar um processo.",
           "E aí entra o Gê É Dê, a nossa gestão eletrônica de documentos. Olha só como fica fácil encontrar um processo.", 0.5),
    ("n5", "Você digita o número, um nome ou qualquer palavra do texto, e o documento aparece em segundos, já com o trecho destacado.",
           "Você digita o número, um nome, ou qualquer palavra do texto. E o documento aparece em segundos, já com o trecho destacado.", 0.5),
    ("n6", "Dá para filtrar por setor, data e tipo, abrir a visualização e baixar em PDF, tudo com acesso controlado.",
           "Dá para filtrar por setor, data e tipo, abrir a visualização, e baixar em pê dê éfe. Tudo com acesso controlado.", 0.6),
    ("n7", "Na Bahia, o processo eletrônico gerou 50 milhões de reais de economia só em 2024. Imagina isso no seu município.",
           "Na Bahia, o processo eletrônico gerou cinquenta milhões de reais de economia, só em dois mil e vinte e quatro. Imagina isso no seu município!", 0.6),
    ("n8", "São mais de 10 anos de mercado, atendimento em todo o Brasil e sede em Alvorada de Minas.",
           "São mais de dez anos de mercado, atendimento em todo o Brasil, e sede em Alvorada de Minas.", 0.6),
    ("n9", "Fala com o Warley, nosso diretor, e vamos digitalizar o seu acervo!",
           "Fala com o Uórlei, nosso diretor, e vamos digitalizar o seu acervo!", 0.0),
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
