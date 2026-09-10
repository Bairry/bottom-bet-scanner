# BottomBet Scanner

Tableau de bord statique qui repère les prochains matchs des trois ou cinq derniers de 11 championnats européens. Les données publiques sont collectées avec Playwright, sans API payante, puis servies par Netlify.

## Utilisation locale

```bash
npm ci
npx playwright install chromium
npm run scrape
npm test
npm run check
npm start
```

Ouvrir ensuite `http://localhost:3000`.

## Publication

1. Créer un dépôt GitHub vide et y pousser ce projet.
2. Dans Netlify, **Add new site → Import an existing project → GitHub**, choisir le dépôt.
3. Netlify détecte `netlify.toml` : aucune variable d’environnement n’est requise.
4. Dans GitHub, autoriser les Actions à écrire : **Settings → Actions → General → Workflow permissions → Read and write permissions**.

L’action s’exécute quatre fois par jour et chaque commit de données déclenche automatiquement un nouveau déploiement Netlify.

## Collecte responsable

Le scraper visite uniquement des pages publiques, avec un seul navigateur, des pauses entre les pages et sans CAPTCHA, proxy rotatif, usurpation furtive ou contournement. Si le site refuse l’accès ou change de structure, l’action échoue et conserve le dernier jeu de données valide. Vérifiez régulièrement les conditions d’utilisation et `robots.txt` de la source.

Le score de vulnérabilité est un indicateur éditorial, pas une prédiction garantie ni un conseil financier.
