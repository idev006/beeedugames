# Gameplay usability fixes — 2026-08-02

## City map

City screen is now a real viewport-constrained scroll container. Browser evidence at 1280×720: client height 679 px, content height 2,606 px, maximum scroll 1,927 px, and the last district is visible at the bottom.

## Consistent charging flow

Production configuration now uses `equalGroupsMode: required`. Every round begins with the grouping/charging phase, including mastered facts. The master lightning relay remains available so AR players can charge all remaining groups without pointing at every pod.

Adaptive fast-track remains tested as an optional capability but is not active in production because an intermittently missing charge control confused players.

## AR choice dwell

Settings include an answer-choice dwell slider from 300 to 1,500 ms in 100 ms steps. The selected value is persisted with player preferences and is read directly by `ARSelectionSystem` for answer targets. Group and master-relay dwell remain short, independent values so charging does not become slow.
