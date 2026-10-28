import { test, expect, type Page } from "@playwright/test";
import { beginShift, createGame } from "../../src/game/engine";
import { serialize } from "../../src/game/save-system";
import type { Game } from "../../src/game/types";
async function load(page: Page, raw: string) {
  await page.goto("./");
  await page.getByRole("button", { name: /05 Configurações/ }).click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "nominal.json",
      mimeType: "application/json",
      buffer: Buffer.from(raw),
    });
}
const at = (day: number): Game => ({ ...beginShift(createGame()), day });
async function pin(page: Page) {
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
}
async function fileReport(page: Page, person: string) {
  await page.keyboard.press("a");
  await page
    .getByRole("button", { name: `Examinar fonte de ${person} →`, exact: true })
    .click();
  await pin(page);
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Registro de verificação/ }).click();
  await pin(page);
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await page
    .getByRole("radio", { name: "Há encobrimento institucional", exact: true })
    .check();
  await page.getByRole("combobox").selectOption("detain");
  await page.getByRole("radio", { name: new RegExp(person) }).check();
}
test("a recomendação e a ficha de custódia usam o diretor escolhido, sem substituir o acusado inicial", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await load(page, serialize(at(2)));
  await fileReport(page, "Leonid Baranov");
  await expect(
    page.getByRole("radio", { name: /Leonid Baranov/ }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: /Boris Zaitsev/ }),
  ).not.toBeChecked();
  await page.screenshot({
    path: "test-results/nominal-report.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await page.getByRole("button", { name: /Encerrar expediente/ }).click();
  await expect(
    page.getByText(/Leonid Baranov recebeu uma ordem/),
  ).toBeVisible();
  await page.getByRole("button", { name: /Avançar para a manhã/ }).click();
  await page
    .getByRole("button", { name: "Examinar Ordem de investigação" })
    .click();
  await pin(page);
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Registro de verificação/ }).click();
  await pin(page);
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await page
    .getByRole("radio", { name: "Há responsabilidade comprovada", exact: true })
    .check();
  await page.getByRole("combobox").selectOption("watch");
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await page.getByRole("button", { name: /Encerrar expediente/ }).click();
  await page.getByRole("button", { name: /Avançar para a manhã/ }).click();
  await page.keyboard.press("j");
  await page
    .getByRole("button", { name: /Abrir Revisão do encaminhamento · Leonid/ })
    .click();
  await expect(page.locator(".document-copy")).toContainText(
    "ficha de custódia pertence a Leonid Baranov",
  );
  await expect(page.locator(".document-copy")).toContainText(
    "não foi lançado em nome de Boris Zaitsev",
  );
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.keyboard.press("j");
  await expect(
    page.getByRole("button", {
      name: /Abrir Revisão do encaminhamento · Leonid/,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("o jogador pode encaminhar a pessoa errada e a decisão nominal persiste", async ({
  page,
}) => {
  await load(page, serialize(at(2)));
  await fileReport(page, "Svetlana Danilina");
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await expect(
    page.getByText("Encaminhamento nominal: Svetlana Danilina."),
  ).toBeVisible();
  await expect(
    page.getByText(/Svetlana Danilina recebeu uma ordem de custódia/),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await expect(
    page.getByText("Encaminhamento nominal: Svetlana Danilina."),
  ).toBeVisible();
});

test("as fontes das pessoas cabem no celular e medidas documentais dispensam a escolha nominal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await load(page, serialize(at(5)));
  await page.getByRole("button", { name: /Arquivo central/ }).click();
  const source = page.getByRole("button", {
    name: "Examinar fonte de Pavel Serebrov →",
    exact: true,
  });
  await source.scrollIntoViewIfNeeded();
  const box = await source.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: "test-results/people-mobile.png",
    fullPage: true,
  });
  await source.click();
  await pin(page);
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Registro de verificação/ }).click();
  await pin(page);
  await page
    .getByRole("button", { name: /Relatório/ })
    .last()
    .click();
  await page
    .getByRole("radio", { name: "Há encobrimento institucional", exact: true })
    .check();
  await page.getByRole("combobox").selectOption("preserve");
  await expect(page.locator(".target-choice")).toHaveCount(0);
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await page
    .getByRole("button", { name: /Relatório/ })
    .last()
    .click();
  await expect(
    page.getByText("Encaminhamento nominal:", { exact: false }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Preservar cópia reservada", { exact: true }),
  ).toBeVisible();
});

test("um save 0.5 continua com o relatório e as fontes originais", async ({
  page,
}) => {
  const legacy = JSON.parse(serialize(at(2)));
  delete legacy.game.investigationVersion;
  await load(page, JSON.stringify(legacy));
  await page.keyboard.press("a");
  await expect(
    page.getByRole("region", { name: "Pessoas envolvidas neste processo" }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await expect(page.locator(".target-choice")).toHaveCount(0);
});
