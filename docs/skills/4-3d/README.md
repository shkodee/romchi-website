# 4 — 3D-модели

## Blender (RobLe3/cc-blender-skill)
**Blender на ноутбуке ставить не нужно.** Модели делаем в облаке (чат claude.ai / Claude Code в облаке), где Blender работает как Python-модуль без окна:

```bash
pip install bpy build123d   # Blender 5.x как модуль + CAD
python3 scripts/okno.py     # скрипт строит модель и сохраняет okno.glb / okno.usdz
```

Проверено: модель окна из рамы, импоста и стекла собирается и экспортируется в GLB (сайт, Android AR) и USDZ (iPhone AR).

Скиллы `blender-*` написаны под Blender MCP (живой Blender на компьютере). Без MCP используем их как справочник по моделированию, материалам и экспорту, а код выполняем через `bpy`. Готовые файлы `.glb` / `.usdz` кладём в `models/` и в `web/public/models/`.

Если когда-нибудь появится мощный компьютер, можно подключить живой Blender: Blender 4+ и аддон Blender MCP (ahujasid/blender-mcp).

| Скилл | Для чего |
|---|---|
| [text-to-blender](../../../.claude/skills/text-to-blender/SKILL.md) | Главный: принимает задачу и вызывает остальные |
| [blender-modeling](../../../.claude/skills/blender-modeling/SKILL.md) | Моделирование |
| [blender-materials](../../../.claude/skills/blender-materials/SKILL.md) | Материалы (стекло, ПВХ, алюминий) |
| [blender-uv-texturing](../../../.claude/skills/blender-uv-texturing/SKILL.md) | UV и текстуры |
| [blender-lighting](../../../.claude/skills/blender-lighting/SKILL.md) | Свет |
| [blender-cameras](../../../.claude/skills/blender-cameras/SKILL.md) | Камеры |
| [blender-rendering](../../../.claude/skills/blender-rendering/SKILL.md) | Рендер картинок |
| [blender-animation](../../../.claude/skills/blender-animation/SKILL.md) | Анимация (открывание створок) |
| [blender-export](../../../.claude/skills/blender-export/SKILL.md) | Экспорт GLB / USDZ для сайта и AR |
| [blender-pro-workflow](../../../.claude/skills/blender-pro-workflow/SKILL.md) | Профессиональный порядок работы |

## Text-to-CAD (earthtojake/text-to-cad)
Нужно: Python + `pip install build123d`.

| Скилл | Для чего |
|---|---|
| [cad](../../../.claude/skills/cad/SKILL.md) | Точные параметрические модели профиля и изделий, экспорт STEP / STL / GLB |
