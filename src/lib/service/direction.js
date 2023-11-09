import { api } from ".";

export function getDirectionLegs(direction_id) {
    return api(`/direction/${direction_id}/legs`, "GET");
}

export function getDirectionLegSteps(direction_id) {
    return api(`/direction/${direction_id}/legs/steps`, "GET");
}