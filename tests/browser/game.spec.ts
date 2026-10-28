import { test, expect } from "@playwright/test";
import { beats } from "../../src/content/campaign";
test("investiga Mirov, compara provas, envia relatório e recupera consequências", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await expect(page.getByRole("heading", { name: /LUBYANKA/ })).toBeVisible();
  await page.screenshot({ path: "test-results/menu.png", fullPage: true });
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
  await page.getByRole("button", { name: /Iniciar expediente/ }).click();
  await expect(page.getByText("DIA 01 DE 30")).toBeVisible();
  await page.screenshot({ path: "test-results/desk.png", fullPage: true });
  await page
    .getByRole("button", { name: "Examinar Ordem de investigação" })
    .click();
  await page
    .getByRole("button", { name: /Mirov foi visto.*FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /CONSULTA DE REGISTROS/ }).click();
  await page.getByRole("textbox", { name: "BUSCA" }).fill("Mirov");
  await page.getByRole("button", { name: /Livro de ponto/ }).click();
  await page
    .getByRole("button", { name: /O livro de ponto.*FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Quadro de evidências/ }).click();
  await page.getByRole("button", { name: /Declaração oficial.*Mirov/ }).click();
  await page
    .getByRole("button", { name: /Registro independente.*O livro de ponto/ })
    .click();
  await page.getByRole("button", { name: "São contraditórios" }).click();
  await expect(page.getByText(/Contradição documentada/)).toBeVisible();
  await page.screenshot({ path: "test-results/board.png", fullPage: true });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await page.getByRole("radio", { name: "A acusação não se sustenta" }).check();
  await page.getByRole("combobox").selectOption("release");
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await page.getByRole("button", { name: /Encerrar expediente/ }).click();
  await expect(page.getByText(/Mirov pôde voltar para casa/)).toBeVisible();
  await page.getByRole("button", { name: /Avançar para a manhã/ }).click();
  await expect(page.getByText("DIA 02 DE 30")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await expect(page.getByText("DIA 02 DE 30")).toBeVisible();
  expect(errors).toEqual([]);
});
test("envelope, fotografia, configurações e navegação por teclado funcionam", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
  await page.getByRole("button", { name: /Iniciar expediente/ }).click();
  await page
    .getByRole("button", { name: "Examinar Correspondência interceptada" })
    .click();
  await expect(page.getByText("Seu filho, Alexei.")).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Examinar Plataforma 4 · Kievsky" })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("img", { name: /Ilustração de plataforma/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("t");
  await expect(
    page.getByRole("dialog", { name: "TERMINAL DE CONSULTA" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Configurações", exact: true })
    .click();
  await page.getByRole("checkbox", { name: /Reduzir movimento/ }).check();
  await page.getByRole("checkbox", { name: /Som ambiente/ }).check();
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: /05 Configurações/ }).click();
  await expect(
    page.getByRole("checkbox", { name: /Reduzir movimento/ }),
  ).toBeChecked();
});
test("percorre os 30 dias na interface e desbloqueia o Arquivo Infinito", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
  await page.getByRole("button", { name: /Iniciar expediente/ }).click();
  const conclusions = {
    innocent: "A acusação não se sustenta",
    responsible: "Há responsabilidade comprovada",
    coverup: "Há encobrimento institucional",
  };
  for (let day = 1; day <= 30; day++) {
    if ([8, 16, 24].includes(day))
      await page.getByRole("button", { name: /Iniciar expediente/ }).click();
    await expect(
      page.getByText(`DIA ${String(day).padStart(2, "0")} DE 30`),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Examinar Ordem de investigação" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /FIXAR TRECHO/ })
      .click();
    await page.keyboard.press("Escape");
    await page.keyboard.press("a");
    await page
      .getByRole("button", {
        name: day === 1 ? /Livro de ponto/ : /Registro de verificação/,
      })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /FIXAR TRECHO/ })
      .click();
    await page.keyboard.press("Escape");
    if (day >= 16) {
      await page
        .getByRole("button", { name: "Examinar Depoimento reservado" })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: /FIXAR TRECHO/ })
        .click();
      await page.keyboard.press("Escape");
    }
    await page.getByRole("button", { name: /Relatório R/ }).click();
    await page
      .getByRole("radio", { name: conclusions[beats[day - 1].truth] })
      .check();
    await page.getByRole("combobox").selectOption("watch");
    await page.getByRole("button", { name: /Assinar e enviar/ }).click();
    await page.getByRole("button", { name: /Encerrar expediente/ }).click();
    await page
      .getByRole("button", {
        name: day === 30 ? "O último relatório →" : /Avançar para a manhã/,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Herói da União Soviética" }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/ending.png", fullPage: true });
  await page.getByRole("button", { name: /Iniciar Arquivo Infinito/ }).click();
  await expect(
    page.getByText("ARQUIVO INFINITO", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("a posição dos documentos sobrevive ao recarregamento", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
  await page.getByRole("button", { name: /Iniciar expediente/ }).click();
  const handle = page.locator(".object-0 .drag-handle");
  const before = await handle.boundingBox();
  if (!before) throw new Error("Documento ausente");
  const x = before.x + before.width / 2,
    y = before.y + before.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 60, y + 30, { steps: 10 });
  await page.mouse.up();
  await expect
    .poll(async () => {
      const box = await handle.boundingBox();
      return box!.x - before.x;
    })
    .toBeGreaterThan(35);
  const moved = await handle.boundingBox();
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await expect
    .poll(async () => Math.abs((await handle.boundingBox())!.x - moved!.x))
    .toBeLessThan(3);
});
test("menu e documentos permanecem legíveis em tela pequena", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
  await page.getByRole("button", { name: /Iniciar expediente/ }).click();
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Livro de ponto/ }).click();
  await expect(
    page.getByRole("heading", { name: "Livro de ponto · oficina de Tula" }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
