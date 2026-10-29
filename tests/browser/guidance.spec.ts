import { test, expect, type Page } from "@playwright/test";
import { createGame, beginShift, casesFor } from "../../src/game/engine";
import { serialize } from "../../src/game/save-system";
import type { Game } from "../../src/game/types";
async function start(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
  await page.getByRole("button", { name: /Iniciar expediente/ }).click();
}
async function load(page: Page, g: Game) {
  await page.goto("./");
  await page.getByRole("button", { name: /05 Configurações/ }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "ajuda.json",
    mimeType: "application/json",
    buffer: Buffer.from(serialize(g)),
  });
}
function fixture(day = 1): Game {
  return { ...beginShift(createGame()), day, tutorial: "skipped" };
}
async function pin(page: Page) {
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /FIXAR TRECHO/ })
    .click();
  await page
    .getByRole("button", { name: "Fechar janela", exact: true })
    .click();
}
test("o tutorial ensina o primeiro caso completo por ações reais, sem precisar dos atalhos", async ({
  page,
}) => {
  await start(page);
  const guide = page.getByRole("region", {
    name: "Tutorial do primeiro dia",
    exact: true,
  });
  await expect(guide).toContainText("PASSO 1 DE 6");
  await page.getByRole("button", { name: /Começar pela pasta/ }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Não precisa arrastar nem selecionar palavras",
  );
  await pin(page);
  await expect(guide).toContainText("PASSO 2 DE 6");
  await page
    .getByRole("button", { name: /Consultar o livro de ponto de Tula/ })
    .click();
  await pin(page);
  await expect(guide).toContainText("PASSO 3 DE 6");
  await page.getByRole("button", { name: /Abrir quadro do tutorial/ }).click();
  await page
    .getByRole("button", { name: "Selecionar fontes do tutorial", exact: true })
    .click();
  await expect(
    page.getByText("2/2 trechos selecionados", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "São contraditórios", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Documento liberado: Laudo de fita",
  );
  await expect(
    page.getByRole("button", { name: /Continuar tutorial no relatório/ }),
  ).toBeInViewport();
  await page.screenshot({
    path: "test-results/tutorial-board.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: /Continuar tutorial no relatório/ })
    .click();
  await expect(page.getByRole("dialog")).toBeFocused();
  await expect
    .poll(() => page.getByRole("dialog").evaluate((el) => el.scrollTop))
    .toBe(0);
  await expect(
    page.getByRole("radio", {
      name: "A acusação não se sustenta",
      exact: true,
    }),
  ).toBeInViewport();
  await expect(page.locator(".evidence-option input:checked")).toHaveCount(2);
  await page
    .getByRole("radio", { name: "A acusação não se sustenta", exact: true })
    .check();
  await page.getByRole("combobox").selectOption("release");
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await expect(guide).toContainText("PASSO 5 DE 6");
  await page
    .getByRole("button", { name: /Fechar primeiro expediente/ })
    .click();
  await expect(
    page.getByText("Tutorial · passo 6 de 6", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Avançar para a manhã seguinte/ })
    .click();
  await expect(page.getByText("DIA 02 DE 30", { exact: true })).toBeVisible();
  await expect(guide).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("lubyanka-save-v1")!).game.tutorial,
    ),
  ).toBe("completed");
});
test("pular e retomar o tutorial preserva o progresso após recarregar", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("button", { name: "Pular tutorial", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await expect(page.locator(".tutorial-guide")).toHaveCount(0);
  await page.keyboard.press("h");
  await page
    .getByRole("button", { name: /Retomar tutorial do primeiro dia/ })
    .click();
  await page.getByRole("button", { name: /Começar pela pasta/ }).click();
  await pin(page);
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await expect(page.locator(".tutorial-guide")).toContainText("PASSO 2 DE 6");
});
test("assuntos diferentes explicam o bloqueio e um terceiro clique não troca os cartões em silêncio", async ({
  page,
}) => {
  const g = fixture();
  g.board = ["story-1-claim", "story-1-context", "story-1-proof"];
  await load(page, g);
  await page.keyboard.press("q");
  const claim = page
      .locator(".evidence-card")
      .filter({ hasText: "Declaração oficial" }),
    context = page
      .locator(".evidence-card")
      .filter({ hasText: "Depoimento reservado" }),
    proof = page
      .locator(".evidence-card")
      .filter({ hasText: "Registro independente" });
  await claim.click();
  await context.click();
  await expect(page.locator(".board-selection")).toContainText(
    "assuntos diferentes",
  );
  await expect(
    page.getByRole("button", { name: "São contraditórios", exact: true }),
  ).toBeDisabled();
  await proof.click();
  await expect(page.getByRole("status")).toContainText(
    "Já há duas fontes selecionadas",
  );
  await expect(claim).toHaveAttribute("aria-pressed", "true");
  await expect(proof).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("button", { name: "Limpar seleção", exact: true })
    .click();
  await claim.click();
  await proof.click();
  await expect(
    page.getByRole("button", { name: "São contraditórios", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", {
      name: "Retirar do quadro: Registro independente",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("1/2 trechos selecionados", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "São contraditórios", exact: true }),
  ).toBeDisabled();
});
test("o quadro mostra o processo ativo e o atalho R prepara as provas desse processo", async ({
  page,
}) => {
  const g = fixture(),
    other = casesFor(g)[1];
  g.board = [
    "story-1-claim",
    "story-1-proof",
    `${other.id}-claim`,
    `${other.id}-proof`,
  ];
  await load(page, g);
  await page.keyboard.press("q");
  await expect(page.locator(".evidence-card")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /COMPLEMENTAR/ }).click();
  await page.keyboard.press("q");
  await expect(page.locator(".evidence-card")).toHaveCount(2);
  await expect(page.locator(".evidence-board")).not.toContainText("Mirov");
  await page.keyboard.press("Escape");
  await page.keyboard.press("r");
  await expect(page.locator(".evidence-option input:checked")).toHaveCount(2);
  await expect(page.locator(".report-form")).toContainText("PROTOCOLO PROC-1");
  await expect(page.locator(".report-form")).not.toContainText("Mirov");
});
test("a ajuda e o comparador recolhido continuam acessíveis pelo teclado no celular", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await page
    .getByRole("button", { name: "Pular tutorial", exact: true })
    .click();
  await page.locator(".help-shortcut").click();
  await expect(
    page.getByRole("heading", { name: "Leia. Compare. Decida.", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("q");
  const modal = page.getByRole("dialog", {
    name: "QUADRO DE EVIDÊNCIAS",
    exact: true,
  });
  await expect(
    page.locator(".comparison-workbench details"),
  ).not.toHaveAttribute("open");
  await modal.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(":focus")).toHaveText(
    "Comparar detalhes (opcional)",
  );
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("combobox", { name: "O QUE COMPARAR", exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    expect(
      await modal.evaluate((node) => node.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.screenshot({
    path: "test-results/board-help-mobile.png",
    fullPage: true,
  });
});
test("as dicas revelam documentos e relação em etapas, sem enviar a decisão", async ({
  page,
}) => {
  const g = fixture();
  g.board = ["story-1-claim", "story-1-proof"];
  await load(page, g);
  await page.keyboard.press("q");
  await page
    .getByRole("button", { name: "Pedir uma dica", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Mostrar quais documentos comparar",
      exact: true,
    })
    .click();
  await expect(page.locator(".board-hints")).toContainText(
    "Livro de ponto · oficina de Tula",
  );
  await page
    .getByRole("button", {
      name: "Selecionar os trechos sugeridos",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Mostrar como ligar os trechos", exact: true })
    .click();
  await expect(page.locator(".explicit-hint")).toContainText(
    "São contraditórios",
  );
  await expect(page.locator(".linked-evidence")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("lubyanka-save-v1")!).game.decisions
          .length,
    ),
  ).toBe(0);
});
test("um cruzamento antigo de Volkov continua abrindo o anexo após a correção", async ({
  page,
}) => {
  const g = fixture(22);
  g.board = ["story-22-claim", "story-22-proof"];
  g.links = [{ a: "story-22-claim", b: "story-22-proof", relation: "support" }];
  await load(page, g);
  await page.keyboard.press("q");
  await expect(page.locator(".linked-evidence")).toContainText("CONTRADIÇÃO");
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await expect(
    page.getByRole("button", { name: /Terceira página do anexo/ }),
  ).toBeEnabled();
});
