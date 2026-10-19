"""Narração pt-BR (Kokoro v1.0, voz pm_alex, mais rápida e natural, + tratamento leve) do filme "DigitalGov · Digitalização".
Gera um WAV por fala e digitalgov/timeline.json com o início de cada fala no filme.
As cenas do film.html e as legendas usam esse mesmo arquivo."""
import json, os, subprocess, sys, wave
import soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
KDIR = os.path.join(ROOT, "../../voices/kokoro")
VOICE = os.environ.get("KOKORO_VOICE", "pm_alex")
SPEED = float(os.environ.get("KOKORO_SPEED", "1.12"))
OUT = os.path.join(ROOT, "../../build/digitalgov/voice")

# id, legenda, texto para o TTS (grafia ajustada para a pronúncia), pausa depois da fala (s)
LINES = [
    ("n1", "Todo mês, o Brasil produz o equivalente a 38 bilhões de folhas de papel.",
           "Todo mês, o Brasil produz o equivalente a trinta e oito bilhões de folhas de papel.", 0.5),
    ("n2", "São mais de 2 milhões de toneladas por ano, e mais de 1 bilhão de reais por mês, só em papel.",
           "São mais de dois milhões de toneladas por ano. E mais de um bilhão de reais por mês, só em papel.", 0.6),
    ("n3", "E o papel ocupa espaço, se perde, amarela e consome o tempo de quem precisa trabalhar.",
           "E o papel ocupa espaço, se perde, amarela, e consome o tempo de quem precisa trabalhar.", 0.6),
    ("n4", "Quando o serviço público troca o papel pelo digital, a economia é real. Na Bahia, o processo eletrônico já poupou mais de 1,2 bilhão de folhas, e 50 milhões de reais só em 2024.",
           "Quando o serviço público troca o papel pelo digital, a economia é real. Na Bahia, o processo eletrônico já poupou mais de um bilhão e duzentos milhões de folhas. E cinquenta milhões de reais, só em dois mil e vinte e quatro.", 0.6),
    ("n5", "É dinheiro que volta para a saúde, a educação e a cidade. É assim que a digitalização ajuda a economia do Brasil.",
           "É dinheiro que volta para a saúde, a educação, e a cidade. É assim que a digitalização ajuda a economia do Brasil.", 0.7),
    ("n6", "Na DigitalGov, a digitalização acontece em seis etapas.",
           "Na Digital Gov, a digitalização acontece em seis etapas.", 0.4),
    ("n7", "Primeiro, recebemos e preparamos os documentos: tiramos os grampos, organizamos e higienizamos as folhas.",
           "Primeiro, recebemos e preparamos os documentos: tiramos os grampos, organizamos, e higienizamos as folhas.", 0.4),
    ("n8", "Depois, cada folha é escaneada em alta resolução, e a imagem é tratada para ficar nítida.",
           "Depois, cada folha é escaneada em alta resolução. E a imagem é tratada, para ficar nítida.", 0.4),
    ("n9", "O sistema lê o texto automaticamente e indexa cada documento por nome, número, data e setor.",
           "O sistema lê o texto automaticamente, e indexa cada documento por nome, número, data e setor.", 0.4),
    ("n10", "Uma revisão de qualidade confere tudo, página por página.",
            "Uma revisão de qualidade confere tudo, página por página.", 0.4),
    ("n11", "Por fim, os documentos são publicados no sistema, com acesso seguro, de qualquer lugar.",
            "Por fim, os documentos são publicados no sistema, com acesso seguro, de qualquer lugar.", 0.7),
    ("n12", "Agora imagine o seu estado. Em Minas Gerais, 853 prefeituras imprimindo 20 mil folhas por mês, a 30 centavos cada, são 5 milhões de reais por mês. Mais de 60 milhões por ano.",
            "Agora, imagine o seu estado. Em Minas Gerais, oitocentas e cinquenta e três prefeituras, imprimindo vinte mil folhas por mês, a trinta centavos cada: são cinco milhões de reais por mês. Mais de sessenta milhões por ano.", 0.7),
    ("n13", "Por que escolher a DigitalGov? Mais de 10 anos de mercado, atendimento em todo o Brasil, segurança e LGPD desde o projeto, e preço justo.",
            "Por que escolher a Digital Gov? Mais de dez anos de mercado. Atendimento em todo o Brasil. Segurança, e éle gê pê dê desde o projeto. E preço justo.", 0.6),
    ("n14", "Nossa sede fica em Alvorada de Minas, no coração de Minas Gerais, e atendemos todo o país.",
            "Nossa sede fica em Alvorada de Minas, no coração de Minas Gerais. E atendemos todo o país.", 0.6),
    ("n15", "DigitalGov. Tecnologia a serviço da sua empresa. Fale com o Warley, nosso diretor.",
            "Digital Gov. Tecnologia a serviço da sua empresa. Fale com o Uórlei, nosso diretor.", 0.0),
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
