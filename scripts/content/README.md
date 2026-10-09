# Content workflow

Real learning content belongs in `content/private/`, which is ignored by Git.
Only synthetic fixtures may be stored in the repository.

Validate the private 60-question sample:

```bash
npm run content:validate -- \
  --file content/private/sample-60.json \
  --expect-sample-matrix
```

The sample-matrix check also requires every concept to be represented by at
least two distinct question variants. The validation report includes the topic
and concept totals plus the concept-variant distribution.

Validate without connecting to PostgreSQL:

```bash
npm run content:import -- \
  --file content/private/sample-60.json \
  --validate-only
```

Run a transactional database dry-run against a local database:

```bash
CONTENT_DATABASE_URL='postgresql://localhost:5432/englishbyloris' \
npm run content:import -- \
  --file content/private/sample-60.json \
  --dry-run
```

Apply to a local database only after a successful dry-run:

```bash
CONTENT_DATABASE_URL='postgresql://localhost:5432/englishbyloris' \
npm run content:import -- \
  --file content/private/sample-60.json \
  --apply
```

Remote targets are rejected unless `--allow-remote` is also present. That flag
must only be used after explicit authorization. Database URLs and credentials
must remain in environment variables and must never be passed as command-line
arguments or committed.

Database integration tests use the synthetic fixture only:

```bash
CONTENT_DATABASE_URL='postgresql://localhost:5432/englishbyloris_test' \
npm run test:content:db
```

## Human review register

The following private sample records remain pending qualified human review for
their CEFR classification: `wr-b2-002`, `di-b2-001`, `di-b2-003` and
`vc-a2-004`. Their current levels are working classifications only and are not
certified. The private prompts, answers and explanations must not be copied into
versioned documentation, fixtures or logs.
