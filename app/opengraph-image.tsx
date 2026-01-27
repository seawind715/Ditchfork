import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Ditchfork'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        color: 'white',
                        fontSize: 128,
                        fontWeight: 900,
                        letterSpacing: '-0.05em',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    Ditchfork
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
