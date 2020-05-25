export const updateAt =
    <T>(array: Array<T>, index: number, newValue: T) =>
        array.map((value, i) =>
            i === index
                ? newValue
                : value)