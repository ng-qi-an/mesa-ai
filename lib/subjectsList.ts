import { Atom, BookOpen, DraftingCompass, Globe, Presentation, RulerDimensionLine, Scroll, Stethoscope } from "lucide-react";

const specialIcons = ['presentation', 'globe', 'scroll', 'drafting-compass', 'ruler-dimension-line', 'atom', 'stethoscope', 'book-open-text'];


export const subjectsList = [
    {
        name: 'Geography',
        icon: Globe,
        iconName: 'globe',
    },
    {
        name: 'History',
        icon: Scroll,
        iconName: 'scroll',
    },
    {
        name: 'Literature',
        icon: BookOpen,
        iconName: 'book-open',
    },
    {
        name: 'Physics',
        icon: RulerDimensionLine,
        iconName: 'ruler-dimension-line',
    },
    {
        name: 'Chemistry',
        icon: Atom,
        iconName: 'atom',
    },
    {
        name: 'Biology',
        icon: Stethoscope,
        iconName: 'stethoscope',
    },
    {
        name: 'Mathematics',
        icon: DraftingCompass,
        iconName: 'drafting-compass',
    },
    {
        name: 'Generic',
        icon: Presentation,
        iconName: 'presentation',
    },

]