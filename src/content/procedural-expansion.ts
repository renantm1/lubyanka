import type { Conclusion } from "../game/types";
export type ProceduralVariant = readonly [Conclusion, string, string, string];

// Três situações adicionais por arquétipo, na mesma ordem do catálogo original.
// Acusação, prova e contexto existem antes da geração dos documentos.
export const additionalVariants: readonly (readonly ProceduralVariant[])[] = [
  [
    [
      "innocent",
      "Interrompeu deliberadamente a alimentação elétrica do laminador.",
      "O registrador da companhia elétrica mostra queda de tensão na subestação, antes de qualquer acionamento no painel da fábrica.",
      "O operador permaneceu no posto para impedir o religamento com colegas dentro da linha; a direção chamou a precaução de sabotagem.",
    ],
    [
      "responsible",
      "Anulou o alarme de temperatura da câmara de produção.",
      "O lacre do relé foi rompido e a ponte encontrada no circuito coincide com o fio retirado do seu armário, cuja entrega ele reconhece por escrito.",
      "O alarme interrompia turnos pagos por produção. Desativá-lo protegeu o adicional salarial e deixou colegas sem aviso de superaquecimento.",
    ],
    [
      "coverup",
      "Abriu a descarga de um tanque químico durante o turno.",
      "O registro automático marca a descarga antes da entrada do operador; uma ordem da direção dispensou a troca da válvula condenada.",
      "A direção substituiu a folha do turno para transferir a responsabilidade pelo vazamento ao primeiro trabalhador que chegou depois.",
    ],
  ],
  [
    [
      "responsible",
      "Revendeu cartões de racionamento retirados do estoque.",
      "Os números dos cartões apreendidos correspondem à retirada assinada por ele; o comprador conserva uma via manuscrita do pagamento.",
      "O dinheiro comprou alimentos para um abrigo. As famílias a quem os cartões pertenciam ficaram sem a própria cota.",
    ],
    [
      "innocent",
      "Transportou tecido público para um comprador particular.",
      "A guia da cooperativa e o recibo da lavanderia identificam o transporte como devolução de uniformes após o conserto, sem venda.",
      "O denunciante viu os fardos numa oficina civil, mas não examinou o contrato de manutenção que autorizava a entrega.",
    ],
    [
      "coverup",
      "Deu baixa em combustível que nunca chegou ao depósito.",
      "O posto de pesagem registra o caminhão desviado para a residência funcional do diretor; a baixa foi lançada com uma credencial usada durante a ausência do almoxarife.",
      "A auditoria recebeu apenas o inventário final. A guia do desvio foi guardada pelo motorista para não responder sozinho pela entrega.",
    ],
  ],
  [
    [
      "responsible",
      "Enviou fotografias de uma planta restrita por correio particular.",
      "O negativo encontrado na sua câmera reproduz a planta, e o canhoto postal assinado corresponde ao envelope recuperado com as ampliações.",
      "O destinatário era um engenheiro afastado que tentava corrigir uma falha. A intenção não substitui autorização para retirar a planta.",
    ],
    [
      "innocent",
      "Transmitiu uma lista secreta pelo telex da biblioteca.",
      "O rolo original do telex contém apenas referências bibliográficas; a lista foi inserida na transcrição depois, com outra largura de caracteres.",
      "A operadora guardou a fita contínua. O relatório entregue à chefia tinha uma página avulsa no lugar do trecho original.",
    ],
    [
      "coverup",
      "Fez desaparecer um relatório de inspeção antes de uma reunião.",
      "O livro de protocolo registra o relatório lacrado no malote do gabinete antes de o tradutor receber a convocação; o recibo de chegada leva a rubrica do assessor.",
      "A inspeção descrevia falhas no centro de pesquisa. A acusação foi aberta depois que o gabinete soube que existia uma segunda via.",
    ],
  ],
  [
    [
      "responsible",
      "Deixou a unidade usando uma autorização de saída falsificada.",
      "O formulário apreendido repete o número de uma autorização já encerrada; a folha de carbono no seu alojamento conserva a nova data e sua correção manuscrita.",
      "A saída serviria para acompanhar um filho doente. O hospital confirma a doença, mas o comando não tinha autorizado a viagem.",
    ],
    [
      "innocent",
      "Ocultou-se durante a chamada para evitar uma missão.",
      "A enfermaria registra sua internação antes da chamada, e o mensageiro conserva o recibo de entrega do aviso ao oficial de serviço.",
      "O aviso foi arquivado sem chegar ao encarregado da escala. A ausência foi transformada em intenção sem ouvir a equipe médica.",
    ],
    [
      "coverup",
      "Abandonou um comboio levando o mapa da rota.",
      "O rádio do comando registra a ordem de separar o veículo para socorrer uma família; o mapa foi entregue ao condutor pelo próprio oficial que depois negou a ordem.",
      "A operação atrasou a carga de um dirigente. O comando tentou esconder o desvio imputando fuga ao condutor.",
    ],
  ],
  [
    [
      "responsible",
      "Recebeu pagamento para omitir defeitos no relatório de uma escola.",
      "A primeira vistoria registra o telhado inseguro; a segunda, assinada pelo fiscal após o depósito do empreiteiro, omite os mesmos defeitos sem obra intermediária.",
      "O empreiteiro diz ter pago uma dívida pessoal. A sequência das vistorias e o acordo apreendido vinculam o dinheiro à omissão.",
    ],
    [
      "innocent",
      "Autorizou uma obra em nome de um empreiteiro investigado.",
      "O livro do cartório e o original da licença mostram que o carimbo foi reproduzido; o fiscal estava em outra inspeção, registrada antes da emissão da falsa licença.",
      "O encarregado recebeu uma cópia sem conferir o selo. A obra começou usando a reputação de alguém que a tinha reprovado.",
    ],
    [
      "coverup",
      "Cobrou dos moradores uma taxa irregular de reassentamento.",
      "Os recibos levam a conta da administração regional e uma circular assinada pelo diretor; o fiscal recebeu ordem expressa de recolher o valor sem alterar o destinatário.",
      "O gabinete reteve a circular quando os moradores reclamaram e apresentou o executor da cobrança como seu beneficiário.",
    ],
  ],
  [
    [
      "responsible",
      "Manteve uma impressora clandestina no depósito da biblioteca.",
      "As matrizes guardam correções manuscritas reconhecidas por ele e marcas que coincidem com os exemplares distribuídos, inclusive um defeito do rolo.",
      "Os textos pedem revisão de condenações e não instruem violência. A autoria comprovada não decide sozinha como tratar a publicação.",
    ],
    [
      "innocent",
      "Organizou uma reunião proibida na sala de leitura.",
      "A autorização distrital identifica a mesma data, sala e atividade; a lista de participantes e a ata confirmam um curso de alfabetização autorizado.",
      "O título de um poema foi usado como nome da reunião na denúncia. A autoridade que a autorizou não foi consultada antes da acusação.",
    ],
    [
      "coverup",
      "Apagou nomes do cadastro de empréstimos para proteger leitores.",
      "A ordem da segurança exige retirar os cartões de três dirigentes; o livro de retirada confirma que os agentes levaram os originais antes da revisão do bibliotecário.",
      "Os livros emprestados eram os mesmos usados para acusar leitores comuns. A administração tentou esconder quem mais os consultava.",
    ],
  ],
  [
    [
      "responsible",
      "Falsificou um registro de desembarque para ocultar a passagem de um parente.",
      "A ficha de desembarque conserva sua correção manuscrita e o número do bilhete usado pelo parente, que ele reconhece numa declaração assinada.",
      "A família fugia de uma ameaça local. Ajudá-la exigiu um registro falso que também impediu outras pessoas de localizar o passageiro.",
    ],
    [
      "innocent",
      "Impediu a entrega de um aviso à família de um passageiro.",
      "O livro postal registra o telegrama aceito e pago pelo funcionário; a devolução por endereço incompleto ocorreu no posto seguinte, depois de a mensagem sair da estação.",
      "O funcionário escreveu o endereço fornecido no hospital. A família foi procurá-lo quando o telegrama voltou, sem saber onde a transmissão tinha parado.",
    ],
    [
      "coverup",
      "Registrou como voluntária a transferência de um passageiro desaparecido.",
      "A lista assinada pela escolta determina transferência sob custódia e dispensa ciência do passageiro; a ficha foi reclassificada no gabinete depois de deixar a estação.",
      "A família recebeu uma certidão de viagem livre. A via ferroviária preserva o número da escolta que levou o passageiro.",
    ],
  ],
  [
    [
      "responsible",
      "Retirou cobertores da reserva militar para uma venda particular.",
      "Os selos dos fardos apreendidos e a guia de saída assinada coincidem; o comprador conserva o recibo do valor entregue ao intendente.",
      "Parte do dinheiro pagou a reparação de um alojamento. A unidade ficou sem cobertores para o contingente que chegou depois.",
    ],
    [
      "innocent",
      "Enviou rádios incompletos a uma unidade de fronteira.",
      "O manual de remessa exige enviar baterias em caixas separadas; as guias e os recibos da unidade confirmam o recebimento dos dois volumes completos.",
      "A primeira inspeção abriu apenas a caixa dos rádios. O relatório de falta foi escrito antes de o segundo volume chegar ao depósito interno.",
    ],
    [
      "coverup",
      "Ocultou o consumo de combustível por um veículo fora da escala.",
      "A ordem do gabinete requisita o veículo e fixa a cota de combustível antes da viagem; o livro de portaria confirma a saída com um assessor da direção.",
      "A viagem levou material para uma residência funcional. A cota foi retirada da contabilidade oficial depois de uma reclamação da unidade.",
    ],
  ],
];
