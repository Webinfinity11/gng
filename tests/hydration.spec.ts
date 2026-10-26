import { expect, test, type Page } from "@playwright/test";

// Simulate an extension changing parsed DOM before React hydrates it.
async function injectAttribute(page: Page, selector: string, attribute: string) {
  await page.addInitScript(({ selector, attribute }) => {
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, "true");
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }, { selector, attribute });
}

test("extension attributes on body do not warn or break hydration", async ({ page }) => {
  const warnings: string[] = [];
  page.on("console", message => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) warnings.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await injectAttribute(page, "body", "cz-shortcut-listen");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("body")).toHaveAttribute("cz-shortcut-listen", "true");
  await page.getByRole("button", { name: "გახსენი მენიუ", exact: true }).click();
  await expect(page.getByRole("button", { name: "დახურე მენიუ", exact: true })).toHaveAttribute("aria-expanded", "true");
  expect(warnings).toEqual([]);
});

test("body tolerance still reports descendant hydration mismatches in development", async ({ page }) => {
  const warnings: string[] = [];
  page.on("console", message => {
    if (message.type() === "error") warnings.push(message.text());
  });
  await injectAttribute(page, "#hero-title", "data-hydration-probe");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#hero-title")).toHaveAttribute("data-hydration-probe", "true");
  await expect.poll(() => warnings.some(message => /hydrat/i.test(message) && message.includes("data-hydration-probe"))).toBe(true);
});
