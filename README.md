# BottomBet Scanner

Tableau de bord statique qui repère les prochains matchs des trois ou cinq derniers de 19 divisions européennes. Les données sont obtenues gratuitement auprès de TheSportsDB et des fichiers CSV publics de Football-Data.co.uk, puis servies par Netlify.

## Utilisation locale

```bash
npm ci
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

Le collecteur utilise uniquement des endpoints gratuits et des fichiers CSV publiquement proposés au téléchargement. Il n’accède pas à FotMob, dont les conditions interdisent l’utilisation régulière de robots. Si une source est indisponible, le dernier jeu de données valide est conservé.

Le score de vulnérabilité est un indicateur éditorial, pas une prédiction garantie ni un conseil financier.
