# Clients Playground Instructions

This repository is a single playground for all client deliverables. It replaces the older pattern of one repo per client.

## Repository Model
The app has three levels:
- `/` lists all clients.
- `/clients/<client-slug>` lists that client's projects.
- `/clients/<client-slug>/projects/<project-slug>` opens that project in the React iframe viewer.

Static project files live under:

```text
public/clients/<client-slug>/
  context.md
  assets/
    images/
    styles/
    documents/
    source/
  projects/
    <project-slug>/
      index.html
```

## Client Context Is Required
Before making client-specific copy, design, or project decisions:
1. Identify the client being discussed.
2. Read `public/clients/<client-slug>/context.md`.
3. Use that context as the source of truth for client voice, known people, event details, brand assumptions, and recurring workflows.

Current client contexts:
- CBHN: `public/clients/cbhn/context.md`
- RXVP: `public/clients/rxvp/context.md`

If a request does not name a client, infer it from the project slug or existing files. If it is still ambiguous, ask which client the work belongs to before editing.

## Adding A Client
When adding a new client:
1. Create `public/clients/<client-slug>/context.md`.
2. Create the standard `assets/images`, `assets/styles`, `assets/documents`, `assets/source`, and `projects` folders.
3. Add the client and its projects to `src/lib/clients.ts`.
4. Use stable, lowercase kebab-case slugs.

## Adding A Project
When adding a new project:
1. Put the static deliverable at `public/clients/<client-slug>/projects/<project-slug>/index.html`.
2. Add shared client assets to `public/clients/<client-slug>/assets/`.
3. Add project-specific assets inside the project folder only when they are not useful across other projects.
4. Register the project in `src/lib/clients.ts`.

## Static Project Path Rules
Static project HTML files are served from `public/clients/<client-slug>/projects/<project-slug>/index.html`.

Use relative paths from the project file:

```html
<img src="../../assets/images/logo.png" alt="">
<link rel="stylesheet" href="../../assets/styles/main.css">
```

Do not use root-relative paths like `/clients/...`, `/images/...`, or `/styles/...` inside static project HTML. Relative paths keep local export scripts and deployed GitHub Pages behavior aligned.

## React App Rules
- The client/project registry is `src/lib/clients.ts`.
- The root page is `src/pages/Home.tsx`.
- Client project listing pages use `src/pages/ClientProjects.tsx`.
- Static project viewing uses `src/pages/StaticProject.tsx`.
- Keep routes client-aware. Do not add new global `/projects/<slug>` routes except legacy redirects.

## Export Scripts
Generic export scripts should accept both `--client` and `--project` and load:

```text
public/clients/<client-slug>/projects/<project-slug>/index.html
```

Default to `--client cbhn` only for backward compatibility with older CBHN commands.
