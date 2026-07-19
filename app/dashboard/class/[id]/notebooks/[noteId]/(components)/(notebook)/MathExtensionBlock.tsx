'use client';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import katex from "katex";

export default function MathExtensionBlock({props}:{props: any}){
    const html = katex.renderToString(props.inlineContent.props.code, {
        throwOnError: false,
    });
    return <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
        <span
            contentEditable={false}
            className="px-0.5 rounded-md cursor-default hover:bg-secondary"
            onClick={()=> {
                const newKatex = prompt("Edit LaTeX code:", props.inlineContent.props.code);
                if (newKatex !== null) {
                props.updateInlineContent({
                    type: "inlineMath",
                    props: { code: newKatex },
                })
                }
            }}
            dangerouslySetInnerHTML={{ __html: html }}
            />
        </TooltipTrigger>
        <TooltipContent>
            <p className="text-sm">Click to edit equation</p>
        </TooltipContent>
    </Tooltip>
}