import { useRef, useEffect, useState, DependencyList } from 'react'
import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types/types/src'

// event listener hook with mutating handler refence to optimize it for state changes
export const useEventListener = <E extends Record<string, (...arg: any) => any>, EK extends keyof E>(
    eventName: EK,
    events: StrictEventEmitter<EventEmitter, E>,
    handler: E[EK],
    deps: DependencyList
) => {
    const savedHandler = useRef<E[EK]>(handler)

    // Update ref.current value if handler changes
    // instead of removing and adding listener everytime
    useEffect(() => {
        savedHandler.current = handler
    }, deps)

    useEffect(
        () => {
            console.log(eventName, handler, deps)
            const listener = (...args: any[]) => savedHandler.current(...args)
            events.on(eventName, listener)

            return () => {
                events.removeListener(eventName, listener);
            };
        },
        [eventName] // Re-run if eventName or element changes
    );
};
