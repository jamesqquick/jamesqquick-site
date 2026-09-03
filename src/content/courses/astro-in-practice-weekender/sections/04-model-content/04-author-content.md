---
slug: author-content
title: Author Event and Venue Content
moduleSlug: model-content
moduleTitle: "Model Events and Venues"
moduleOrder: 4
lessonOrder: 4
published: true
duration: "16 minutes"
summary: Add eight validated venue entries and eight event entries with one temporary local poster asset, references, and useful Markdown bodies.
resources:
  - https://docs.astro.build/en/guides/content-collections/#querying-collections
---

# Author Event and Venue Content

## Outcome

You will author the first content-migration dataset: eight venues and eight events. Astro will validate every entry during content sync, but the home page will continue rendering temporary data until the query layer is ready.

This lesson intentionally simplifies the first migration by reusing one poster, `src/assets/events/riverfront-sunset.svg`, for every event. The finished reference demo swaps in eight distinct local posters. This course does not invent or require those extra files: if you later add them, use the same `src/assets/events/<poster-file>` directory pattern and reference them from event Markdown with `../../assets/events/<poster-file>`.

The event dates use September 4-6, 2026, in the `-05:00` Central Daylight Time offset. Keep the offset in every timestamp. A local-looking time without an offset can produce different results on machines in different time zones.

## Author one complete venue

Create `src/content/venues/tom-lee-park.md`:

```md
---
name: Tom Lee Park
description: A thirty-acre riverfront park with open lawns, shaded overlooks, and views across the Mississippi River.
address: 357 Riverside Drive, Memphis, TN 38103
neighborhood: Downtown
website: https://www.tomleepark.org/
accessibility:
  - Step-free paths throughout the park
  - Accessible restrooms
  - Reserved mobility-device viewing area
---

Tom Lee Park stretches along the Mississippi River between Beale Street Landing and the bluff. The park has water stations, public restrooms, and several shaded gathering areas.
```

Frontmatter holds fields that templates sort, filter, or display in fixed positions. The Markdown body holds editorial copy that belongs in the main content flow.

Create the other venue files from this venue data:

| File                             | Name                        | Address                                        | Neighborhood | Website                            |
| -------------------------------- | --------------------------- | ---------------------------------------------- | ------------ | ---------------------------------- |
| `cooper-young-community-yard.md` | Cooper-Young Community Yard | 2108 Young Avenue, Memphis, TN 38104           | Cooper-Young | Omit                               |
| `crosstown-theater.md`           | Crosstown Theater           | 1350 Concourse Avenue, Memphis, TN 38104       | Crosstown    | `https://crosstownarts.org/`       |
| `edge-motor-museum-plaza.md`     | Edge Motor Museum Plaza     | 645 Marshall Avenue, Memphis, TN 38103         | The Edge     | Omit                               |
| `overton-park-greensward.md`     | Overton Park Greensward     | 1914 Poplar Avenue, Memphis, TN 38104          | Midtown      | `https://overtonpark.org/`         |
| `shelby-farms-boat-house.md`     | Shelby Farms Boat House     | 6903 Great View Drive North, Memphis, TN 38134 | East Memphis | `https://www.shelbyfarmspark.org/` |
| `south-main-promenade.md`        | South Main Promenade        | 409 South Main Street, Memphis, TN 38103       | South Main   | Omit                               |
| `stax-museum-courtyard.md`       | Stax Museum Courtyard       | 926 East McLemore Avenue, Memphis, TN 38106    | Soulsville   | `https://staxmuseum.com/`          |

Use these remaining fields and body paragraphs:

| File                             | Description                                                                                                | Accessibility                                                                                           | Markdown body                                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cooper-young-community-yard.md` | A neighborhood gathering space used for markets, workshops, and small outdoor performances.                | Paved entrance from Young Avenue                                                                        | The Community Yard is behind the neighborhood association office. Bike racks and a water refill station are available at the entrance.                           |
| `crosstown-theater.md`           | A neighborhood theater inside Crosstown Concourse for film, music, and community programming.              | Step-free entrance and elevator access; Wheelchair seating locations; Accessible restrooms              | Enter through the Concourse central atrium and follow signs to the theater. Paid garage parking and limited street parking are available nearby.                 |
| `edge-motor-museum-plaza.md`     | An open-air plaza in the Edge District surrounded by murals, restaurants, and historic auto-row buildings. | Level plaza entrance; Accessible parking on Monroe Avenue                                               | The plaza is a short walk from Health Sciences Park. Check in at the orange event tent before starting neighborhood activities.                                  |
| `overton-park-greensward.md`     | A public lawn surrounded by old-growth forest in the center of Midtown.                                    | Accessible drop-off near Veterans Plaza; Paved route to the activity area; Accessible portable restroom | The Greensward is a large lawn near Rainbow Lake Playground. Shade is limited in the center of the field, so bring sun protection and a refillable water bottle. |
| `shelby-farms-boat-house.md`     | The launch point for paddling and lakeside programs at Hyde Lake in Shelby Farms Park.                     | Accessible parking beside the Boat House; Transfer assistance available on request                      | The Boat House rents equipment and provides life jackets. Participants should arrive early enough to complete a safety briefing before launch.                   |
| `south-main-promenade.md`        | A block of galleries, restaurants, and pop-up stalls in the South Main Arts District.                      | Level street access; Accessible parking on Huling Avenue                                                | The promenade sits one block from the South Main trolley stop. Event vendors line the closed street while neighborhood businesses remain open late.              |
| `stax-museum-courtyard.md`       | An outdoor performance courtyard beside the Stax Museum of American Soul Music.                            | Step-free museum and courtyard entrance; Accessible restrooms; Assistive listening devices available    | The courtyard entrance is on McLemore Avenue. Museum admission is separate from courtyard events unless the event listing says otherwise.                        |

Each semicolon-separated accessibility value becomes its own YAML list item. Keep place-wide claims in venue content rather than copying them into every event.

## Author one complete event

Create `src/content/events/riverfront-sunset-sessions.md`:

```md
---
title: Riverfront Sunset Sessions
description: Local soul and indie bands play a free sunset concert beside the Mississippi River.
start: 2026-09-04T19:00:00-05:00
end: 2026-09-04T22:00:00-05:00
venue: tom-lee-park
category: music
price: 0
featured: true
image: ../../assets/events/riverfront-sunset.svg
imageAlt: Temporary Weekender course poster with a yellow sun and cream and orange waves on a blue background.
accessibility:
  - Wheelchair accessible
  - ASL interpretation
  - Accessible restrooms
---

Bring a blanket for an evening of Memphis music by the river. The lineup moves from acoustic soul to a full-band indie set as the sun drops behind the Arkansas shoreline.

## Food and park rules

Outside food is welcome. Local food trucks and a free water station will be set up near the main lawn. Glass containers are not allowed in the park.

## Schedule

- 7:00 PM: Lina Grey
- 8:00 PM: Bluff City Static
- 9:00 PM: The Delta Lines
```

The local image path is relative to the Markdown file. Astro's `image()` helper resolves it into image metadata. `imageAlt` remains authored content because a filename cannot describe the poster.

For the remaining entries, use the same image path and describe the shared artwork as temporary. Learners can replace each image and alt value later without changing the content schema, query helpers, or components.

## Add the remaining event entries

Create the seven remaining files with these structured values for the simplified course dataset:

| File                             | Title                         | Start and end                                              | Venue                         | Category   | Price | Featured | Image                   |
| -------------------------------- | ----------------------------- | ---------------------------------------------------------- | ----------------------------- | ---------- | ----: | -------- | ----------------------- |
| `crosstown-rooftop-cinema.md`    | Crosstown Neighborhood Cinema | `2026-09-04T20:00:00-05:00` to `2026-09-04T22:30:00-05:00` | `crosstown-theater`           | `family`   |    10 | false    | `riverfront-sunset.svg` |
| `shelby-farms-paddle-club.md`    | Sunrise Paddle Club           | `2026-09-05T08:00:00-05:00` to `2026-09-05T09:30:00-05:00` | `shelby-farms-boat-house`     | `outdoors` |    18 | true     | `riverfront-sunset.svg` |
| `cooper-young-makers-morning.md` | Cooper-Young Makers Morning   | `2026-09-05T10:00:00-05:00` to `2026-09-05T14:00:00-05:00` | `cooper-young-community-yard` | `market`   |     5 | false    | `riverfront-sunset.svg` |
| `edge-district-taco-trail.md`    | Edge District Taco Trail      | `2026-09-05T14:00:00-05:00` to `2026-09-05T17:00:00-05:00` | `edge-motor-museum-plaza`     | `food`     |    25 | false    | `riverfront-sunset.svg` |
| `south-main-night-market.md`     | South Main Night Market       | `2026-09-05T17:00:00-05:00` to `2026-09-05T22:00:00-05:00` | `south-main-promenade`        | `food`     |     0 | true     | `riverfront-sunset.svg` |
| `overton-family-field-day.md`    | Overton Park Family Field Day | `2026-09-06T11:00:00-05:00` to `2026-09-06T14:00:00-05:00` | `overton-park-greensward`     | `family`   |     0 | false    | `riverfront-sunset.svg` |
| `stax-soul-brunch.md`            | Stax Soul Brunch              | `2026-09-06T12:00:00-05:00` to `2026-09-06T15:00:00-05:00` | `stax-museum-courtyard`       | `music`    |    32 | true     | `riverfront-sunset.svg` |

Use these descriptions, temporary poster alt text, and accessibility arrays:

| File                             | Description                                                                              | Image alt                                                                                            | Accessibility                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `crosstown-rooftop-cinema.md`    | A screening of five local animation shorts followed by a restored Memphis film.          | Temporary Weekender course poster with a yellow sun and cream and orange waves on a blue background. | Wheelchair accessible; Open captions; Accessible restrooms               |
| `shelby-farms-paddle-club.md`    | Start Saturday with a guided beginner paddle across Hyde Lake.                           | Temporary Weekender course poster with a yellow sun and cream and orange waves on a blue background. | Accessible parking; Transfer assistance available                        |
| `cooper-young-makers-morning.md` | Shop small-batch ceramics, prints, textiles, and vintage finds from neighborhood makers. | Temporary Weekender course poster with a yellow sun and cream and orange waves on a blue background. | Paved entrance                                                           |
| `edge-district-taco-trail.md`    | Follow a self-guided tasting route through six kitchens in the Edge District.            | Temporary Weekender course poster with a yellow sun and cream and orange waves on a blue background. | Step-free route; Accessible parking nearby                               |
| `south-main-night-market.md`     | Food stalls, vintage sellers, and galleries open late along South Main.                  | Temporary Weekender course poster with a yellow sun and cream and orange waves on a blue background. | Wheelchair accessible; Accessible parking nearby                         |
| `overton-family-field-day.md`    | A morning of field games, art stations, and live storytelling for families.              | Temporary Weekender course poster with a yellow sun and cream and orange waves on a blue background. | Wheelchair accessible; Sensory break area; Accessible restroom           |
| `stax-soul-brunch.md`            | A live rhythm section and guest vocalists soundtrack a courtyard brunch in Soulsville.   | Temporary Weekender course poster with a yellow sun and cream and orange waves on a blue background. | Wheelchair accessible; Assistive listening devices; Accessible restrooms |

Add the corresponding Markdown bodies from the reference dataset:

| File                             | Opening paragraph                                                                                                                                                                                   | Section heading and content                                                                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `crosstown-rooftop-cinema.md`    | The program opens with five short films made by Mid-South animators, followed by a restored Memphis film. Doors open at 7:15 PM.                                                                    | `## Seating`: General admission seating begins at 7:30 PM. The screening uses open captions, and wheelchair locations are available throughout the theater.    |
| `shelby-farms-paddle-club.md`    | A park guide leads a loop around Hyde Lake and teaches basic paddling technique during the trip. No prior experience is required.                                                                   | `## Your ticket includes`: Kayak, paddle, life jacket, and a post-paddle coffee are included. Wear clothes that can get wet and arrive by 7:40 AM for fitting. |
| `cooper-young-makers-morning.md` | Meet twenty local makers and watch short demonstrations throughout the morning. The five-dollar ticket includes coffee from the neighborhood cart while supplies last.                              | `## Demonstrations`: `10:30 AM: Wheel-thrown pottery`, `11:30 AM: Two-color screen printing`, and `1:00 PM: Hand-bound notebooks` as a Markdown list.          |
| `edge-district-taco-trail.md`    | Check in at the plaza to collect your route card, then visit six neighborhood kitchens in any order. Each stop serves one tasting-size taco created for the event.                                  | `## Before you go`: The full route covers about one mile on paved sidewalks. Vegetarian tastings are available at four stops and marked on the route card.     |
| `south-main-night-market.md`     | Walk the district at your own pace while restaurants serve street-side specials and local vendors fill the promenade. Participating galleries stay open until 10 PM.                                | `## Market notes`: Admission is free. Food and merchandise are sold separately. Most vendors accept cards, but a few are cash-only.                            |
| `overton-family-field-day.md`    | Drop in for cooperative games, giant bubbles, sidewalk art, and stories under the trees. Activities are designed for ages three through twelve. Family members can join the games and art stations. | `## Bring along`: Pack water, sunscreen, and a picnic blanket. A quiet sensory tent will be available beside the welcome table.                                |
| `stax-soul-brunch.md`            | The house band plays two sets of Memphis soul standards with a rotating group of local singers. Your ticket includes one entree and a nonalcoholic drink.                                           | `## Menu choices`: Choose smoked mushroom hash, hot chicken and waffles, or lemon ricotta pancakes when you reserve your seat.                                 |

These fields are content rather than component code, but they still have a contract. These course values give later route and filter checks deterministic results. The reference demo uses the same content model and route pattern, but its finished asset directory contains eight distinct poster files rather than the one shared course poster.

The four featured entries are Riverfront Sunset Sessions, Sunrise Paddle Club, South Main Night Market, and Stax Soul Brunch. Their chronological order gives the home page one hero event and three secondary picks once the query layer sorts them. The shared poster is only a simplified course asset; replacing it later does not require schema or component changes.

## Check references and defaults

Do not add `draft: false` to every entry. The schema default already provides it. Omitting repetitive defaults keeps frontmatter focused on meaningful differences.

Every `venue` value must match a venue filename without `.md`. A typo such as `tom-lee-parks` should fail content sync because `reference('venues')` cannot resolve it.

Confirm `src/assets/events/riverfront-sunset.svg` exists. Every event entry should use `image: ../../assets/events/riverfront-sunset.svg`; there are no other required poster downloads in this lesson. The path starts with `../../assets/events/` because event Markdown lives two directories below `src`.

This shared image is temporary content, not a schema shortcut. Replacing artwork later requires changing only each entry's `image` and `imageAlt` values. The `image` field, query layer, and rendering components remain unchanged.

## Runnable checkpoint

Run:

```sh
pnpm astro sync
pnpm check
pnpm build
```

Astro should validate eight events and eight venues with no broken references. The rendered home page should remain unchanged because it still uses `temporaryEvents` until lesson 4.6.
