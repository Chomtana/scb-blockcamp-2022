import { useMemo } from "react";

export default function useId(prefix = "") {
  return useMemo(() => prefix + Math.floor(Math.random() * 1000000000), [prefix]);
}