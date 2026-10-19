"""Narração pt-BR (Piper, voz pt_BR-faber-medium) do filme "Saúde e Educação".
Gera um WAV por fala e saude/timeline.json com o início de cada fala no filme.
As cenas do film.html e as legendas usam esse mesmo arquivo."""
import json, os, subprocess, sys, wave

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE = os.path.join(ROOT, "../../voices/vits-piper-pt_BR-faber-medium/pt_BR-faber-medium.onnx")
OUT = os.path.join(ROOT, "../../build/saude/voice")

# id, legenda, texto para o TTS (grafia ajustada para a pronúncia), pausa depois da fala (s)
LINES = [
    ("n1", "Toda política pública começa com uma pergunta: do que a população precisa?",
           "Toda política pública começa com uma pergunta: do que a população precisa?", 0.9),
    ("n2", "A V4 FábricaGov transforma essa pergunta em dados, e os dados em ação, na saúde e na educação.",
           "A Vê Quatro Fábrica Gov transforma essa pergunta em dados. E os dados, em ação. Na saúde, e na educação.", 0.8),
    ("n3", "Com o aplicativo de pesquisa, agentes de saúde entrevistam as famílias de casa em casa, mesmo sem internet.",
           "Com o aplicativo de pesquisa, agentes de saúde entrevistam as famílias, de casa em casa, mesmo sem internet.", 0.7),
    ("n4", "As respostas chegam a um painel atualizado toda semana, por município e por região.",
           "As respostas chegam a um painel atualizado toda semana, por município e por região.", 0.7),
    ("n5", "E a nossa inteligência artificial lê o que o povo disse e aponta ao gestor o que melhorar primeiro.",
           "E a nossa inteligência artificial lê o que o povo disse, e aponta ao gestor o que melhorar primeiro.", 0.9),
    ("n6", "Na saúde, criamos sistemas de apoio: agendamento de consultas, lembretes de vacina e acompanhamento de pacientes.",
           "Na saúde, criamos sistemas de apoio: agendamento de consultas, lembretes de vacina, e acompanhamento de pacientes.", 0.9),
    ("n7", "Na educação, matrícula on-line, controle de frequência e alertas de risco de evasão, para que nenhum aluno fique para trás.",
           "Na educação, matrícula online, controle de frequência, e alertas de risco de evasão. Para que nenhum aluno fique para trás.", 0.9),
    ("n8", "Tudo com LGPD desde o projeto, o código é do cliente e o preço é até três vezes menor que o mercado.",
           "Tudo com éle gê pê dê desde o projeto. O código é do cliente. E o preço, até três vezes menor que o mercado.", 1.0),
    ("n9", "V4 FábricaGov. Tecnologia para cuidar de quem mais precisa.",
           "Vê Quatro Fábrica Gov. Tecnologia para cuidar de quem mais precisa.", 0.0),
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
        if lid == "n9":
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
