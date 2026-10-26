import { expect, test } from "@playwright/test";

type Bounds = { left: number; top: number; right: number; bottom: number };

function expectContained(inner: Bounds, outer: Bounds, description: string) {
  expect(inner.left, `${description}: left edge`).toBeGreaterThanOrEqual(outer.left - 0.5);
  expect(inner.top, `${description}: top edge`).toBeGreaterThanOrEqual(outer.top - 0.5);
  expect(inner.right, `${description}: right edge`).toBeLessThanOrEqual(outer.right + 0.5);
  expect(inner.bottom, `${description}: bottom edge`).toBeLessThanOrEqual(outer.bottom + 0.5);
}

// Georgian copy uses its own font metrics. Protect readable text, working media,
// and responsive composition instead of freezing the former English line breaks.

for (const width of [1280, 390]) {
  test(`Georgian typography and layout fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach(img => { img.loading = "eager"; });
      // Load every visible lazy image before measuring full-page section bounds.
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      await Promise.race([
        Promise.all([...document.images].map(img => img.decode().catch(() => {}))),
        new Promise(resolve => setTimeout(resolve, 5000)),
      ]);
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    const title = page.locator(".hero-title");
    await expect(page.locator("html")).toHaveAttribute("lang", "ka");
    await expect(title).toHaveText("ავეჯი თქვენი სივრცისთვის");
    await expect(title).toHaveCSS("font-family", /Noto Sans Georgian/);
    await expect(page.locator(".optik-site")).toHaveCSS("background-color", "rgb(247, 247, 247)");
    const titleBounds = await title.boundingBox();
    const heroBounds = await page.locator(".hero").boundingBox();
    expect(titleBounds).not.toBeNull();
    expect(heroBounds).not.toBeNull();
    expect(titleBounds!.x).toBeGreaterThanOrEqual(0);
    expect(titleBounds!.x + titleBounds!.width).toBeLessThanOrEqual(width + 1);
    expect(titleBounds!.y).toBeGreaterThanOrEqual(heroBounds!.y);
    expect(titleBounds!.y + titleBounds!.height).toBeLessThanOrEqual(heroBounds!.y + heroBounds!.height + 1);
    const textFits = await title.evaluate(element => element.scrollWidth <= element.clientWidth + 1 && element.scrollHeight <= element.clientHeight + 1);
    expect(textFits, "Georgian heading must not be clipped inside its own box").toBe(true);

    const documentSize = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(documentSize.document).toBeLessThanOrEqual(documentSize.viewport + 1);
    expect(documentSize.body).toBeLessThanOrEqual(documentSize.viewport + 1);
    const brokenImages = await page.locator(".optik-site img").evaluateAll(images => images.filter(image => {
      const img = image as HTMLImageElement;
      return img.complete && img.naturalWidth === 0;
    }).map(image => image.getAttribute("src")));
    expect(brokenImages).toEqual([]);
    const logo = page.locator(".gng-logo-mark.header-logo");
    await expect(logo).toBeVisible();
    await expect(logo.locator("img")).toHaveAttribute("src", "/images/gng-logo.png");
    await expect(logo).toHaveCSS("width", width === 1280 ? "180px" : "144px");

    if (width === 1280) {
      await expect(page.locator(".hero-img")).toBeVisible();
      const links = page.getByRole("navigation", { name: "მთავარი ნავიგაცია", exact: true }).getByRole("link");
      const boxes = await links.evaluateAll(items => items.map(item => {
        const box = item.getBoundingClientRect();
        return { left: box.left, right: box.right };
      }));
      expect(boxes).toHaveLength(5);
      for (let index = 1; index < boxes.length; index++) {
        expect(boxes[index].left, "Georgian navigation links must not overlap").toBeGreaterThanOrEqual(boxes[index - 1].right - 1);
      }
      const aboutText = await page.locator(".abou-left").boundingBox();
      const aboutImages = await page.locator(".abou-right").boundingBox();
      expect(aboutImages!.x).toBeGreaterThanOrEqual(aboutText!.x + aboutText!.width - 1);
    } else {
      await expect(page.locator(".hero-img")).toBeVisible();
      await expect(page.getByRole("button", { name: "გახსენი მენიუ", exact: true })).toBeVisible();
      const aboutText = await page.locator(".abou-left").boundingBox();
      const aboutImages = await page.locator(".abou-right").boundingBox();
      expect(aboutImages!.y).toBeGreaterThanOrEqual(aboutText!.y + aboutText!.height - 1);
    }
    await page.screenshot({ path: `.artifacts/gng-georgian/layout-${width}.png`, fullPage: true });
  });
}

test("the entire PNG logo remains inside header and footer frames", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1530, 1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const logos = page.locator(".gng-logo-mark");
    await expect(logos).toHaveCount(3);
    for (const logo of await logos.all()) {
      await logo.scrollIntoViewIfNeeded();
      const measured = await logo.evaluate(async frame => {
        const image = frame.querySelector("img")!;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true })!;
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let left = canvas.width, top = canvas.height, right = 0, bottom = 0;
        // Ignore nearly transparent edge noise, but include the real mark's
        // antialiased outline rather than merely checking the clipping frame.
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            if (pixels[(y * canvas.width + x) * 4 + 3] < 16) continue;
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x + 1);
            bottom = Math.max(bottom, y + 1);
          }
        }
        const imageRect = image.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        return {
          source: image.getAttribute("src"),
          mark: {
            left: imageRect.left + left * imageRect.width / canvas.width,
            top: imageRect.top + top * imageRect.height / canvas.height,
            right: imageRect.left + right * imageRect.width / canvas.width,
            bottom: imageRect.top + bottom * imageRect.height / canvas.height,
          },
          frame: { left: frameRect.left, top: frameRect.top, right: frameRect.right, bottom: frameRect.bottom },
          viewport: { left: 0, top: 0, right: innerWidth, bottom: innerHeight },
        };
      });
      expect(measured.source).toBe("/images/gng-logo.png");
      expect(measured.mark.right).toBeGreaterThan(measured.mark.left);
      expect(measured.mark.bottom).toBeGreaterThan(measured.mark.top);
      expectContained(measured.mark, measured.frame, `${width}px opaque logo inside its frame`);
      expectContained(measured.mark, measured.viewport, `${width}px opaque logo inside the viewport`);
    }
    if (width !== 1530) {
      await page.locator(".footer-img-wrap").screenshot({ path: `.artifacts/clipping-review/after-footer-${width}.png` });
    }
  }
});

test("Georgian CTA and project heading remain readable at intermediate widths", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  // The services page retains the shared animated consultation link.
  await page.goto("/service");
  await page.evaluate(() => document.fonts.ready);
  const cta = page.locator(".cta").getByRole("link", { name: "კონსულტაციის მიღება", exact: true });
  await expect(cta).toHaveAttribute("href", "/contact");
  await cta.scrollIntoViewIfNeeded();

  for (const state of ["normal", "hover", "keyboard focus"] as const) {
    if (state === "hover") await cta.hover();
    if (state === "keyboard focus") {
      await page.mouse.move(0, 0);
      await cta.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(cta).toBeFocused();
      expect(await cta.evaluate(element => element.matches(":focus-visible"))).toBe(true);
    }
    // The animated label has a second copy for hover and keyboard focus.
    // Measure its actual text Range and every clipping ancestor, not the
    // button's apparently healthy outer box.
    await expect.poll(async () => cta.evaluate((button, index) => {
      const edges = (rect: DOMRect) => ({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
      const label = button.querySelectorAll(".button-text")[index];
      const range = document.createRange();
      range.selectNodeContents(label);
      const arrow = [...button.querySelectorAll(".arrow")].at(-1)!;
      const buttonRect = button.getBoundingClientRect();
      const limits = [{ ...edges(buttonRect) }, { left: 0, top: 0, right: innerWidth, bottom: innerHeight }];
      let ancestor = label.parentElement;
      while (ancestor && ancestor !== button) {
        const style = getComputedStyle(ancestor);
        if (/(hidden|clip|scroll|auto)/.test(style.overflow)) limits.push(edges(ancestor.getBoundingClientRect()));
        ancestor = ancestor.parentElement;
      }
      const text = edges(range.getBoundingClientRect());
      const arrowRect = edges(arrow.getBoundingClientRect());
      const outside = (rect: typeof text, limit: typeof text) => rect.left < limit.left - .5 || rect.top < limit.top - .5 || rect.right > limit.right + .5 || rect.bottom > limit.bottom + .5;
      return {
        textClipped: limits.some(limit => outside(text, limit)),
        arrowClipped: limits.some(limit => outside(arrowRect, limit)),
        overlap: text.right > arrowRect.left + .5,
      };
    }, state === "normal" ? 0 : 1), { message: `${state}: full Georgian CTA label and arrow stay visible` }).toEqual({ textClipped: false, arrowClipped: false, overlap: false });
  }
  await page.locator(".cta-row").screenshot({ path: ".artifacts/clipping-review/after-service-cta-1024.png" });
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contact$/);

  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/portfolio/khedi-hotel");
  await page.evaluate(() => document.fonts.ready);
  const heading = page.getByRole("heading", { level: 1 });
  const title = await heading.evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();
    return {
      text: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      viewport: { left: 0, top: 0, right: innerWidth, bottom: innerHeight },
    };
  });
  expectContained(title.text, title.viewport, "768px project heading text inside the viewport");
  await expect(page.locator(".gng-gallery-item")).toHaveCount(4);
});
