import { test, expect } from '@playwright/test';
import snapshot from '../../data/geographie/communes.json';
import { buildCommuneIndex } from '../../lib/commune-search';

test('keyboard arrows cross the old 30-option boundary without typing a town name', async ({
  page,
}) => {
  await page.goto('/recherche?departement=66');
  const picker = page.getByRole('combobox', { name: 'Commune ou code postal' });
  await picker.focus();
  for (let i = 0; i < 31; i++) await picker.press('ArrowDown');
  await expect(page.getByRole('listbox', { name: 'Communes' }).getByRole('option')).toHaveCount(60);
  await expect(
    page.getByRole('listbox', { name: 'Communes' }).getByRole('option', { selected: true }),
  ).toHaveAttribute('aria-posinset', '31');
  await picker.press('End');
  await expect(page.getByRole('listbox', { name: 'Communes' }).getByRole('option')).toHaveCount(
    226,
  );
});

for (const department of ['66', '11', '34']) {
  const towns = buildCommuneIndex(
    snapshot.communes.filter((c) => c.codeDepartement === department),
  ).map((row) => row.commune);
  test(`department ${department}: first, middle and last towns are selectable without an external API`, async ({
    page,
  }) => {
    const external: string[] = [];
    await page.route('**/geo.api.gouv.fr/**', (route) => {
      external.push(route.request().url());
      return route.abort();
    });
    for (const town of [towns[0], towns[Math.floor(towns.length / 2)], towns.at(-1)!]) {
      await page.goto(`/recherche?departement=${department}`);
      await page.getByLabel('Votre expertise').selectOption('toiture');
      const picker = page.getByRole('combobox', { name: 'Commune ou code postal' });
      await picker.fill(
        town.nom
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
      );
      await page
        .getByRole('option')
        .filter({ hasText: `INSEE ${town.code}` })
        .click();
      await page.getByRole('button', { name: 'Trouver une entreprise' }).click();
      await expect(page).toHaveURL(new RegExp(`commune=${town.code}`));
      await expect(page.locator('#results-title')).toContainText(town.nom);
    }
    expect(external).toEqual([]);
  });

  test(`department ${department}: complete suggestions can be browsed past the initial batch`, async ({
    page,
  }) => {
    await page.goto(`/recherche?departement=${department}`);
    const picker = page.getByRole('combobox', { name: 'Commune ou code postal' });
    await picker.focus();
    await expect(page.getByRole('listbox', { name: 'Communes' }).getByRole('option')).toHaveCount(
      30,
    );
    const more = page.getByRole('button', { name: /Afficher les communes suivantes/ });
    while (await more.isVisible()) await more.click();
    await expect(page.getByRole('listbox', { name: 'Communes' }).getByRole('option')).toHaveCount(
      towns.length,
    );
    await expect(
      page.getByRole('listbox', { name: 'Communes' }).getByRole('option').last(),
    ).toContainText(towns.at(-1)!.nom);
    await picker.press('End');
    await expect(picker).toHaveAttribute('aria-activedescendant', new RegExp(towns.at(-1)!.code));
    await picker.press('Enter');
    await expect(picker).toHaveValue(towns.at(-1)!.nom);
  });
}

test('66 named towns, small communes and department filter reset', async ({ page }) => {
  await page.goto('/recherche?departement=66');
  const picker = page.getByRole('combobox', { name: 'Commune ou code postal' });
  for (const name of [
    'Perpignan',
    'Canet-en-Roussillon',
    'Argelès-sur-Mer',
    'Saint-Cyprien',
    'Le Barcarès',
    'Céret',
    'Prades',
    'Thuir',
    'Rivesaltes',
    'Elne',
    'Font-Romeu-Odeillo-Via',
    'Caixas',
    'Glorianes',
    'Mantet',
    'Urbanya',
    'Vira',
  ]) {
    await picker.fill(name);
    await page
      .getByRole('option')
      .filter({ has: page.locator('span', { hasText: new RegExp(`^${name}$`) }) })
      .click();
    await expect(picker).toHaveValue(name);
  }
  await page.getByLabel('Département', { exact: true }).selectOption('34');
  await expect(picker).toHaveValue('');
  await picker.fill('Perpignan');
  await expect(page.getByRole('listbox', { name: 'Communes' }).getByRole('option')).toHaveCount(0);
  await picker.fill('MONTPELLIER');
  const suggestions = page.getByRole('listbox', { name: 'Communes' }).getByRole('option');
  await expect(suggestions).toHaveCount(2);
  await expect(suggestions.first()).toContainText('INSEE 34172');
  await expect(suggestions.last()).toContainText('Murviel-lès-Montpellier');
});

test('real commune coverage, prestation filters and conflicting departments', async ({ page }) => {
  await page.goto(
    '/recherche?expertise=toiture&prestation=renovation-couverture&departement=11&commune=11262',
  );
  await expect(page.locator('.company-result h2')).toHaveText(['Narbonne Toiture']);
  await page.goto('/recherche?expertise=nuisibles&departement=11&commune=11262');
  await expect(page.locator('.company-result')).toHaveCount(0);
  await page.goto('/recherche?expertise=toiture&departement=34&commune=34172');
  await expect(page.locator('.search-empty')).toContainText('Aucune entreprise référencée');
  await page.goto('/recherche?expertise=toiture&departement=66&commune=11262');
  await expect(page.locator('.search-empty')).toContainText('Précisons votre recherche');
});

test('all directory pages expose every official commune exactly once and remain selectively indexed', async ({
  page,
  request,
}) => {
  for (const department of ['66', '11', '34']) {
    const expected = snapshot.communes.filter((c) => c.codeDepartement === department);
    const discovered: string[] = [];
    for (let p = 1; p <= Math.ceil(expected.length / 60); p++) {
      const response = await request.get(
        `/territoires/${department}${p > 1 ? `?communes=${p}` : ''}`,
      );
      expect(response.ok()).toBe(true);
      const html = await response.text();
      const list = html.match(/<ul class="commune-directory-list">(.*?)<\/ul>/s)![1];
      discovered.push(...Array.from(list.matchAll(/commune=(\d{5})/g), (m) => m[1]));
      if (p > 1) expect(html).toContain('noindex, follow');
    }
    expect(discovered.length).toBe(expected.length);
    expect(new Set(discovered).size).toBe(expected.length);
    expect(discovered.sort()).toEqual(expected.map((c) => c.code).sort());
  }
  await page.goto('/territoires/66#annuaire-communes');
  await page.getByRole('link', { name: 'Page 4 des communes' }).click();
  await expect(page.locator('.directory-summary')).toContainText('Page 4 sur 4');
  const last = page.locator('.commune-directory-list a').last();
  const name = await last.locator('span').textContent();
  await last.click();
  await expect(page.locator('#results-title')).toContainText(name!);
});
