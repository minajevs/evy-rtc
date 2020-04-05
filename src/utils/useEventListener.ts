import { useRef, useEffect, useState } from 'react'
import { EventEmitter } from 'events';

// event listener hook with mutating handler refence to optimize it for state changes
export const useEventListener = (eventName: string, handler: (...args: any[]) => void) => {
    const savedHandler = useRef<(...args: any[]) => void>(handler)
    const [events] = useState(new EventEmitter())

    // Update ref.current value if handler changes
    // instead of removing and adding listener everytime
    useEffect(() => {
        savedHandler.current = handler
    }, [handler])

    useEffect(
        () => {
            const listener = (event: any) => savedHandler.current(event)
            events.on(eventName, listener)

            return () => {
                events.removeListener(eventName, listener);
            };
        },
        [eventName] // Re-run if eventName or element changes
    );
};
