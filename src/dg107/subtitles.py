"""Legendas pt-BR (SRT, VTT e ASS) do filme DIGITALGOV 10.7, sincronizadas com a narração real."""
import importlib.util, json, sys
sys.path.insert(0, "src")
spec = importlib.util.spec_from_file_location("inst_subs", "src/inst/subtitles.py"); M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
M.TL = json.load(open("src/dg107/timeline.json")); M.DURS = json.load(open("audio/dg107/narration/durations.json")); M.OUT = "deliverables/digitalgov-10.7"
M.SPLITS = {
    "d1a": ["O que antes exigia inúmeras etapas manuais", "agora pode ser realizado em um único ambiente inteligente."],
    "d2": ["Enquanto os métodos tradicionais dependem de tarefas repetitivas,", "a DIGITALGOV 10.7 automatiza processos", "e permite que equipes concentrem seus esforços", "nas atividades que realmente exigem atenção humana."],
    "d3": ["Mais do que processar documentos,", "nossa tecnologia busca elevar a qualidade de cada entrega,", "com restauração digital, verificação de legibilidade", "e preservação das informações originais."],
    "d4": ["Com fluxos automatizados, acompanhamento contínuo", "e identificação antecipada de falhas,", "a plataforma ajuda a reduzir gargalos, otimizar recursos", "e tornar os prazos de entrega mais previsíveis."],
    "d5b": ["Cada lote pode ser conferido, organizado, rastreado", "e disponibilizado com segurança,", "proporcionando mais transparência e controle."],
    "d6b": ["Trata-se de transformar toda uma operação:", "produzir com mais eficiência, controlar a qualidade,", "diminuir retrabalhos e entregar com mais agilidade."],
    "d7b": ["Uma plataforma, múltiplas inteligências", "e um novo padrão de gestão documental."],
}
if __name__ == "__main__":
    M.main()
    import os; os.replace("build/legendas_inst.ass", "build/legendas_dg107.ass")
