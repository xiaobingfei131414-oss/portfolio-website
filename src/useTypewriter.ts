import { useEffect, useState } from 'react';

export function startTypewriter(text: string, update: (text: string, done: boolean) => void, speed = 38, startDelay = 600) {
  const characters = Array.from(text);
  let interval: ReturnType<typeof setInterval> | undefined;
  let position = 0;
  const delay = setTimeout(() => {
    if (!characters.length) { update('', true); return; }
    interval = setInterval(() => {
      position += 1;
      const done = position >= characters.length;
      update(characters.slice(0, position).join(''), done);
      if (done) clearInterval(interval);
    }, speed);
  }, startDelay);
  return () => { clearTimeout(delay); clearInterval(interval); };
}

export function useTypewriter(text: string, speed = 38, startDelay = 600, instant = false) {
  const [state, setState] = useState({ displayed: instant ? text : '', done: instant });
  useEffect(() => {
    if (instant) { setState({ displayed: text, done: true }); return; }
    setState({ displayed: '', done: false });
    return startTypewriter(text, (displayed, done) => setState({ displayed, done }), speed, startDelay);
  }, [text, speed, startDelay, instant]);
  return state;
}
