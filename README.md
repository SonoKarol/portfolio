# Portfolio

Portfolio personale di Karol ([@SonoKarol](https://github.com/SonoKarol)): sito one-page con una scena 3D procedurale nell'hero (shader custom, particelle, post-processing), fallback statico e rispetto di `prefers-reduced-motion`.

La sezione Progetti mostra i repository pubblici di GitHub, aggiornati automaticamente (ISR, 1h) con fallback a dati locali.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript strict
- [Three.js](https://threejs.org) via react-three-fiber + @react-three/postprocessing
- [Tailwind CSS](https://tailwindcss.com) v4
- Deploy su [Vercel](https://vercel.com)

## Sviluppo

```bash
npm install
npm run dev     # server di sviluppo su http://localhost:3000
npm run lint    # ESLint
npm run build   # build di produzione
```

## Variabili d'ambiente

- `GITHUB_TOKEN` (facoltativo in locale, **consigliato in produzione**): token GitHub a sola lettura che alza il rate limit dell'API usata dalla sezione Progetti. In locale va in `.env.local`; su Vercel va impostato nelle Environment Variables del progetto, perché gli IP egress sono condivisi tra molti progetti e il limite anonimo (60 req/h per IP) può esaurirsi. Se una revalidation fallisce comunque, il sito continua a servire l'ultima versione buona (i dati reali non vengono mai sostituiti dal fallback a runtime).
