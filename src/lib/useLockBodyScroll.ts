"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";

// Блокирует прокрутку фона, пока открыто модальное окно (иначе на телефоне,
// докрутив попап до конца, можно было "провалиться" в скролл интерфейса под ним).
// Счётчик поддерживает несколько одновременно смонтированных модалок.
export function useLockBodyScroll() {
  useEffect(() => {
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount++;
    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, []);
}
