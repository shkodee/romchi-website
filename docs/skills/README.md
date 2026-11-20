# Каталог скиллов Romchi Website

Сами скиллы лежат в `.claude/skills/` **плоским списком**: Claude Code находит скиллы только на один уровень вглубь (`.claude/skills/<имя>/SKILL.md`). Если разложить их по подпапкам, он перестанет их видеть.

Поэтому сортировка по категориям сделана здесь: каждая папка — категория, внутри описание и ссылки на скиллы.

| Папка | Категория | Скиллы |
|---|---|---|
| [1-design](1-design/README.md) | Дизайн и UI | design-taste-frontend, frontend-design, impeccable, ui-ux-pro-max |
| [2-animation](2-animation/README.md) | Анимации и микро-взаимодействия | emil-design-eng |
| [3-code](3-code/README.md) | Код и компоненты | ask-sonner |
| [4-3d](4-3d/README.md) | 3D-модели | text-to-blender, blender-* (10 шт.), cad |
| [5-diagrams](5-diagrams/README.md) | Схемы и иллюстрации | archify, anatomy |

## Как добавить новый скилл
1. Положить папку скилла в `.claude/skills/<имя>/` (имя папки = `name:` в SKILL.md).
2. Добавить строку в README нужной категории здесь и в таблицу выше.
3. Добавить строку в таблицу скиллов в `CLAUDE.md`.
