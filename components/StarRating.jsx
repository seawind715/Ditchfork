'use client'

import { useState } from 'react'

export default function StarRating({ rating, setRating, readOnly = false, size = 24 }) {
    const [hover, setHover] = useState(0)

    // 0 to 5 score
    const displayRating = hover || rating || 0

    const handleClick = (value) => {
        if (!readOnly && setRating) {
            setRating(value)
        }
    }

    const renderStar = (index) => {
        // index is 1, 2, 3, 4, 5
        // full: displayRating >= index
        // half: displayRating >= index - 0.5 && displayRating < index
        // empty: displayRating < index - 0.5

        const isFull = displayRating >= index
        const isHalf = displayRating >= index - 0.5 && displayRating < index

        return (
            <span
                key={index}
                style={{
                    cursor: readOnly ? 'default' : 'pointer',
                    fontSize: `${size}px`,
                    color: (isFull || isHalf) ? 'gold' : '#444',
                    position: 'relative',
                    display: 'inline-block',
                    width: `${size}px`,
                    height: `${size}px`,
                    lineHeight: `${size}px`,
                }}
                onMouseEnter={() => !readOnly && setHover(index)}
                onMouseLeave={() => !readOnly && setHover(0)}
                onClick={() => handleClick(index)}
            >
                ★
                {/* For more precise half-star interaction, we'd need complex events. 
                    For now, sticking to integer stars for input simplicity if desired, 
                    OR implementing half-star logic. 
                    Request said "0.5, 1 ... 4.5, 5". 
                    Let's implement simple half-star click logic using two spans? 
                    Actually, let's keep it simple for now: Input = Full stars, 
                    Display = can be float (from DB). 
                    Wait, user explicitly asked for 0.5, 1... input steps. 
                */}
            </span>
        )
    }

    // Implementing accurate half-star selection
    return (
        <div style={{ display: 'flex' }} onMouseLeave={() => !readOnly && setHover(0)}>
            {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} style={{ position: 'relative', width: size, height: size, cursor: readOnly ? 'default' : 'pointer' }}>
                    {/* Left Half */}
                    <div
                        style={{
                            position: 'absolute', left: 0, top: 0, width: '50%', height: '100%',
                            zIndex: 2
                        }}
                        onMouseEnter={() => !readOnly && setHover(idx - 0.5)}
                        onClick={() => handleClick(idx - 0.5)}
                    />
                    {/* Right Half */}
                    <div
                        style={{
                            position: 'absolute', right: 0, top: 0, width: '50%', height: '100%',
                            zIndex: 2
                        }}
                        onMouseEnter={() => !readOnly && setHover(idx)}
                        onClick={() => handleClick(idx)}
                    />

                    {/* Render Star */}
                    <span style={{
                        color: (displayRating >= idx) ? '#ffd700' : ((displayRating >= idx - 0.5) ? '#ffd700' : '#333'),
                        fontSize: size,
                        lineHeight: 1,
                        position: 'absolute', left: 0, top: 0, pointerEvents: 'none'
                    }}>
                        {(displayRating >= idx) ? '★' : (displayRating >= idx - 0.5 ? '★' : '★')}
                        {/* We use full star char for everything, color handles "filled" state. 
                            But for half star, we need a way to show half-filled. 
                            CSS gradients are best for this. */}
                    </span>
                    <span style={{
                        fontSize: size, lineHeight: 1, position: 'absolute', left: 0, top: 0, pointerEvents: 'none',
                        background: `linear-gradient(90deg, #ffd700 ${(displayRating >= idx ? 100 : (displayRating >= idx - 0.5 ? 50 : 0))}%, #333 0%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        ★
                    </span>
                </div>
            ))}
            {!readOnly && <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#888', alignSelf: 'center' }}>{displayRating}</span>}
        </div>
    )
}
