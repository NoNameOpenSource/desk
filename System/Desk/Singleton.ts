import type { Desk } from "./Desk";

export let deskInstance: Desk;

export function set(secretary: Desk) {
    deskInstance = secretary;
}
