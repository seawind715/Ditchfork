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
                console.error('Reorder error:', error)
                alert('순서 저장 중 오류가 발생했습니다.')
            } else {
                router.refresh()
            }
        } catch (e) {
            console.error('Reorder exception:', e)
        }
    }

    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})

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
                name: editForm.name,
                artist: editForm.artist,
                content: editForm.content,
                genre: editForm.genre
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

    const handleDelete = async (id) => {
        if (!confirm('의도치 않은 삭제는 다른 사용자에게 피해를 줄 수 있습니다. 정말 삭제하시겠습니까?')) return

        // Optimistic
        const updatedList = performances.filter(p => p.id !== id)
        setPerformances(updatedList)

        const { error } = await supabase
            .from('festival_performances')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Delete error:', error)
            alert('삭제 실패: ' + error.message)
            router.refresh()
        } else {
            router.refresh()
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            {performances.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed #444', color: '#888' }}>
                    등록된 공연이 없습니다. 첫 번째 공연을 등록해주세요!
                </div>
            ) : (
                performances.map((perf, index) => {
                    const isEditing = editingId === perf.id
                    return (
                        <div
                            key={perf.id}
                            draggable={!isEditing}
                            onDragStart={(e) => !isEditing && handleDragStart(e, index)}
                            onDragOver={(e) => !isEditing && handleDragOver(e, index)}
                            onDragEnd={!isEditing && handleDragEnd}
                            style={{
                                display: 'flex',
                                gap: '1.5rem',
                                background: '#1a1a1a',
                                padding: '1.5rem',
                                borderLeft: '4px solid var(--primary)',
                                cursor: isEditing ? 'default' : 'grab',
                                opacity: draggedItem === perf ? 0.5 : 1,
                                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                position: 'relative'
                            }}
                        >
                            {!isEditing && (
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    minWidth: '30px',
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'grab'
                                }}>
                                    <span title="드래그해서 순서 변경">☰</span>
                                </div>
                            )}

                            <div style={{ flex: 1 }}>
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select name="genre" value={editForm.genre} onChange={handleEditChange} style={{ padding: '0.3rem', background: '#333', color: 'white', border: 'none' }}>
                                                <option value="Band">밴드</option>
                                                <option value="Rap">랩/힙합</option>
                                                <option value="Dance">댄스</option>
                                                <option value="Song">보컬</option>
                                                <option value="Gag">개그</option>
                                                <option value="Other">기타</option>
                                            </select>
                                            <input name="name" value={editForm.name || ''} onChange={handleEditChange} placeholder="공연명" style={{ flex: 1, padding: '0.3rem', background: '#333', color: 'white', border: 'none' }} />
                                        </div>
                                        <input name="artist" value={editForm.artist} onChange={handleEditChange} placeholder="아티스트" style={{ padding: '0.3rem', background: '#333', color: 'white', border: 'none', fontWeight: 'bold' }} />
                                        <textarea name="content" value={editForm.content || ''} onChange={handleEditChange} rows={3} placeholder="내용 (비워두면 Secret)" style={{ padding: '0.3rem', background: '#333', color: 'white', border: 'none' }} />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button onClick={saveEdit} className="btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>저장</button>
                                            <button onClick={cancelEdit} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', border: '1px solid #555' }}>취소</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <span style={{ fontSize: '0.8rem', background: '#333', padding: '0.2rem 0.6rem', borderRadius: '4px', color: '#ccc' }}>
                                                    {perf.genre || '장르 미정'}
                                                </span>
                                                <h4 style={{ fontSize: '1.3rem', margin: 0 }}>{perf.name || '공연명 없음'}</h4>
                                            </div>
                                            {/* Action Buttons */}
                                            <div style={{ display: 'flex', gap: '0.5rem', opacity: 0.5 }} className="hover-opacity-100">
                                                <button onClick={() => startEdit(perf)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>✏️</button>
                                                <button onClick={() => handleDelete(perf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>🗑️</button>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                            {perf.artist}
                                        </div>
                                        <div style={{ color: '#ccc', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                            {perf.content ? perf.content : (
                                                <span style={{
                                                    color: '#666',
                                                    fontStyle: 'italic',
                                                    fontWeight: 700,
                                                    fontSize: '1.2rem',
                                                    letterSpacing: '2px',
                                                    textShadow: '0 0 10px rgba(255,255,255,0.1)'
                                                }}>
                                                    Secret! 🤫
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}
