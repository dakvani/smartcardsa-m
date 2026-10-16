import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

function generateSuggestions(base: string): string[] {
  const suffixes = [
    Math.floor(Math.random() * 99) + 1,
    Math.floor(Math.random() * 999) + 100,
    new Date().getFullYear().toString().slice(-2),
  ];
  const prefixes = ["the", "real", "hey"];
  
  const suggestions: string[] = [];
  // suffix variants
  suffixes.forEach((s) => suggestions.push(`${base}${s}`));
  // prefix variants
  prefixes.forEach((p) => suggestions.push(`${p}${base}`));
  // underscore variant
  suggestions.push(`${base}_official`);
  
  return suggestions.slice(0, 6); // generate extras, we'll filter to available
}

export function useUsernameCheck(username: string, debounceMs = 500) {
  const [isChecking, setIsChecking] = useState(false);
  const [isTaken, setIsTaken] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const trimmed = username.trim();
    
    if (trimmed.length < 3) {
      setIsTaken(false);
      setSuggestions([]);
      setHasChecked(false);
      return;
    }

    setIsChecking(true);
    setHasChecked(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        // Check if username exists
        const { data, error } = await supabase
          .from("public_profiles" as any)
          .select("username")
          .eq("username", trimmed)
          .maybeSingle();

        if (error) {
          console.error("Username check error:", error);
          setIsChecking(false);
          return;
        }

        const taken = !!data;
        setIsTaken(taken);
        setHasChecked(true);

        if (taken) {
          // Generate candidates and check which are available
          const candidates = generateSuggestions(trimmed);
          const { data: existingUsernames } = await supabase
            .from("public_profiles" as any)
            .select("username")
            .in("username", candidates);

          const takenSet = new Set(
            (existingUsernames || []).map((u) => u.username)
          );
          const available = candidates.filter((c) => !takenSet.has(c));
          setSuggestions(available.slice(0, 3));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Username check failed:", err);
      } finally {
        setIsChecking(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [username, debounceMs]);

  return { isChecking, isTaken, suggestions, hasChecked };
}
