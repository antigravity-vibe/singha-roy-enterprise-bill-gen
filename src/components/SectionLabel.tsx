/** Section label positioned on the card's top-left border, like a fieldset legend */
export function SectionLabel({ title }: { title: string }) {
    return (
        <div className="absolute -top-3 left-5 z-10 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 shadow-sm ring-1 ring-slate-200/80">
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">{title}</span>
        </div>
    );
}
