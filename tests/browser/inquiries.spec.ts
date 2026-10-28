import { test, expect, type Page } from "@playwright/test";
import { beginShift, createGame } from "../../src/game/engine";
import { serialize } from "../../src/game/save-system";

async function start(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
  await page.getByRole("button", { name: /Iniciar expediente/ }).click();
}
async function pin(page: Page) {
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
}

test("a diligência formal permite chegar ao laudo por outra cadeia e citar a nova fonte", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await start(page);
  await page.keyboard.press("a");
  await expect(
    page.getByRole("button", { name: /Requisitar o livro da distribuição/ }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Examinar Ordem de investigação" })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.screenshot({
    path: "test-results/inquiry-choices.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: /Requisitar o livro da distribuição/ })
    .click();
  await expect(
    page.locator(".inquiry-received").getByRole("status"),
  ).toContainText("subestação");
  await page
    .getByRole("button", { name: /Ler documento da diligência/ })
    .click();
  await expect(page.locator(".document-copy")).toContainText("20h48");
  await pin(page);
  await page.keyboard.press("a");
  await expect(
    page.getByRole("button", { name: /Laudo de fita/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /Livro de ponto/ }).click();
  await pin(page);
  await page.keyboard.press("q");
  await page
    .locator(".evidence-card")
    .filter({ hasText: "Livro de manobras" })
    .click();
  await page
    .locator(".evidence-card")
    .filter({ hasText: "Registro independente" })
    .click();
  await page.getByRole("button", { name: "Se corroboram" }).click();
  await expect(page.locator(".linked-evidence")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Laudo de fita/ }).click();
  await expect(
    page.getByRole("heading", { name: "Laudo de fita · laboratório 6" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("r");
  await expect(page.locator(".evidence-option")).toHaveCount(2);
  for (const checkbox of await page.locator(".evidence-option input").all())
    await checkbox.check();
  await page.getByRole("radio", { name: "A acusação não se sustenta" }).check();
  await page.getByRole("combobox").selectOption("release");
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await expect(
    page.getByRole("button", { name: /Encerrar expediente/ }),
  ).toBeEnabled();
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.keyboard.press("a");
  await expect(
    page.locator(".inquiry-received").getByRole("status"),
  ).toContainText("subestação");
  await expect(
    page.getByRole("button", { name: /Requisitar o livro da distribuição/ }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("a via reservada funciona pelo telefone no celular e conserva a escolha", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await page
    .getByRole("button", { name: "Examinar Correspondência interceptada" })
    .click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Linha interna/ }).click();
  const button = page.getByRole("button", {
    name: /Pedir a Irina o recibo da farmácia/,
  });
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: "test-results/inquiry-mobile.png",
    fullPage: true,
  });
  await button.click();
  await page
    .getByRole("button", { name: /Ler documento da diligência/ })
    .click();
  await expect(page.locator(".document-copy")).toContainText("21h05");
  await pin(page);
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.keyboard.press("a");
  await expect(
    page.locator(".inquiry-received").getByRole("status"),
  ).toContainText("F-31");
  await expect(
    page.getByRole("button", { name: /Pedir a Irina o recibo da farmácia/ }),
  ).toHaveCount(0);
});

test("a sindicância bloqueia só o canal reservado e a fonte formal continua legível", async ({
  page,
}) => {
  const game = { ...beginShift(createGame()), day: 22 };
  game.opened = ["story-22-report", "story-22-letter"];
  game.pressure.auditUntil = 24;
  await page.goto("./");
  await page.getByRole("button", { name: /05 Configurações/ }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "sindicancia.json",
    mimeType: "application/json",
    buffer: Buffer.from(serialize(game)),
  });
  await page.keyboard.press("a");
  await expect(
    page.getByRole("button", { name: /Pedir a Irina a folha guardada/ }),
  ).toBeDisabled();
  await expect(page.locator(".inquiry-panel")).toContainText(
    "canal reservado está suspenso",
  );
  await page
    .getByRole("button", { name: /Requisitar o recibo do setor de transporte/ })
    .click();
  await page
    .getByRole("button", { name: /Ler documento da diligência/ })
    .click();
  await expect(page.locator(".document-copy")).toContainText("onze pacientes");
});
