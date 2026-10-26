import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3001";
const adminEmail = process.env.GNG_TEST_ADMIN_EMAIL;
const adminPassword = process.env.GNG_TEST_ADMIN_PASSWORD;

test.use({ baseURL, actionTimeout: 20_000 });
test.describe.configure({ mode: "serial" });

async function expectSavedProject(page: Page, button: string) {
  await page.getByRole("button", { name: button, exact: true }).click();
  await expect(page).toHaveURL(`${baseURL}/admin/projects?success=saved`);
  await expect(page.locator(".a-main").getByRole("status")).toContainText("პროექტი წარმატებით შეინახა.");
}

test("administrators manage persisted content while visitors cannot access drafts or admin actions", async ({ page, browser }) => {
  test.skip(!adminEmail || !adminPassword, "Requires the isolated database server and GNG_TEST_ADMIN_EMAIL / GNG_TEST_ADMIN_PASSWORD.");
  test.setTimeout(240_000);

  const unique = `${Date.now()}`;
  const title = `სატესტო პროექტი ${unique}`;
  const slug = `integration-project-${unique}`;
  const visitorContext = await browser.newContext({ baseURL });
  const visitor = await visitorContext.newPage();
  let projectEditPath = "";
  let originalContact: Record<string, string> | undefined;

  try {
    await test.step("anonymous access is rejected", async () => {
      await page.goto("/admin/projects");
      await expect(page).toHaveURL(`${baseURL}/admin/login`);
      await expect(page.getByLabel("პაროლი", { exact: true })).toBeVisible();
      const upload = await visitorContext.request.post("/api/upload", { headers: { origin: baseURL } });
      expect(upload.status()).toBe(401);
      await expect(page.getByRole("navigation", { name: "ადმინისტრაცია" })).toHaveCount(0);
    });

    await test.step("the bootstrapped administrator can sign in and see seeded projects", async () => {
      await page.getByLabel("ელფოსტა", { exact: true }).fill(adminEmail!);
      await page.getByLabel("პაროლი", { exact: true }).fill(adminPassword!);
      await page.getByRole("button", { name: "შესვლა", exact: true }).click();
      await expect(page).toHaveURL(`${baseURL}/admin`);
      await expect(page.getByRole("heading", { name: "მიმოხილვა", exact: true })).toBeVisible();
      await expect(page.locator(".a-stat").filter({ hasText: "ფოტოს გარეშე" }).locator("strong")).toHaveText("21");
      await expect(page.locator(".a-stat").filter({ hasText: "გამოქვეყნებული" }).locator("strong")).toHaveText("4");
      await page.screenshot({ path: ".artifacts/admin-dashboard.png", fullPage: true });
    });

    await test.step("an authorized upload reports that R2 is not configured", async () => {
      await page.goto("/admin/projects/new");
      const responsePromise = page.waitForResponse((response) => response.url().endsWith("/api/upload") && response.request().method() === "POST");
      await page.locator(".a-image-field input[type=\"file\"]").setInputFiles({
        name: "upload-check.png",
        mimeType: "image/png",
        buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=", "base64"),
      });
      expect((await responsePromise).status()).toBe(503);
      await expect(page.locator(".a-image-field").getByRole("alert")).toContainText("Cloudflare R2");
      await expect(page.getByRole("button", { name: "პროექტის დამატება", exact: true })).toBeEnabled();
    });

    await test.step("a new project is published to the site and home carousel on save", async () => {
      await page.goto("/admin/projects/new");
      await expect(page.getByLabel("სტატუსი", { exact: true })).toHaveCount(0);
      await page.getByLabel("პროექტის სათაური", { exact: true }).fill(title);
      // The page address is derived from the English title.
      await page.getByLabel("სათაური ინგლისურად", { exact: true }).fill(`Integration project ${unique}`);
      await page.getByLabel("მთავარი ფოტო", { exact: true }).fill("/images/hero.jpg");
      await page.locator(".a-url-add input").fill("/images/workshop.jpg");
      await page.getByRole("button", { name: "ფოტოს ბმულის დამატება", exact: true }).click();
      await expect(page.getByRole("img", { name: "გალერეის ფოტო 1", exact: true })).toBeVisible();
      await page.screenshot({ path: ".artifacts/admin-project-form.png", fullPage: true });
      await expectSavedProject(page, "პროექტის დამატება");
      projectEditPath = (await page.getByRole("link", { name: title, exact: true }).getAttribute("href"))!;
      expect(projectEditPath).toMatch(/^\/admin\/projects\/[a-f0-9-]{36}$/);
      const publishedResponse = await visitor.goto(`/projects/${slug}`);
      expect(publishedResponse?.status()).toBe(200);
      await expect(visitor.getByRole("heading", { name: title, exact: true })).toBeVisible();
      await expect(visitor.getByRole("img", { name: `${title} - ფოტო 1`, exact: true })).toHaveAttribute("src", "/images/hero.jpg");
      await expect(visitor.getByRole("img", { name: `${title} - ფოტო 2`, exact: true })).toHaveAttribute("src", "/images/workshop.jpg");
      await visitor.goto("/projects");
      await expect(visitor.locator(".gng-projects-grid .portfolio-collection-text").filter({ hasText: title })).toBeVisible();
      await visitor.goto("/");
      await expect(visitor.locator(".gng-portfolio-track > :not(.is-clone) .portfolio-collection-text").filter({ hasText: title })).toBeVisible();
    });

    await test.step("a project needs a cover photo", async () => {
      await page.goto(projectEditPath);
      await expect(page.getByRole("img", { name: "გალერეის ფოტო 1", exact: true })).toHaveAttribute("src", "/images/workshop.jpg");
      await page.getByRole("button", { name: "მთავარი ფოტო: წაშლა", exact: true }).click();
      await page.getByRole("button", { name: "პროექტის შენახვა", exact: true }).click();
      await expect(page.locator(".a-main").getByRole("alert")).toContainText("აირჩიეთ მთავარი ფოტო.");
      await page.goto("/admin/projects");
    });

    await test.step("deletion requires confirmation and removes the persisted project", async () => {
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: `${title}: წაშლა`, exact: true }).click();
      await expect(page.getByRole("link", { name: title, exact: true })).toHaveCount(0);
      await page.reload();
      await expect(page.getByRole("link", { name: title, exact: true })).toHaveCount(0);
      projectEditPath = "";
    });

    await test.step("contact settings persist and are shown on the public contact page", async () => {
      await page.goto("/admin/contact");
      originalContact = {};
      for (const label of ["ტელეფონი 1", "ელფოსტა", "მისამართი"]) {
        originalContact[label] = await page.getByLabel(label, { exact: true }).inputValue();
      }
      await page.getByLabel("ტელეფონი 1", { exact: true }).fill("+995 555 01 02 03");
      await page.getByRole("button", { name: "ნომრის დამატება", exact: true }).click();
      await page.getByLabel("ტელეფონი 2", { exact: true }).fill("+995 322 11 22 33");
      await page.screenshot({ path: ".artifacts/admin-contact-form.png", fullPage: true });
      await page.getByLabel("ელფოსტა", { exact: true }).fill("integration-contact@example.com");
      await page.getByLabel("მისამართი", { exact: true }).fill("თბილისი — ინტეგრაციის სატესტო მისამართი");
      await page.getByRole("button", { name: "ცვლილებების შენახვა", exact: true }).click();
      await expect(page.locator(".a-main").getByRole("status")).toContainText("საკონტაქტო მონაცემები განახლდა.");
      await page.reload();
      await expect(page.getByLabel("ტელეფონი 1", { exact: true })).toHaveValue("+995 555 01 02 03");
      await expect(page.getByLabel("ტელეფონი 2", { exact: true })).toHaveValue("+995 322 11 22 33");
      await visitor.goto("/contact");
      await expect(visitor.locator("main").getByRole("link", { name: "+995 555 01 02 03", exact: true })).toHaveAttribute("href", "tel:+995555010203");
      await expect(visitor.locator("main").getByRole("link", { name: "+995 322 11 22 33", exact: true })).toHaveAttribute("href", "tel:+995322112233");
      await expect(visitor.locator("main").getByRole("link", { name: "integration-contact@example.com", exact: true })).toHaveAttribute("href", "mailto:integration-contact@example.com");
      await expect(visitor.locator("main").getByText("თბილისი — ინტეგრაციის სატესტო მისამართი", { exact: true })).toBeVisible();
    });

    await test.step("a public inquiry reaches the admin inbox and can be marked read", async () => {
      const sender = `ტესტის სტუმარი ${unique}`;
      const inquiryMessage = `მსურს პროექტის განხილვა. ეს არის ტესტის შეტყობინება ${unique}.`;
      await visitor.getByLabel("სახელი და გვარი", { exact: true }).fill(sender);
      await visitor.getByLabel("ელფოსტა", { exact: true }).fill(`integration-${unique}@example.com`);
      await visitor.getByLabel("ტელეფონი (არასავალდებულო)", { exact: true }).fill("+995 555 10 20 30");
      await visitor.getByLabel("თქვენი შეტყობინება", { exact: true }).fill(inquiryMessage);
      await visitor.getByRole("button", { name: "შეტყობინების გაგზავნა", exact: true }).click();
      await expect(visitor.locator(".contact-form").getByRole("status")).toContainText("თქვენი შეტყობინება მიღებულია.");
      await expect(visitor.getByLabel("სახელი და გვარი", { exact: true })).toHaveValue("");
      await page.goto("/admin/inquiries");
      const inquiry = page.getByRole("article").filter({ has: page.getByRole("heading", { name: sender, exact: true }) });
      await expect(inquiry).toBeVisible();
      await expect(inquiry.getByText(inquiryMessage, { exact: true })).toBeVisible();
      await expect(inquiry.getByText("ახალი", { exact: true })).toBeVisible();
      await inquiry.getByRole("button", { name: "მონიშვნა წაკითხულად", exact: true }).click();
      await expect(inquiry.getByText("წაკითხული", { exact: true })).toBeVisible();
      await page.reload();
      await expect(inquiry.getByRole("button", { name: "მონიშვნა წაუკითხავად", exact: true })).toBeVisible();
    });

    await test.step("restore edited settings before ending the session", async () => {
      await page.goto("/admin/contact");
      await page.getByRole("button", { name: "ტელეფონი 2: წაშლა", exact: true }).click();
      for (const [label, value] of Object.entries(originalContact!)) await page.getByLabel(label, { exact: true }).fill(value);
      await page.getByRole("button", { name: "ცვლილებების შენახვა", exact: true }).click();
      await expect(page.locator(".a-main").getByRole("status")).toContainText("საკონტაქტო მონაცემები განახლდა.");
      originalContact = undefined;
    });

    await test.step("logout invalidates access to protected pages and uploads", async () => {
      await page.getByRole("button", { name: "გამოსვლა", exact: true }).click();
      await expect(page).toHaveURL(`${baseURL}/admin/login`);
      await page.goto("/admin/projects");
      await expect(page).toHaveURL(`${baseURL}/admin/login`);
      const upload = await page.request.post("/api/upload", { headers: { origin: baseURL } });
      expect(upload.status()).toBe(401);
    });
  } finally {
    await visitorContext.close();
    // The database is isolated for this suite; on failure the remaining values
    // are deliberately visible for diagnosis rather than hidden by cleanup.
  }
});
