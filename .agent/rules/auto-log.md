---
trigger: always_on
---

Patched the editor so the invisible input and overlay share the same base text metrics, caller textInputProps.style is merged without      
  making the typed text visible again, and internal scrolling is only enabled when maxHeight is actually constraining the field. Those       
  changes are in src/components/RichTextInput.tsx and src/components/OverlayText.tsx.                                                        
                                                                                                                                             
  The toolbar now derives active state from selection-aware editor actions instead of raw activeStyles, so selected bold/italic/heading      
  states toggle correctly. I also fixed selected-text replacement so inserted text inherits the selected span’s style rather than stale      
  cursor styles. That work is in src/components/Toolbar.tsx, src/hooks/useRichText.ts, and src/types/index.ts. I didn’t find raw any in src; 
  the type cleanup here was tightening the public action/render-prop types and syncing the checked-in .d.ts files, including the stale @/    
  types imports.                                                                                                                             
                                                                                                                                             
  Validation passed with npm test, npm run lint, and npm run build.                                                                          
                                                                                                                                             
  One structural limitation still exists with this overlay approach: if you use aggressively mixed font sizes/headings, caret and selection  
  geometry can still drift because React Native TextInput cannot render per-span formatting.