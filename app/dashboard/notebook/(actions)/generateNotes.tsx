'use client';

export const defaultNotesInstructions = `
    ## Formatting Rules
        ### Headings
        - NEVER use H1 (#) — The title has already been provided
        - Use H2 (##) for main topic sections
        - Use H3 (###) for subtopics within sections
        - Use H4 (####) sparingly for detailed breakdowns
        ### Images
        If you want to illustrate a concept with an image, insert a placeholder in the following format:
        [image: <short description or query>]
        - Example: [image: cell division diagram]
        - Example: [image: economic policy chart]
        - Example: [image: World War I map]
        - Example: [image: water cycle experiment setup]
        - Place the image placeholder after introducing the concept it illustrates
        - Keep the description concise like a search query, not a full sentence.
        - Do not embed actual images or URLs; only use the placeholder format above
        - Don't cluster images — spread them throughout the content
        - If no images are relevant, continue without them
        ### Text Formatting
        - **Bold** for key terms and vocabulary
        - *Italics* for definitions and emphasis
        - Use > blockquotes for important formulas, quotes, or critical points
        - Use \`inline code\` for technical terms, commands, or notation
        ### Lists
        - Bullet points for unordered information (features, characteristics)
        - Numbered lists for sequences, steps, or ranked items
        - Keep list items concise — expand in paragraphs if needed

    ## Content Guidelines
        ### No title!
        - The title and summary of the note is already provided and should not be repeated in the content.
        - Start directly with the first topic heading. Do not provide a summary or introduction paragraph.
        ### Length & Readability
        - Target 1500-2000 words (readable in 10-15 minutes)
        - Allocate word count proportionally to topic weight percentages
        - A topic with 40% weight should receive ~40% of the content depth
        ### Writing Style
        - Explain concepts, don't just restate the source
        - Use analogies for complex ideas
        - Write for understanding, not just memorization
        - Active voice preferred
        ### Structure Each Topic Section
        1. Brief intro (what is this and why does it matter?)
        2. Core explanation with examples
        3. Key relationships or comparisons
        4. Common misconceptions if relevant
        ### Always End With
        A "Key Takeaways" section containing 3-5 bullet points summarizing the most important concepts.
    
    ## Edge Case Handling
        ### If the document is very short:
        - Focus on depth over breadth
        - Add contextual explanations the source may assume
        - Still respect topic weight ratios
        ### If the document is very long:
        - Prioritize concepts matching the weighted topics
        - Summarize tangential information briefly
        - Maintain the 15-minute reading target — don't overload
        ### If topic weights don't add to 100%:
        - Normalize proportionally
        - Example: weights of 30, 30, 20 → treat as 37.5%, 37.5%, 25%
        ### If a weighted topic isn't in the document:
        - Mention it briefly with a note that the source doesn't cover it
        - Redistribute that weight to related topics
        ### If the source contains errors or unclear passages:
        - Interpret reasonably and present the most logical understanding
        - Don't invent information not supported by the source
        ### If the source is highly technical:
        - Define jargon on first use
        - Build up from fundamentals before diving deep
        - Use analogies to bridge complex concepts
    `
