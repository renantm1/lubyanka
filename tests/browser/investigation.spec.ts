import { test, expect } from "@playwright/test";

async function start(page: import("@playwright/test").Page) {
  await page.goto("./");
  await page.getByRole("button", { name: /01 Novo jogo/ }).click();
  await page.getByRole("button", { name: /Entrar no departamento/ }).click();
}
async function quote(page: import("@playwright/test").Page, index: number) {
  await page.locator(".document-copy").evaluate((node, i) => {
    const p = node.querySelectorAll("p")[i];
    const range = document.createRange();
    range.selectNodeContents(p);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    node.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, index);
  await page
    .getByRole("button", { name: "Fixar seleção", exact: true })
    .click();
  await expect(page.getByText("Seleção fixada no quadro.")).toBeVisible();
}
test("seleciona texto livre, compara datas equivalentes e cita as duas fontes", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("button", { name: "Examinar Ordem de investigação" })
    .click();
  await quote(page, 0);
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Livro de ponto/ }).click();
  await quote(page, 1);
  await page.keyboard.press("Escape");
  await page.keyboard.press("q");
  await page
    .locator(".evidence-card")
    .filter({ hasText: "31 de outubro" })
    .click();
  await page
    .locator(".evidence-card")
    .filter({ hasText: "31/10/1983" })
    .click();
  await page
    .getByRole("combobox", { name: "O QUE COMPARAR", exact: true })
    .selectOption("date");
  await page.getByLabel(/FONTE A/).selectOption("31 de outubro");
  await page.getByLabel(/FONTE B/).selectOption("31/10/1983");
  await page
    .getByLabel("O QUE ESSA COMPARAÇÃO SIGNIFICA?")
    .fill("É a mesma noite. Os locais e horários precisam ser confrontados.");
  await page.getByRole("button", { name: "Registrar comparação" }).click();
  await expect(page.getByText(/VALORES COINCIDENTES/)).toBeVisible();
  await expect(page.locator(".linked-evidence")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/comparison.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await expect(page.locator(".evidence-option")).toHaveCount(2);
  await page.getByRole("radio", { name: "A acusação não se sustenta" }).check();
  await page.getByRole("button", { name: /Assinar e enviar/ }).click();
  await expect(
    page.getByRole("button", { name: /Encerrar expediente/ }),
  ).toBeEnabled();
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.keyboard.press("q");
  await expect(page.getByText(/VALORES COINCIDENTES/)).toBeVisible();
});
test("uma contradição libera um anexo que pode ser citado no relatório", async ({
  page,
}) => {
  await start(page);
  await page.keyboard.press("a");
  await expect(
    page.getByRole("button", { name: /Laudo de fita/ }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Examinar Ordem de investigação" })
    .click();
  await page
    .getByRole("button", { name: /Mirov foi visto.*FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Livro de ponto/ }).click();
  await page
    .getByRole("button", { name: /O livro de ponto.*FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("q");
  await page.getByRole("button", { name: /Declaração oficial.*Mirov/ }).click();
  await page
    .getByRole("button", { name: /Registro independente.*O livro de ponto/ })
    .click();
  await page.getByRole("button", { name: "São contraditórios" }).click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: /Laudo de fita/ }).click();
  await expect(
    page.getByRole("heading", { name: "Laudo de fita · laboratório 6" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /A inserção de Alexei Mirov.*FIXAR TRECHO/ })
    .click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Relatório R/ }).click();
  await expect(page.locator(".evidence-option")).toHaveCount(3);
});
test("a ordem de detenção reaparece três dias depois e sobrevive ao reload", async ({
  page,
}) => {
  await start(page);
  for (let day = 1; day <= 3; day++) {
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
    await page.getByRole("button", { name: /Relatório R/ }).click();
    await page.getByRole("radio").first().check();
    await page
      .getByRole("combobox")
      .selectOption(day === 1 ? "detain" : "watch");
    await page.getByRole("button", { name: /Assinar e enviar/ }).click();
    await page.getByRole("button", { name: /Encerrar expediente/ }).click();
    await page.getByRole("button", { name: /Avançar para a manhã/ }).click();
  }
  await expect(
    page.getByRole("heading", { name: "Uma confissão de carbono" }),
  ).toBeVisible();
  await page.keyboard.press("j");
  await page
    .getByRole("button", { name: /Abrir Pedido de Anna Mirova/ })
    .click();
  await expect(page.getByText(/O senhor assinou a ordem/)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /02 Continuar/ }).click();
  await page.keyboard.press("j");
  await expect(
    page.getByText(/Anna Mirova pediu revisão da sua ordem/),
  ).toBeVisible();
});
