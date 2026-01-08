'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PerformanceList({ initialPerformances, festivalId, user }) {
    const [performances, setPerformances] = useState(initialPerformances)
    const [draggedItem, setDraggedItem] = useState(null)
    const supabase = createClient()
    const router = useRouter()

    // Update local state when server data changes (e.g. after adding a new performance)
    useEffect(() => {
        setPerformances(initialPerformances)
    }, [initialPerformances])

    const handleDragStart = (e, index) => {
        setDraggedItem(performances[index])
        e.dataTransfer.effectAllowed = 'move'
        // Create a ghost image if needed, or browser default is usually fine
        // e.dataTransfer.setData('text/html', e.target.parentNode)
        e.dataTransfer.setDragImage(e.target.parentNode, 20, 20)
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        const draggedOverItem = performances[index]

        // If dragging over itself, ignore
        if (draggedItem === draggedOverItem) {
            return
        }

        // Filter out the dragged item
        let items = performances.filter(p => p !== draggedItem)

        // Add the dragged item at the new position
        items.splice(index, 0, draggedItem)

        setPerformances(items)
    }

    const handleDragEnd = async () => {
        setDraggedItem(null)

        // Prepare updates for Supabase
        // We re-assign order_index based on the new array index (1-based to be safe or 0-based)
        const updates = performances.map((perf, index) => ({
            id: perf.id,
            order_index: index + 1, // Updating order based on new position
            // We need to include other required fields if we were using UPSERT with all fields, 
            // but just updating specific columns is better. 
            // However, supabase-js upsert usually wants the whole object or mainly the PK.
            // Let's use `upsert` but we need to be careful provided fields.
            // A better way is using a custom RPC or looping updates (slower) or upserting just ID and order_index if table permits partial
            // But standard 'upsert' works on rows. We should probably just iterate update if list is small, or use `upsert` with just changed fields if constraints allow.
        }))

        // Optimistic update is already done in UI via setPerformances

        // Batch update
        // Since we can't easily do a bulk "update distinct columns" without an upsert that might require other not-null columns if they are missing... 
        // Actually, upsert works fine if we provided the PK (id) and the fields to change.
        // BUT strict SQL UPDATE needs all NOT NULL fields if it interprets as INSERT? No, UPSERT (ON CONFLICT) updates.
        // Let's rely on standard upsert behavior: matched by PK, update provided columns.

        try {
            const { error } = await supabase
                .from('festival_performances')
                .upsert(updates.map(p => ({
                    id: p.id,
                    order_index: p.order_index,
                    festival_id: festivalId, // Required for RLS or constraints usually? Not strictly if ID is PK.
                    // We must include other NON-NULL fields if Supabase treats this as potential INSERT?
                    // No, properly configured UPSERT on existing ID just updates. 
                    // However, to be safe and simple, let's use the full object data merged with new order.
                    ...performances.find(old => old.id === p.id), // existing data
                    order_index: p.order_index // new order
                })))

            if (error) {
                saveReorder()
            }

            // Section Reordering (Move Whole Section)
            const moveSection = (sectionName, direction) => {
                const secIdx = sections.findIndex(s => s.name === sectionName)
                if ((direction === 'up' && secIdx === 0) || (direction === 'down' && secIdx === sections.length - 1)) return

                const targetSecIdx = direction === 'up' ? secIdx - 1 : secIdx + 1
                const targetSectionName = sections[targetSecIdx].name

                // Logic: Swap the "blocks" of items in the flat list.
                // 1. Extract items of sec A and sec B.
                // 2. In the flat list, remove both blocks.
                // 3. Insert B then A (or A then B) at the original position of the first block.

                // Simpler: Just swap the order indices of the items?
                // No, we want to maintain internal order.
                // Let's restructure the flat list.

                const newPerformances = [...performances]
                // ... (sorting logic is complex on flat list).
                // Let's rely on `sections` derived state to construct new flat list.

                const newSectionsOrder = [...sections]
                const temp = newSectionsOrder[secIdx]
                newSectionsOrder[secIdx] = newSectionsOrder[targetSecIdx]
                newSectionsOrder[targetSecIdx] = temp

                // Rebuild flat list from new section order
                const reorderedFlatList = []
                newSectionsOrder.forEach(sec => {
                    sec.items.forEach(item => reorderedFlatList.push(item))
                })

                // Re-index
                const finalFlatList = reorderedFlatList.map((p, idx) => ({ ...p, order_index: idx }))
                setPerformances(finalFlatList)

                // Persist immediately?
                // We need to call saveReorder with this new list.
                // Since setPerformances is async, we can't call saveReorder(finalFlatList) easily if saveReorder uses state.
                // Let's pass list to saveReorder or use effect.
                // For simplicity, I'll define a helper `persistList(list)`
                persistList(finalFlatList)
            }

            const persistList = async (list) => {
                const upsertData = list.map((p, index) => ({
                    id: p.id,
                    festival_id: festivalId,
                    order_index: index,
                    section: p.section,
                    name: p.name,
                    artist: p.artist,
                    content: p.content,
                    genre: p.genre,
                    is_secret: p.is_secret
                }))
                await supabase.from('festival_performances').upsert(upsertData)
            }

            const startEdit = (perf) => {
                setEditingId(perf.id)
                setEditForm(perf)
            }

            const cancelEdit = () => {
                setEditingId(null)
                setEditForm({})
            }

            const handleEditChange = (e) => {
                setEditForm({ ...editForm, [e.target.name]: e.target.value })
            }

            const saveEdit = async () => {
                if (!editingId) return

                // Optimistic Update
                const updatedList = performances.map(p => p.id === editingId ? { ...p, ...editForm } : p)
                setPerformances(updatedList)
                setEditingId(null)

                const { error } = await supabase
                    .from('festival_performances')
                    .update({
                        // name removed
                        artist: editForm.artist,
                        content: editForm.content,
                        genre: editForm.genre,
                        section: editForm.section,
                        is_secret: editForm.is_secret
                    })
                    .eq('id', editingId)

                if (error) {
                    console.error('Update error:', error)
                    alert('수정 실패: ' + error.message)
                    router.refresh() // Revert
                } else {
                    router.refresh()
                }
            }

            // ... handleDelete ... (unchanged)
            const handleDelete = async (id) => {
                if (!confirm('정말로 이 공연을 삭제하시겠습니까?')) return

                // Optimistic update
                setPerformances(performances.filter(p => p.id !== id))

                const { error } = await supabase
                    .from('festival_performances')
                    .delete()
                    .eq('id', id)

                if (error) {
                    console.error('Delete error:', error)
                    alert('삭제 실패: ' + error.message)
                    router.refresh() // Revert
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
                            const isCollapsed = collapsedSections[section.name]

                            return (
                                <div key={section.name} style={{ background: '#111', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                                    {/* Section Header */}
                                    <div
                                        style={{
                                            padding: '1rem 1.5rem',
                                            background: '#1a1a1a',
                                            borderBottom: isCollapsed ? 'none' : '1px solid #333',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => toggleSection(section.name)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{isCollapsed ? '▶' : '▼'}</span>
                                            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--primary)' }}>{section.name}</h3>
                                            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 400 }}>({section.items.length})</span>
                                        </div>

                                        {user && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => moveSection(section.name, 'up')} disabled={secIndex === 0} style={{ padding: '2px 8px', background: '#333', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', opacity: secIndex === 0 ? 0.3 : 1 }}>▲</button>
                                                <button onClick={() => moveSection(section.name, 'down')} disabled={secIndex === sections.length - 1} style={{ padding: '2px 8px', background: '#333', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', opacity: secIndex === sections.length - 1 ? 0.3 : 1 }}>▼</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section Items */}
                                    {!isCollapsed && (
                                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {section.items.map((perf, index) => { // Index is relative to section for display? Or absolute? User wanted 1, 2, 3.. per section.
                                                const isEditing = editingId === perf.id
                                                const displayIndex = index + 1 // Relative index 1-based

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
                                                            transition: 'all 0.2s ease',
                                                            position: 'relative',
                                                            alignItems: 'flex-start'
                                                        }}
                                                    >
                                                        {/* Drag Handle / Index */}
                                                        {!isEditing && (
                                                            <div style={{
                                                                fontSize: '1.2rem',
                                                                fontWeight: 700,
                                                                minWidth: '30px',
                                                                color: '#666',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                marginTop: '0.2rem'
                                                            }}>
                                                                {displayIndex}
                                                            </div>
                                                        )}

                                                        <div style={{ flex: 1 }}>
                                                            {isEditing ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                    {/* Edit Form (Simplified for brevity, similar to before but compact) */}
                                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                        <input name="section" value={editForm.section || '1부'} onChange={handleEditChange} placeholder="Section" style={{ width: '60px', padding: '0.3rem', background: '#333', color: 'white', border: 'none' }} />
                                                                        <input name="artist" value={editForm.artist} onChange={handleEditChange} placeholder="Artist" style={{ flex: 1, padding: '0.3rem', background: '#333', color: 'white', border: 'none', fontWeight: 'bold' }} />
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <input type="checkbox" name="is_secret" checked={editForm.is_secret} onChange={(e) => setEditForm({ ...editForm, is_secret: e.target.checked })} id={`edit-sec-${perf.id}`} />
                                                                        <label htmlFor={`edit-sec-${perf.id}`} style={{ marginLeft: '5px', fontSize: '0.8rem', color: '#ccc' }}>Secret</label>
                                                                    </div>
                                                                    <textarea name="content" value={editForm.content || ''} onChange={handleEditChange} rows={2} style={{ width: '100%', padding: '0.3rem', background: '#333', color: 'white', border: 'none' }} />
                                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                                        <button onClick={saveEdit} className="btn" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>저장</button>
                                                                        <button onClick={cancelEdit} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>취소</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                        <div>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                                                                <span style={{ fontSize: '0.7rem', background: '#333', padding: '0.1rem 0.4rem', borderRadius: '3px', color: '#aaa' }}>{perf.genre}</span>
                                                                                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{perf.artist}</h4>
                                                                            </div>
                                                                            <div style={{ color: '#ccc', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                                                                {perf.is_secret ? <span style={{ color: '#666', fontWeight: 700, fontStyle: 'italic' }}>Secret! 🤫</span> : perf.content}
                                                                            </div>
                                                                        </div>
                                                                        {/* Buttons */}
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                                            <button onClick={() => startEdit(perf)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.9rem' }}>✏️</button>
                                                                            <button onClick={() => handleDelete(perf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.9rem' }}>🗑️</button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {section.items.length === 0 && (
                                                <div style={{ padding: '1rem', color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
                                                    이 섹션에 공연이 없습니다. 드래그해서 추가해보세요!
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )
        }
