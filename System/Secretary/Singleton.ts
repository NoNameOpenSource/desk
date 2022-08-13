import { Secretary } from "./Secretary";

export let secretaryInstance: Secretary;

export function set(secretary: Secretary) {
    secretaryInstance = secretary;
}
