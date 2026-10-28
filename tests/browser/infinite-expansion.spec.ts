import { test, expect, type Page } from "@playwright/test";
import { createGame, beginShift } from "../../src/game/engine";
import { generateCase } from "../../src/game/case-generator";
import { updateInstitution } from "../../src/game/institution";
import { serialize } from "../../src/game/save-system";
import type { Game } from "../../src/game/types";

async function load(page: Page, raw: string) {
  await page.goto("./");
  await page.getByRole("button", { name: /05 Configurações/ }).click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "arquivo.json",
      mimeType: "application/json",
      buffer: Buffer.from(raw),
    });
}
async function pin(page: Page) {
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
}
test("investiga uma situação nova do estágio final e avança no Arquivo Infinito", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let day = 25;
  while (generateCase("TULA", day, 2).variant! < 3) day++;
  const g: Game = { ...beginShift(createGame("TULA", "infinite")), day },
    c = generateCase(g.seed, day, 2);
  await load(page, serialize(g));
  await expect(
    page.getByText(`EXPEDIENTE ${day} / SEÇÃO DISTRITAL`),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Examinar Ordem de investigação" })
    .click();
  await expect(page.locator(".document-copy")).toContainText(
    c.documents.find((d) => d.id === `${c.id}-report`)!.clues[0].text,
  );
  await pin(page);
  await page
    .getByRole("button", { name: "Examinar Depoimento reservado" })
    .click();
  await pin(page);
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Registro de verificação/ }).click();
  await pin(page);
  await page.keyboard.press("a");
  await page
    .getByRole("button", { name: /Transcrição da segunda entrevista/ })
    .click();
  await pin(page);
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await expect(page.locator(".evidence-option")).toHaveCount(4);
  await page
    .getByRole("radio", {
      name: {
        innocent: "A acusação não se sustenta",
        responsible: "Há responsabilidade comprovada",
        coverup: "Há encobrimento institucional",
      }[c.truth],
    })
    .check();
  await page.getByRole("combobox").selectOption("watch");
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await page.getByRole("button", { name: /Encerrar expediente/ }).click();
  await page.getByRole("button", { name: /Avançar para a manhã/ }).click();
  await expect(
    page.getByText(`EXPEDIENTE ${day + 1} / SEÇÃO DISTRITAL`),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("a ordem renovada tem resposta própria e não reabre uma ordem vencida", async ({
  page,
}) => {
  let g: Game = { ...beginShift(createGame("TULA", "infinite")), day: 2 };
  g.stats.trust = 20;
  g.flags.preserved = 2;
  g = updateInstitution(g);
  g = updateInstitution({ ...g, day: 14 });
  await load(page, serialize(g));
  await page.keyboard.press("j");
  const old = page
      .locator(".dispatch")
      .filter({ hasText: "A chefia abriu uma sindicância" }),
    current = page
      .locator(".dispatch")
      .filter({ hasText: "A revisão distrital encontrou" });
  await expect(old).toContainText("Prazo encerrado no expediente 5");
  await expect(
    old.getByRole("button", { name: /Apresentar as cópias/ }),
  ).toHaveCount(0);
  await expect(current).toContainText("Resposta até o expediente 17");
  await page.screenshot({
    path: "test-results/infinite-notices.png",
    fullPage: true,
  });
  await current
    .getByRole("button", { name: /Apresentar as cópias de custódia/ })
    .click();
  await expect(current.getByRole("status")).toContainText(
    "A sindicância recebe cópias",
  );
  await page.keyboard.press("Escape");
  await page.keyboard.press("r");
  await expect(page.locator("select option[value=recruit]")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.keyboard.press("j");
  await expect(
    page
      .locator(".dispatch")
      .filter({ hasText: "A revisão distrital encontrou" })
      .getByRole("status"),
  ).toContainText("A sindicância recebe cópias");
  await expect(
    page.getByRole("button", { name: /Apresentar as cópias de custódia/ }),
  ).toHaveCount(0);
});

test("importa uma partida 0.4 sem trocar o processo complementar já aberto", async ({
  page,
}) => {
  const g: Game = { ...beginShift(createGame("TULA")), day: 17 },
    legacy = generateCase(g.seed, g.day, 1);
  const raw = JSON.parse(serialize(g));
  delete raw.game.rulesVersion;
  await load(page, JSON.stringify(raw));
  await page.getByRole("button", { name: /COMPLEMENTAR/ }).click();
  await page
    .getByRole("button", { name: "Examinar Ordem de investigação" })
    .click();
  await expect(page.locator(".document-copy")).toContainText(
    `Assunto: ${legacy.subject}. ${legacy.documents.find((d) => d.id === `${legacy.id}-report`)!.clues[0].text}`,
  );
  await pin(page);
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.getByRole("button", { name: /COMPLEMENTAR/ }).click();
  await page.keyboard.press("q");
  await expect(page.locator(".evidence-card")).toContainText(
    legacy.documents.find((d) => d.id === `${legacy.id}-report`)!.clues[0].text,
  );
});
