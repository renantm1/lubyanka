export default function HelpGuide({ onTutorial }: { onTutorial?: () => void }) {
  return (
    <div className="modal-content help-guide">
      <span className="eyebrow">MANUAL DO OFICIAL · LEITURA RÁPIDA</span>
      <h2>Leia. Compare. Decida.</h2>
      {onTutorial && (
        <button className="red-button" onClick={onTutorial}>
          Retomar tutorial do primeiro dia →
        </button>
      )}
      <p>
        Seu objetivo é avaliar a acusação do processo e recomendar uma medida.
        Ler tudo ou ligar cartões não resolve o caso automaticamente.
      </p>
      <ol>
        <li>
          <b>Abra a pasta.</b> Leia a acusação. No fim do papel, clique em{" "}
          <strong>Fixar trecho</strong> para levá-la ao quadro.
        </li>
        <li>
          <b>Confira o arquivo.</b> Leia o registro independente e fixe seu
          trecho. No primeiro caso, procure o livro de ponto de Tula.
        </li>
        <li>
          <b>Se quiser aprofundar, abra o quadro.</b> Clique em dois cartões:
          fonte A e fonte B. <strong>São contraditórios</strong> indica versões
          incompatíveis sobre o mesmo fato. <strong>Se corroboram</strong>{" "}
          indica fontes que concordam. Use <strong>Pedir uma dica</strong> se
          não souber quais escolher.
        </li>
        <li>
          <b>Seleções livres usam Comparar detalhes.</b> Datas ou horários
          iguais/diferentes ajudam sua interpretação. Esse confronto não cria
          uma ligação guiada nem libera anexos automaticamente.
        </li>
        <li>
          <b>Redija o relatório.</b> Escolha a conclusão, marque provas de
          documentos diferentes e indique a recomendação. Quando houver várias
          pessoas, confira o nome escolhido. O número mínimo de fontes aparece
          no formulário.
        </li>
        <li>
          <b>Assine e encerre.</b> Só o relatório do processo prioritário
          permite avançar. O complementar é opcional. Leia a correspondência nas
          manhãs seguintes.
        </li>
      </ol>
      <p className="help-note">
        O quadro é uma ferramenta para investigar. Você pode enviar o relatório
        sem fazer ligações, desde que tenha fixado e citado as fontes exigidas.
        Suas recomendações continuam tendo consequências.
      </p>
      <p>
        Atalhos: <b>A</b> arquivo · <b>Q</b> quadro · <b>R</b> relatório ·{" "}
        <b>J</b> correspondência · <b>H</b> ajuda · <b>ESC</b> fechar.
      </p>
    </div>
  );
}
