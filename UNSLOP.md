# Unslop notes

Pass made with the unslop skill by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0.

## Audit (first build)

Level: light. The template was built with the skill's rules from the start (graphite surfaces, Figtree at 400 and 500, line icons at one size and stroke, no gradients, glows, pills above headlines, uppercase labels or looping motion), so the signs were in how color carried meaning and in a few details.

- Accent overused and confusable: "due soon" dates, "today" and "tomorrow" in the Coming up list, and the Done share of every progress bar were all in the vermilion accent, which sat next to the red used for late cards, so progress read as an alarm
- Done cards still shouting: finished cards showed "4 days late" in red
- Avatar stacks with no separation, so overlapping initials ran into each other (board cards, project rows, top bar)
- Copy: client name and summary joined into "Ferment & Co.. Labels for..." (double period)
- Mobile: an empty breadcrumb slash after the logo on board pages
- Keyboard moving: the first Left or Right arrow from the top card of a column didn't change column
- Card drawer repeated the due date next to the date field when it wasn't near

## Direction

- Product: kanban boards for a small design studio moving client work from brief to done
- Character: tactile, orderly, quick
- World: a studio wall of index cards, colored tape and marker pens
- Moments: the board itself, cards carrying tape strips in each label's color and the people on them; the project list's progress bars in neutral steps ending in the darkest "Done"
- Signature: the thin marker-orange rule under each card's title, like the printed header line on an index card (cards, and the title in the card drawer)

## Fixes

- Color: accent moved from vermilion to marker orange (#c2410c, 5.2:1 on white) and used only for the main button, focus and the title rule; late is a separate crimson; "soon" is primary text at weight 500; Done in progress bars is the darkest neutral step, with a legend
- Finished cards (last column) show their date quietly as a plain date
- Avatars get a 2px ring in the card color and a smaller overlap
- Summary moved to its own muted line under the client
- Breadcrumb slash hidden on small screens
- Left and Right arrows now jump straight to the next column during a keyboard move; announcements name the card, column and position
- Drawer shows the relative due text only when the card is due soon or late

## Screenshots

- screenshot-2: Projects overview with progress by column and the Coming up list
- screenshot-3: Card drawer with labels, people, notes and checklist
