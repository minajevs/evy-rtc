import * as React from 'react'

type Props = {
    providers: React.FC[]
}

const CombineProviders: React.FC<Props> = ({ providers, children }) => {
    const [First, ...Rest] = providers

    if (First !== undefined)
        return (
            <First>
                <CombineProviders providers={Rest}>
                    {children}
                </CombineProviders>
            </First>
        )

    return (<>{children}</>)
}

export default CombineProviders
