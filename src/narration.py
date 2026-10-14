"""Sintetiza a narração (pt-BR) bloco a bloco com Piper (voz neural pt_BR-faber-medium).

Cada bloco vira um WAV separado; durações são gravadas em audio/narration/durations.json
para que o timeline (src/timeline.py) posicione cenas e legendas com precisão.
"""
import json, os, subprocess, sys, wave

VOICE = os.environ.get("PIPER_VOICE", "voices/vits-piper-pt_BR-faber-medium/pt_BR-faber-medium.onnx")
OUT = "audio/narration"

# id, legenda, texto enviado ao TTS, [pausa entre frases em s] (grafia fonética de GED = "Gê-É-Dê")
LINES = [
    ("n1", "Imagine ter seus documentos organizados, disponíveis e prontos para serem encontrados.",
           "Imagine ter seus documentos: organizados, disponíveis e prontos, para serem encontrados."),
    ("n2", "Com a Gestão Eletrônica de Documentos, o GED, a informação deixa de ficar presa ao papel.",
           "Com a Gestão Eletrônica de Documentos, o Gê É Dê, a informação deixa de ficar presa ao papel."),
    ("n3", "Seus arquivos são digitalizados, organizados e indexados para facilitar a consulta e o gerenciamento.",
           "Seus arquivos são digitalizados, organizados e indexados, para facilitar a consulta e o gerenciamento."),
    ("n4a", "No escritório, em casa ou em qualquer lugar do mundo,",
            "No escritório, em casa, ou em qualquer lugar do mundo,"),
    ("n4b", "você pode acessar seus documentos de forma prática, conforme suas permissões de acesso.",
            "você pode acessar seus documentos de forma prática, conforme suas permissões de acesso."),
    ("n5", "Mais organização. Mais agilidade. Mais controle.",
           "Mais organização. Mais agilidade. Mais controle.", 0.4),
    ("n6", "GED. Uma nova dimensão para a gestão documental.",
           "Gê É Dê. Uma nova dimensão para a gestão documental.", 0.45),
]

def main():
    os.makedirs(OUT, exist_ok=True)
    durs = {}
    for lid, caption, tts, *rest in LINES:
        pause = rest[0] if rest else 0
        path = f"{OUT}/{lid}.wav"
        subprocess.run([sys.executable, "-m", "piper", "-m", VOICE, "-f", path,
                        "--length-scale", "1.08", "--noise-scale", "0.6", "--noise-w-scale", "0.7",
                        "--sentence-silence", str(pause)], input=tts.encode(), check=True)
        with wave.open(path) as w:
            durs[lid] = {"dur": w.getnframes() / w.getframerate(), "caption": caption}
        print(lid, round(durs[lid]["dur"], 2))
    json.dump(durs, open(f"{OUT}/durations.json", "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
