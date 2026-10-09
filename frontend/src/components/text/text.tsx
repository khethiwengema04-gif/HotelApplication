import React from 'react'

type Props = {
    varient?: String,
    children: React.ReactNode,
    style?: React.CSSProperties
}

export const Text: React.FC<Props> = ({ varient, children, style }) => {
    if (varient === 'h1') return <h1 style={style}>{children}</h1>
    if (varient === 'h2') return <h2 style={style}>{children}</h2>
    if (varient === 'h3') return <h3 style={style}>{children}</h3>
    if (varient === 'p1') return <p style={style}>{children}</p>
    if (varient === 'p2') return <p style={style}>{children}</p>
    if (varient === 'span') return <span style={style}>{children}</span>

    return (
        <div style={style}>{children}</div>

    )

}