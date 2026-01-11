'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { uploadImage } from '@/utils/imageUpload'

export default function PerformanceList({ initialPerformances, festivalId, user, festivalType }) {
    const [performances, setPerformances] = useState(initialPerformances)
    const [draggedItem, setDraggedItem] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})

    // Collapsed sections state
    const [expandedSections, setExpandedSections] = useState({})

    const supabase = createClient()
    const router = useRouter()
    const isMusical = festivalType?.endsWith('_musical')

    // Sync with props
    useEffect(() => {
        setPerformances(initialPerformances)
    }, [initialPerformances])

    // --- Derived State: Sections ---
    const sections = performances.reduce((acc, perf) => {
        const sec = perf.section || '1부'
        if (!acc.find(s => s.name === sec)) {
            acc.push({ name: sec, items: [] })
        }
        acc.find(s => s.name === sec).items.push(perf)
        return acc
    }, []).sort((a, b) => {
        // Sort sections by their first item's order index if possible, or just string compare?
        // Let's rely on the order of appearance or explicit sort? 
        // User wants 1부, 2부 default order.
        return a.name.localeCompare(b.name)
    })

    // Ensure items in sections are sorted
    sections.forEach(sec => {
        sec.items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    })

    const toggleSection = (name) => {
        setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }))
    }

    // --- Actions ---

    const persistList = async (list) => {
        const upsertData = list.map((p, index) => ({
            id: p.id,
            festival_id: festivalId,
            order_index: index,
            section: p.section,
            artist: p.artist,
            content: p.content,
            genre: p.genre,
            is_secret: p.is_secret,
            image_url: p.image_url
        }))
        const { error } = await supabase.from('festival_performances').upsert(upsertData)
        if (error) console.error('Persist error:', error)
    }

    const handleDragStart = (e, perf) => {
        setDraggedItem(perf)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, targetPerf, targetSectionName) => {
        e.preventDefault()
        if (!draggedItem || draggedItem === targetPerf) return

        const newList = performances.filter(p => p.id !== draggedItem.id)
        const targetIndex = newList.indexOf(targetPerf)

        // Update section if moved to a different section
        const updatedItem = { ...draggedItem, section: targetSectionName }

        newList.splice(targetIndex, 0, updatedItem)

        // Re-index locally
        const reindexed = newList.map((p, idx) => ({ ...p, order_index: idx }))
        setPerformances(reindexed)
    }

    const handleDragEnd = () => {
        setDraggedItem(null)
        persistList(performances)
    }

    const moveSection = (sectionName, direction) => {
        const secIndex = sections.findIndex(s => s.name === sectionName)
        if (secIndex === -1) return
        if (direction === 'up' && secIndex === 0) return
        if (direction === 'down' && secIndex === sections.length - 1) return

        const targetIndex = direction === 'up' ? secIndex - 1 : secIndex + 1

        // Swap sections in the derived array order is not enough, we need to reorder the flat list.
        // Construct new flat list:
        const newSectionsOrder = [...sections]
        const temp = newSectionsOrder[secIndex]
        newSectionsOrder[secIndex] = newSectionsOrder[targetIndex]
        newSectionsOrder[targetIndex] = temp

        const newFlatList = []
        newSectionsOrder.forEach(sec => {
            sec.items.forEach(item => newFlatList.push(item))
        })

        const reindexed = newFlatList.map((p, idx) => ({ ...p, order_index: idx }))
        setPerformances(reindexed)
        persistList(reindexed)
    }

    // --- Editing ---
    const startEdit = (perf) => {
        setEditingId(perf.id)
        setEditForm({
            artist: perf.artist,
            content: perf.content,
            genre: perf.genre,
            section: perf.section,
            image_url: perf.image_url || '',
            is_secret: perf.is_secret
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleEditChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setEditForm({ ...editForm, [e.target.name]: value })
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!confirm('이미지를 업로드하시겠습니까? (자동으로 압축되어 저장됩니다)')) return

        try {
            const publicUrl = await uploadImage(file, 'images')
            setEditForm(prev => ({ ...prev, image_url: publicUrl }))
        } catch (error) {
            alert('이미지 업로드 실패: ' + error.message)
        }
    }

    const saveEdit = async () => {
        if (!editingId) return

        // Optimistic
        const updatedList = performances.map(p => p.id === editingId ? { ...p, ...editForm } : p)
        setPerformances(updatedList)
        const idToUpdate = editingId
        setEditingId(null)

        const { error } = await supabase
            .from('festival_performances')
            .update(editForm)
            .eq('id', idToUpdate)

        if (error) {
            alert('Error updating: ' + error.message)
            router.refresh()
        } else {
            router.refresh()
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        setPerformances(performances.filter(p => p.id !== id))
        const { error } = await supabase.from('festival_performances').delete().eq('id', id)
        if (error) {
            alert('Error deleting: ' + error.message)
            router.refresh()
        } else {
            router.refresh()
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
            {performances.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed #444', color: '#888' }}>
                    등록된 공연이 없습니다. 첫 번째 공연을 등록해주세요!
                </div>
            ) : (
                sections.map((section, secIndex) => {
                    const isExpanded = expandedSections[section.name]
                    return (
                        <div key={section.name} style={{ background: '#111', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                            <div
                                style={{
                                    padding: '1rem 1.5rem',
                                    background: '#1a1a1a',
                                    borderBottom: isExpanded ? '1px solid #333' : 'none',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => toggleSection(section.name)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{isExpanded ? '▼' : '▶'}</span>
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--primary)' }}>{section.name}</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>({section.items.length})</span>
                                </div>
                                {user && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => moveSection(section.name, 'up')} disabled={secIndex === 0} style={{ padding: '2px 8px', background: '#333', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', opacity: secIndex === 0 ? 0.3 : 1 }}>▲</button>
                                        <button onClick={() => moveSection(section.name, 'down')} disabled={secIndex === sections.length - 1} style={{ padding: '2px 8px', background: '#333', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', opacity: secIndex === sections.length - 1 ? 0.3 : 1 }}>▼</button>
                                    </div>
                                )}
                            </div>

                            {isExpanded && (
                                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {section.items.map((perf, index) => {
                                        const isEditing = editingId === perf.id
                                        const displayIndex = index + 1
                                        return (
                                            <div
                                                key={perf.id}
                                                draggable={!isEditing}
                                                onDragStart={(e) => !isEditing && handleDragStart(e, perf)}
                                                onDragOver={(e) => !isEditing && handleDragOver(e, perf, section.name)}
                                                onDragEnd={!isEditing && handleDragEnd}
                                                style={{
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    background: '#1a1a1a',
                                                    padding: '1rem',
                                                    borderLeft: '4px solid var(--primary)',
                                                    cursor: isEditing ? 'default' : 'grab',
                                                    opacity: draggedItem === perf ? 0.5 : 1,
                                                    transition: 'all 0.2s',
                                                    alignItems: 'flex-start'
                                                }}
                                            >
                                                {!isEditing && (
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, minWidth: '30px', color: '#666', textAlign: 'center', marginTop: '0.2rem' }}>{displayIndex}</div>
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    {isEditing ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <input name="section" value={editForm.section || (isMusical ? '1막' : '1부')} onChange={handleEditChange} placeholder={isMusical ? "Act" : "Section"} style={{ width: '60px', padding: '0.3rem', background: '#333', color: 'white', border: 'none' }} list="sec-opts" />
                                                                <datalist id="sec-opts">
                                                                    {isMusical ? (
                                                                        <>
                                                                            <option value="1막" /><option value="2막" />
                                                                        </>
                                                                    ) : (
                                                                        <><option value="1부" /><option value="2부" /></>
                                                                    )}
                                                                </datalist>
                                                                <input name="artist" value={editForm.artist} onChange={handleEditChange} placeholder={isMusical ? "Cast" : "Artist"} style={{ flex: 1, padding: '0.3rem', background: '#333', color: 'white', border: 'none', fontWeight: 'bold' }} />
                                                            </div>

                                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.8rem', padding: '0.5rem', border: '1px dashed #444', borderRadius: '6px', background: '#222' }}>
                                                                <div style={{ position: 'relative', width: '50px', height: '50px', background: '#333', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {editForm.image_url ? (
                                                                        <img src={editForm.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <span style={{ fontSize: '1.5rem', color: '#555' }}>📷</span>
                                                                    )}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '0.2rem' }}>공연 사진 추가/변경 (선택)</label>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleImageUpload}
                                                                        style={{
                                                                            width: '100%',
                                                                            fontSize: '0.8rem',
                                                                            color: '#ccc',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <input name="image_url" type="hidden" value={editForm.image_url || ''} />

                                                            <textarea name="content" value={editForm.content || ''} onChange={handleEditChange} rows={2} style={{ width: '100%', padding: '0.3rem', background: '#333', color: 'white', border: 'none', marginTop: '0.5rem' }} />
                                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                                <button onClick={saveEdit} className="btn" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>Save</button>
                                                                <button onClick={cancelEdit} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                                {/* Performance Image */}
                                                                {perf.image_url && (
                                                                    <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' }}>
                                                                        <img src={perf.image_url} alt={perf.artist} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                                                        <div style={{ width: '50px', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                                                                            {(perf.genre ? perf.genre.split(',').map(g => g.trim()) : []).map((g, i) => (
                                                                                <span key={i} style={{ fontSize: '0.7rem', background: '#333', padding: '0.1rem 0', width: '100%', textAlign: 'center', borderRadius: '3px', color: '#aaa', display: 'block' }}>{g}</span>
                                                                            ))}
                                                                        </div>
                                                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                                                                            {isMusical ? (
                                                                                <>
                                                                                    {perf.content || <span style={{ color: '#666', fontStyle: 'italic' }}>No Number Title</span>}
                                                                                    <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#aaa', marginLeft: '0.5rem' }}>
                                                                                        - {perf.artist}
                                                                                    </span>
                                                                                </>
                                                                            ) : (
                                                                                perf.artist
                                                                            )}
                                                                        </h4>
                                                                    </div>
                                                                    <div style={{ color: '#ccc', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                                                        {perf.is_secret ? (
                                                                            <span style={{ color: '#666', fontWeight: 700, fontStyle: 'italic' }}>Secret! 🤫</span>
                                                                        ) : (
                                                                            // For Musical, main content is used as title above.
                                                                            isMusical ? null : (
                                                                                perf.content || (!perf.image_url && <span style={{ color: '#555', fontSize: '0.9rem', fontStyle: 'italic' }}>공연 정보와 사진을 추가해주세요!</span>)
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                                <button onClick={() => startEdit(perf)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.9rem' }}>✏️</button>
                                                                <button onClick={() => handleDelete(perf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.9rem' }}>🗑️</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {section.items.length === 0 && <div style={{ color: '#666', textAlign: 'center' }}>No Items</div>}
                                </div>
                            )
                            }
                        </div>
                    )
                })
            )}
        </div>
    )
}
