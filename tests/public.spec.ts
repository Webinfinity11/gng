import { expect, test, type Page } from "@playwright/test";

// Keep screenshot and manual-interaction assertions independent of autoplay.
test.use({ reducedMotion: "reduce" });

// Run without DATABASE_URL: the public site shows supplied GNG project photos,
// while database drafts remain private and storage/auth setup states remain explicit.
// Database-backed administrator workflows are covered separately.
async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.viewport + 1);
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport + 1);
}

test("Georgian homepage keeps its structure and desktop links reach public pages", async ({ page }) => {
  const clientErrors: string[] = [];
  page.on("pageerror", (error) => clientErrors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page).toHaveTitle("GNG - ავეჯი თქვენი სივრცისთვის");
  await expect(page.locator("html")).toHaveAttribute("lang", "ka");
  await expect(page.getByRole("heading", { level: 1, name: "ავეჯი თქვენი სივრცისთვის", exact: true })).toBeVisible();
  const sectionOrder = await page.locator("#main-content > section").evaluateAll(sections => sections.map(section => section.classList[0]));
  expect(sectionOrder).toEqual(["hero", "patner-section", "about", "portfolio", "service", "gng-products"]);
  await expect(page.locator(".gng-products-grid > .gng-product-card")).toHaveCount(3);
  await expect(page.locator(".gng-portfolio-track > :not(.is-clone) .portfolio-collection")).toHaveCount(4);
  await expect(page.locator(".service-item-wrap .service-collection-item")).toHaveCount(4);
  await expect(page.locator("#main-content + footer.footer")).toBeVisible();
  const heroImage = page.locator(".hero-img");
  await expect(heroImage).toBeVisible();
  await expect.poll(() => heroImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: ".artifacts/gng-georgian/public-home-desktop.png", fullPage: true });

  const navigation = page.getByRole("navigation", { name: "მთავარი ნავიგაცია", exact: true });
  await expect(navigation.getByRole("link")).toHaveText(["მთავარი", "ჩვენ შესახებ", "სერვისები", "პროექტები", "კონტაქტი"]);
  await navigation.getByRole("link", { name: "ჩვენ შესახებ", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "ჩვენ შესახებ", exact: true })).toHaveAttribute("aria-current", "page");
  await navigation.getByRole("link", { name: "სერვისები", exact: true }).click();
  await expect(page).toHaveURL(/\/service$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "სერვისები", exact: true })).toHaveAttribute("aria-current", "page");
  await navigation.getByRole("link", { name: "კონტაქტი", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByLabel("სახელი და გვარი", { exact: true })).toBeVisible();
  await navigation.getByRole("link", { name: "მთავარი", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "ავეჯი თქვენი სივრცისთვის", exact: true })).toBeVisible();
  expect(clientErrors).toEqual([]);
});

test("mobile menu supports keyboard dismissal and closes after navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: "მთავარი ნავიგაცია", exact: true });
  const openButton = page.getByRole("button", { name: "გახსენი მენიუ", exact: true });
  await expect(menu).toBeHidden();
  await openButton.click();
  await expect(menu).toBeVisible();
  await expect(page.getByRole("button", { name: "დახურე მენიუ", exact: true })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(openButton).toBeFocused();
  await openButton.click();
  await menu.getByRole("link", { name: "სერვისები", exact: true }).click();
  await expect(page).toHaveURL(/\/service$/);
  await expect(menu).toBeHidden();
  await expect(page.getByRole("button", { name: "გახსენი მენიუ", exact: true })).toHaveAttribute("aria-expanded", "false");
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-img")).toBeVisible();
  await expect(page.locator(".hero-title")).toBeVisible();
  const wordmarkBounds = await page.locator(".hero-title").boundingBox();
  const heroBounds = await page.locator(".hero").boundingBox();
  expect(wordmarkBounds!.x + wordmarkBounds!.width).toBeLessThanOrEqual(heroBounds!.x + heroBounds!.width + 1);
  await page.screenshot({ path: ".artifacts/gng-georgian/public-home-mobile.png", fullPage: true });
});

test("mobile portfolio carousel changes projects and links open the correct gallery", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const carousel = page.locator(".portfolio .w-slider");
  const projectTitles = await page.locator(".gng-portfolio-track > :not(.is-clone) .portfolio-collection-text").allTextContents();
  expect(projectTitles).toHaveLength(4);
  expect(new Set(projectTitles).size).toBe(4);
  for (const title of projectTitles) expect(title).toMatch(/[ა-ჰ]/);
  const activeSlide = carousel.locator('.w-slide[aria-hidden="false"]');
  await expect(carousel).toBeVisible();
  await expect(activeSlide).toHaveCount(1);
  await expect(carousel.getByRole("group")).toHaveCount(1);
  await expect(carousel).toHaveAttribute("aria-label", /[ა-ჰ]/);
  await expect(activeSlide.locator(".portfolio-collection-text")).toHaveText(projectTitles[0]);
  const next = carousel.getByRole("button", { name: /: შემდეგი სლაიდი$/ });
  await next.click();
  await expect(activeSlide.locator(".portfolio-collection-text")).toHaveText(projectTitles[1]);
  await next.press("ArrowLeft");
  await expect(activeSlide.locator(".portfolio-collection-text")).toHaveText(projectTitles[0]);
  await carousel.getByRole("button", { name: /: წინა სლაიდი$/ }).click();
  await expect(activeSlide.locator(".portfolio-collection-text")).toHaveText(projectTitles[3]);
  await next.click();
  const detailLink = activeSlide.getByRole("link");
  await expect(detailLink).toHaveAccessibleName(/[ა-ჰ]/);
  await expect(detailLink).toHaveAttribute("href", "/portfolio/khedi-hotel");
  await detailLink.click();
  await expect(page).toHaveURL(/\/portfolio\/khedi-hotel$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(projectTitles[0]);
});

test("supplied project galleries are available without publishing database drafts", async ({ page }) => {
  const response = await page.goto("/projects");
  expect(response?.status()).toBe(200);
  const cards = page.locator(".gng-projects-grid .portfolio-collection");
  await expect(cards).toHaveCount(4);
  await expect(cards.locator(".portfolio-collection-text")).toHaveText([/[ა-ჰ]/, /[ა-ჰ]/, /[ა-ჰ]/, /[ა-ჰ]/]);
  const links = await cards.getByRole("link").evaluateAll(items => items.map(item => item.getAttribute("href")));
  expect(links).toEqual(["/portfolio/khedi-hotel", "/portfolio/vazisubani-estate", "/portfolio/holiday-inn-avlabari", "/portfolio/coca-cola-bottlers-georgia"]);
  await expect(page.locator('a[href="/projects/radisson-blu-iveria-pool"]')).toHaveCount(0);
});

for (const width of [390, 1280]) {
  test(`public routes fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/about", "/service", "/projects", "/contact"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expectNoHorizontalOverflow(page);
    }
    if (width === 1280) {
      await page.screenshot({ path: ".artifacts/gng-georgian/public-contact-desktop.png", fullPage: true });
    }
  });
}

test("unconfigured contact submission gives an honest error and preserves entered data", async ({ page }) => {
  await page.goto("/contact");
  const name = page.getByLabel("სახელი და გვარი", { exact: true });
  const email = page.getByLabel("ელფოსტა", { exact: true });
  const phone = page.getByLabel("ტელეფონი (არასავალდებულო)", { exact: true });
  const message = page.getByLabel("თქვენი შეტყობინება", { exact: true });
  await name.fill("სატესტო მომხმარებელი");
  await email.fill("public-test@example.com");
  await phone.fill("+995555000000");
  await message.fill("გვაინტერესებს ჩვენი სივრცისთვის ინდივიდუალური ავეჯის დამზადება.");
  await page.getByRole("button", { name: "შეტყობინების გაგზავნა", exact: true }).click();
  await expect(page.locator(".contact-form").getByRole("alert")).toContainText("საკონტაქტო ფორმა ჯერ არ არის გააქტიურებული");
  await expect(name).toHaveValue("სატესტო მომხმარებელი");
  await expect(email).toHaveValue("public-test@example.com");
  await expect(phone).toHaveValue("+995555000000");
  await expect(message).toHaveValue("გვაინტერესებს ჩვენი სივრცისთვის ინდივიდუალური ავეჯის დამზადება.");
  await expect(page.getByRole("button", { name: "შეტყობინების გაგზავნა", exact: true })).toBeEnabled();
});

test("unknown and draft project routes are unavailable to visitors", async ({ page }) => {
  for (const slug of ["not-a-real-project", "radisson-blu-iveria-pool"]) {
    const response = await page.goto(`/projects/${slug}`);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".project-detail-heading")).toHaveCount(0);
  }
});

test("unconfigured protected admin pages redirect to setup", async ({ page }) => {
  for (const route of ["/admin", "/admin/projects", "/admin/contact", "/admin/login"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/setup$/);
    await expect(page.getByRole("heading", { name: "დააკავშირეთ მონაცემთა ბაზა" })).toBeVisible();
    await expect(page.getByText("Neon PostgreSQL-ის", { exact: false })).toBeVisible();
  }
});

test("upload API rejects unauthenticated requests", async ({ request }) => {
  const response = await request.post("/api/upload", {
    multipart: {
      file: { name: "test.png", mimeType: "image/png", buffer: Buffer.from("not-an-image") },
    },
  });
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: "ავტორიზაცია აუცილებელია." });
});

test("English pages live under /en and the switch keeps the current page", async ({ page }) => {
  const clientErrors: string[] = [];
  page.on("pageerror", (error) => clientErrors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/about");
  await page.getByRole("link", { name: "Switch to English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/about$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1, name: "About us", exact: true })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Main navigation", exact: true });
  await expect(navigation.getByRole("link")).toHaveText(["Home", "About", "Services", "Projects", "Contact"]);
  await navigation.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/contact$/);
  await expect(page.getByLabel("Full name", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "ქართულ ენაზე გადართვა", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ka");

  for (const path of ["/en", "/en/service", "/en/projects", "/en/portfolio/khedi-hotel"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#main-content")).not.toContainText(/[ა-ჰ]/);
    await expectNoHorizontalOverflow(page);
  }
  await page.goto("/en");
  await page.screenshot({ path: ".artifacts/gng-english/public-home-desktop.png", fullPage: true });

  const internal = await page.request.get("/ka/about", { maxRedirects: 0 });
  expect(internal.status()).toBe(308);
  expect(internal.headers().location).toMatch(/\/about$/);
  expect(clientErrors).toEqual([]);
});
