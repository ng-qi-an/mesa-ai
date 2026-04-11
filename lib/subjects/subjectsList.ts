import { physicsConfig } from "./physics";
import { chemistryConfig } from "./chemistry";
import { biologyConfig } from "./biology";
import { historyConfig } from "./history";
import { geographyConfig } from "./geography";
import { genericConfig } from "./generic";

export const availableSubjects = {
    physics: physicsConfig,
    chemistry: chemistryConfig,
    biology: biologyConfig,
    history: historyConfig,
    geography: geographyConfig,
    generic: genericConfig
}

export const subjectsList = Object.values(availableSubjects)
