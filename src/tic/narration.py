"""Narração pt-BR (Piper, voz pt_BR-faber-medium) do filme "TIC de Software".
Gera um WAV por fala e tic/timeline.json com o início de cada fala no filme.
As cenas do film.html e as legendas usam esse mesmo arquivo."""
import json, os, subprocess, sys, wave

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE = os.path.join(ROOT, "../../voices/vits-piper-pt_BR-faber-medium/pt_BR-faber-medium.onnx")
OUT = os.path.join(ROOT, "../../build/tic/voice")

# id, legenda, texto para o TTS (grafia ajustada para a pronúncia), pausa depois da fala (s)
LINES = [
    ("n1", "Sistema fora do ar, fornecedor que some, código que ninguém entende. Quem cuida de TI pública conhece essa história.",
           "Sistema fora do ar. Fornecedor que some. Código que ninguém entende. Quem cuida de tê í pública, conhece essa história.", 0.8),
    ("n2", "A V4 FábricaGov é uma fábrica de software brasileira que desenvolve, mantém e sustenta sistemas para o setor público e privado.",
           "A Vê Quatro Fábrica Gov é uma fábrica de software brasileira, que desenvolve, mantém e sustenta sistemas, para o setor público e privado.", 0.7),
    ("n3", "Criamos sistemas web, aplicativos e portais sob medida, com acessibilidade e integração ao gov.br.",
           "Criamos sistemas web, aplicativos e portais sob medida, com acessibilidade, e integração ao gov ponto bê érre.", 0.7),
    ("n4", "Na manutenção, cuidamos de tudo: corretiva, preventiva, evolutiva e adaptativa.",
           "Na manutenção, cuidamos de tudo: corretiva, preventiva, evolutiva e adaptativa.", 0.7),
    ("n5", "Na sustentação, sistema fora do ar tem primeiro atendimento em até 30 minutos e solução em até 4 horas, com relatório todo mês.",
           "Na sustentação, sistema fora do ar tem primeiro atendimento em até trinta minutos, e solução em até quatro horas. Com relatório todo mês.", 0.7),
    ("n6", "O processo tem cinco etapas: diagnóstico, planejamento, desenvolvimento ágil, homologação e sustentação.",
           "O processo tem cinco etapas: diagnóstico, planejamento, desenvolvimento ágil, homologação, e sustentação.", 0.7),
    ("n7", "Java, .NET, Python, React, Flutter, bancos de dados e nuvem. Assumimos o seu sistema na tecnologia em que ele já está.",
           "Java, dóti nét, Páiton, Riéct, Flâter, bancos de dados e nuvem. Assumimos o seu sistema, na tecnologia em que ele já está.", 0.7),
    ("n8", "Contratação conforme a Lei 14.133, medição por UST ou ponto de função, LGPD desde o projeto, e o código é do cliente.",
           "Contratação conforme a lei quatorze mil cento e trinta e três, medição por u ésse tê ou ponto de função, éle gê pê dê desde o projeto. E o código, é do cliente.", 0.7),
    ("n9", "E com preço justo: a UST sai por 70 reais, contra 230 da concorrência.",
           "E com preço justo: a u ésse tê sai por setenta reais, contra duzentos e trinta da concorrência.", 0.7),
    ("n10", "Em dois anos, mais de 17 portais públicos e mais de 35 clientes privados em todo o Brasil.",
            "Em dois anos, mais de dezessete portais públicos, e mais de trinta e cinco clientes privados, em todo o Brasil.", 0.8),
    ("n11", "V4 FábricaGov. Vamos modernizar o seu sistema? Agende um diagnóstico.",
            "Vê Quatro Fábrica Gov. Vamos modernizar o seu sistema? Agende um diagnóstico.", 0.0),
]
START = 0.9        # primeira fala
BEFORE_END = 1.6   # respiro extra antes da assinatura final


def main():
    os.makedirs(OUT, exist_ok=True)
    t = START; tl = []
    for i, (lid, cap, tts, pause) in enumerate(LINES):
        path = f"{OUT}/{lid}.wav"
        subprocess.run([sys.executable, "-m", "piper", "-m", VOICE, "-f", path, "--length-scale", "1.04",
                        "--noise-scale", "0.6", "--noise-w-scale", "0.7", "--sentence-silence", "0.25"],
                       input=tts.encode(), check=True, capture_output=True)
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
