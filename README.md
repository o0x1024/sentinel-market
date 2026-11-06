# Sentinel Market

Official marketplace repository for [Sentinel AI](https://github.com/o0x1024/sentinel-ai) plugins and skills.

## Structure

```text
sentinel-market/
├── plugins/                # Sentinel AI Security & Traffic Plugins
│   ├── plugins.json        # Plugin Store Manifest
│   ├── agent/              # Agent Tool Plugins
│   ├── bounty/             # Bug Bounty & Surface Monitor Plugins
│   ├── intruder/           # Intruder Payload & Signer Plugins
│   └── traffic/            # Passive Traffic Analysis Plugins
├── skills/                 # Sentinel AI Agent Skills
│   ├── skills.json         # Skills Store Manifest
│   └── <skill-id>/         # Individual Skill Directories (SKILL.md + resources)
└── scripts/
    └── build_skills_manifest.mjs
```

## Updating Skills Manifest

After adding or updating a skill under `skills/<skill-id>/`, run:

```bash
node scripts/build_skills_manifest.mjs
```
