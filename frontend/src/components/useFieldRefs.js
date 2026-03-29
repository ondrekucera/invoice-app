import { useRef } from "react";

/**
 * Poskytuje stabilní registr ref objektů pro pojmenovaná formulářová pole.
 * Lazy inicializace zajišťuje, že ref se vytvoří až při prvním použití – ne při každém renderu.
 *
 * Použití:
 *   const { getRef } = useFieldRefs();
 *   <input ref={getRef("name")} ... />
 */
export function useFieldRefs() {
  const fieldRefs = useRef({});

  const getRef = (name) => {
    if (!fieldRefs.current[name]) {
      fieldRefs.current[name] = { current: null };
    }
    return fieldRefs.current[name];
  };

  return { fieldRefs, getRef };
}
