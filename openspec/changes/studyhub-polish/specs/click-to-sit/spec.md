## ADDED Requirements

### Requirement: Click empty seat to claim

A user SHALL be able to click any empty seat in the study hall grid to immediately claim it and move their avatar there.

#### Scenario: User claims an empty seat

- **WHEN** a logged-in user clicks an empty seat
- **THEN** the seat becomes occupied by that user's avatar, the previous seat (if any) is released, and `in_coffee_break` is set to false on the user's profile

#### Scenario: User cannot claim an occupied seat

- **WHEN** a logged-in user clicks a seat already occupied by another user
- **THEN** the message popup opens for that other user (no seat change occurs)

#### Scenario: User clicks their own occupied seat

- **WHEN** a logged-in user clicks the seat they currently occupy
- **THEN** nothing happens (seat state is unchanged)

### Requirement: No keyboard navigation hints

The study room SHALL NOT display any text instructing users to use arrow keys, Enter, or Space to navigate or sit.

#### Scenario: Room renders without keyboard hint

- **WHEN** the study room page loads
- **THEN** no text referencing "↑ ↓ ← →", "arrow keys", "enter", or "space" is visible
