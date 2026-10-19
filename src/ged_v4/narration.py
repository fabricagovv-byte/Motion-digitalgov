"""Narração pt-BR (Piper, voz pt_BR-faber-medium) do filme "GED · Digitalização de documentos".
Gera um WAV por fala e ged_v4/timeline.json com o início de cada fala no filme.
As cenas do film.html e as legendas usam esse mesmo arquivo."""
import json, os, subprocess, sys, wave

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE = os.path.join(ROOT, "../../voices/vits-piper-pt_BR-faber-medium/pt_BR-faber-medium.onnx")
OUT = os.path.join(ROOT, "../../build/ged_v4/voice")

# id, legenda, texto para o TTS (grafia ajustada para a pronúncia), pausa depois da fala (s)
LINES = [
    ("n1", "Quantas horas a sua equipe perde procurando um papel?",
           "Quantas horas a sua equipe perde, procurando um papel?", 0.9),
    ("n2", "Pilhas de processos, caixas no arquivo, documentos que se perdem ou se estragam com o tempo.",
           "Pilhas de processos. Caixas no arquivo. Documentos que se perdem, ou se estragam com o tempo.", 0.8),
    ("n3", "Com o GED da V4 FábricaGov, cada folha é digitalizada em alta qualidade.",
           "Com o Gê É Dê da Vê Quatro Fábrica Gov, cada folha é digitalizada em alta qualidade.", 0.6),
    ("n4", "O sistema lê o texto, identifica os dados e organiza tudo em pastas, por tipo, data e setor.",
           "O sistema lê o texto, identifica os dados, e organiza tudo em pastas: por tipo, data e setor.", 0.8),
    ("n5", "Depois, é só buscar: um nome ou um número de processo, e o documento aparece em segundos.",
           "Depois, é só buscar: um nome, ou um número de processo. E o documento aparece em segundos.", 0.8),
    ("n6", "Cada pessoa vê apenas o que tem permissão para ver, e todo acesso fica registrado.",
           "Cada pessoa vê apenas o que tem permissão para ver. E todo acesso fica registrado.", 0.8),
    ("n7", "Com backup e LGPD desde o projeto, a sua equipe ganha espaço, tempo e segurança.",
           "Com backup, e éle gê pê dê desde o projeto, a sua equipe ganha espaço, tempo e segurança.", 1.0),
    ("n8", "V4 FábricaGov. Do papel ao digital, sem perder nada.",
           "Vê Quatro Fábrica Gov. Do papel ao digital, sem perder nada.", 0.0),
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
