import { test, expect, type Page } from "@playwright/test";
import { createGame } from "../../src/game/engine";
import { serialize } from "../../src/game/save-system";
import { updateInstitution } from "../../src/game/institution";
import type { Game } from "../../src/game/types";
async function load(page: Page, g: Game) {
  await page.goto("./");
  await page.getByRole("button", { name: /05 Configurações/ }).click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "campanha.json",
      mimeType: "application/json",
      buffer: Buffer.from(serialize(g)),
    });
  await expect(
    page.getByText(`DIA ${String(g.day).padStart(2, "0")} DE 30`),
  ).toBeVisible();
}
function at(day: number): Game {
  return { ...createGame(), day, chapterIntro: null };
}
test("a abertura pode ser lida, pulada e não reaparece após carregar", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Abertura do capítulo 1" }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/chapter.png", fullPage: true });
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Abertura do capítulo 1" }),
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await expect(
    page.getByRole("button", { name: "Examinar Ordem de investigação" }),
  ).toBeVisible();
});
test("cruza duas etapas no capítulo final e consulta um parecer especial", async ({
  page,
}) => {
  const g = at(22);
  g.stats.prestige = 70;
  await load(page, g);
  await page
    .getByRole("button", { name: "Examinar Ordem de investigação" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await expect(
    page.getByRole("button", { name: /Parecer reservado/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /Registro de verificação/ }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("q");
  await page
    .locator(".evidence-card")
    .filter({ hasText: "Declaração oficial" })
    .click();
  await page
    .locator(".evidence-card")
    .filter({ hasText: "Registro independente" })
    .click();
  await page.getByRole("button", { name: "São contraditórios" }).click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Terceira página do anexo/ }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Livro de custódia · V-22/ }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("q");
  await page
    .locator(".evidence-card")
    .filter({ hasText: "Terceira página do anexo" })
    .click();
  await page
    .locator(".evidence-card")
    .filter({ hasText: "Livro de custódia V-22" })
    .click();
  await page.getByRole("button", { name: "Se corroboram" }).click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Parecer reservado · V-22/ }).click();
  await expect(
    page
      .locator(".document-copy")
      .getByText(/Volkov pode testemunhar contra outros gabinetes/),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/reserved.png", fullPage: true });
});
test("responde à sindicância, recupera recrutamento e conserva a resposta no save", async ({
  page,
}) => {
  let g = at(18);
  g.stats.trust = 20;
  g.flags.preserved = 2;
  g = updateInstitution(g);
  await load(page, g);
  await page.keyboard.press("r");
  await expect(page.locator("select option[value=recruit]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.keyboard.press("j");
  await page
    .getByRole("button", { name: /Apresentar as cópias de custódia/ })
    .click();
  await expect(page.getByText(/A sindicância recebe cópias/)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("r");
  await expect(page.locator("select option[value=recruit]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.keyboard.press("j");
  await expect(page.getByText(/A sindicância recebe cópias/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Apresentar as cópias de custódia/ }),
  ).toHaveCount(0);
});
test("a conversa editorial cria uma cópia sem endereços e não pode ser repetida", async ({
  page,
}) => {
  await load(page, at(28));
  await page.getByRole("button", { name: /CONTATAR O DEPARTAMENTO/ }).click();
  await page
    .getByRole("button", {
      name: /Publicar os nomes, retirar endereços familiares/,
    })
    .click();
  await expect(
    page.locator(".meeting-panel").getByRole("status"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Prova P-28 sem endereços/ }).click();
  await expect(
    page
      .locator(".document-copy")
      .getByText(/A coluna de endereços foi retirada e preservada/),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.getByRole("button", { name: /CONTATAR O DEPARTAMENTO/ }).click();
  await expect(
    page.locator(".meeting-panel").getByRole("status"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Fazer circular a prova integral/ }),
  ).toHaveCount(0);
});
