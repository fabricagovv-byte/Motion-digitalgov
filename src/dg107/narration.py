"""Narração do filme DIGITALGOV 10.7 (90 s) — Piper, voz neural pt-BR.

Texto da legenda = roteiro (literal). Texto falado = mesma frase com grafia fonética
("DIGITALGOV 10.7" -> "Digital Góvi dez ponto sete").
Uso: python3 src/dg107/narration.py [--scale 0.82] [--tempo 1.07] [--takes 6]
"""
import os, sys
sys.path.insert(0, "src/inst")
import narration as N

N.OUT = "audio/dg107/narration"
DG, DGF = "DIGITALGOV 10.7", "Digital Góvi dez ponto sete"
S = [
    ("d1a", "O que antes exigia inúmeras etapas manuais agora pode ser realizado em um único ambiente inteligente."),
    ("d1b", f"Conheça a {DG}."),
    ("d2", f"Enquanto os métodos tradicionais dependem de tarefas repetitivas, a {DG} automatiza processos e permite que equipes concentrem seus esforços nas atividades que realmente exigem atenção humana."),
    ("d3", "Mais do que processar documentos, nossa tecnologia busca elevar a qualidade de cada entrega, com restauração digital, verificação de legibilidade e preservação das informações originais."),
    ("d4", "Com fluxos automatizados, acompanhamento contínuo e identificação antecipada de falhas, a plataforma ajuda a reduzir gargalos, otimizar recursos e tornar os prazos de entrega mais previsíveis."),
    ("d5a", "Uma entrega de qualidade começa muito antes do envio."),
    ("d5b", "Cada lote pode ser conferido, organizado, rastreado e disponibilizado com segurança, proporcionando mais transparência e controle."),
    ("d6a", "Não se trata apenas de digitalizar documentos."),
    ("d6b", "Trata-se de transformar toda uma operação: produzir com mais eficiência, controlar a qualidade, diminuir retrabalhos e entregar com mais agilidade."),
    ("d7a", "Da primeira página à entrega final."),
    ("d7b", "Uma plataforma, múltiplas inteligências e um novo padrão de gestão documental."),
]
N.LINES = [(i, c, c.replace(DG, DGF).replace("operação:", "operação."), 0.16) for i, c in S]
_wer = N.wer
N.wer = lambda ref, hyp: _wer(ref.replace(DG, "Digital Gov 10.7"), hyp)

if __name__ == "__main__":
    N.main()
