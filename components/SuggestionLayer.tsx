'use client'

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { useSuggestionsStore, type Suggestion } from '@/lib/suggestions-store'

const FG = '#273141'

// ── Popover state ───────────────────────────────────────────────────────────

interface PopoverState {
  x: number
  y: number
  selectedText: string
  prefix: string
  suffix: string
}

interface ModalState {
  ids: string[]
  x: number
  y: number
}

// ── Component ───────────────────────────────────────────────────────────────

export function SuggestionLayer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [input, setInput] = useState('')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Drag state
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)

  const suggestions = useSuggestionsStore((s) => s.suggestions)
  const addSuggestion = useSuggestionsStore((s) => s.addSuggestion)
  const updateSuggestion = useSuggestionsStore((s) => s.updateSuggestion)
  const removeSuggestion = useSuggestionsStore((s) => s.removeSuggestion)

  // ── Highlight rendering (DOM walker) ────────────────────────────────────

  const applyHighlights = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Clean existing marks
    const existing = container.querySelectorAll('mark[data-suggestion-ids]')
    existing.forEach((mark) => {
      const parent = mark.parentNode
      if (!parent) return
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
      parent.removeChild(mark)
      parent.normalize()
    })

    // Apply each suggestion
    for (const suggestion of suggestions) {
      wrapTextMatch(container, suggestion)
    }
  }, [suggestions])

  useEffect(() => {
    applyHighlights()
  }, [applyHighlights])

  // ── Selection capture ─────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseUp = (e: MouseEvent) => {
      // Skip if clicking inside the popover or modal
      if (popoverRef.current?.contains(e.target as Node)) return
      if (modalRef.current?.contains(e.target as Node)) return

      // Handle click on highlighted mark — open modal
      const target = (e.target as HTMLElement).closest('mark[data-suggestion-ids]') as HTMLElement | null
      if (target) {
        const idsStr = target.dataset.suggestionIds ?? ''
        const ids = idsStr.split(',').filter(Boolean)
        if (ids.length === 0) return

        const rect = target.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        setModal({
          ids,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.bottom - containerRect.top + 8,
        })
        setEditingId(null)
        setEditText('')
        setPopover(null)
        setTooltip(null)
        window.getSelection()?.removeAllRanges()
        return
      }

      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        if (!popoverRef.current?.contains(e.target as Node)) {
          setPopover(null)
        }
        return
      }

      const range = sel.getRangeAt(0)
      const text = sel.toString().trim()

      if (text.length < 3) return

      // Check if selection is inside a data-no-suggestions element
      let node: Node | null = range.startContainer
      while (node && node !== container) {
        if (node instanceof HTMLElement && node.hasAttribute('data-no-suggestions')) {
          return
        }
        node = node.parentNode
      }

      // Get prefix/suffix context
      const { prefix, suffix } = getSurroundingContext(range, container)

      const rect = range.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      setPopover({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
        selectedText: text,
        prefix,
        suffix,
      })
      setInput('')
      setModal(null)
    }

    container.addEventListener('mouseup', handleMouseUp)
    return () => container.removeEventListener('mouseup', handleMouseUp)
  }, [suggestions])

  // ── Close modal on outside click ──────────────────────────────────────────

  useEffect(() => {
    if (!modal) return
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current?.contains(e.target as Node)) return
      const target = (e.target as HTMLElement).closest('mark[data-suggestion-ids]')
      if (target) return
      setModal(null)
      setEditingId(null)
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [modal])

  // ── Dragging ──────────────────────────────────────────────────────────────

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea')) return
    e.preventDefault()
    if (!modal) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: modal.x, origY: modal.y }

    const handleMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      setModal((prev) =>
        prev ? { ...prev, x: dragRef.current!.origX + dx, y: dragRef.current!.origY + dy } : null,
      )
    }

    const handleUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  // ── Save suggestion ───────────────────────────────────────────────────────

  const handleSave = () => {
    if (!popover || !input.trim()) return
    addSuggestion({
      selectedText: popover.selectedText,
      suggestion: input.trim(),
      prefix: popover.prefix,
      suffix: popover.suffix,
    })
    setPopover(null)
    setInput('')
    window.getSelection()?.removeAllRanges()
  }

  // ── Modal actions ─────────────────────────────────────────────────────────

  const handleEditSave = (id: string) => {
    if (!editText.trim()) return
    updateSuggestion(id, editText.trim())
    setEditingId(null)
  }

  const handleRemove = (id: string) => {
    removeSuggestion(id)
    if (!modal) return
    const remaining = modal.ids.filter((i) => i !== id)
    if (remaining.length === 0) {
      setModal(null)
      setEditingId(null)
    } else {
      setModal({ ...modal, ids: remaining })
      if (editingId === id) setEditingId(null)
    }
  }

  // ── Tooltip on hover ──────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseOver = (e: MouseEvent) => {
      if (modal) return
      const target = (e.target as HTMLElement).closest('mark[data-suggestion-ids]') as HTMLElement | null
      if (!target) return

      const idsStr = target.dataset.suggestionIds ?? ''
      const ids = idsStr.split(',').filter(Boolean)
      const matched = suggestions.filter((s) => ids.includes(s.id))
      if (matched.length === 0) return

      const rect = target.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const text = matched.length === 1
        ? matched[0].suggestion
        : `${matched.length} suggestions — click to view`

      setTooltip({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
        text,
      })
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('mark[data-suggestion-ids]')
      if (target) setTooltip(null)
    }

    container.addEventListener('mouseover', handleMouseOver)
    container.addEventListener('mouseout', handleMouseOut)
    return () => {
      container.removeEventListener('mouseover', handleMouseOver)
      container.removeEventListener('mouseout', handleMouseOut)
    }
  }, [suggestions, modal])

  // Get suggestions for modal
  const modalSuggestions = modal
    ? modal.ids.map((id) => suggestions.find((s) => s.id === id)).filter(Boolean) as Suggestion[]
    : []

  // For the header excerpt, use the first suggestion's selectedText
  const excerptText = modalSuggestions.length > 0 ? modalSuggestions[0].selectedText : ''

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {children}

      {/* Popover — new suggestion input */}
      {popover && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: popover.y - 8,
            left: popover.x,
            transform: 'translate(-50%, -100%)',
            background: '#fff',
            border: `1px solid ${FG}`,
            padding: '8px',
            zIndex: 1000,
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Add suggestion..."
            autoFocus
            style={{
              border: '1px solid #ccc',
              padding: '4px 8px',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              width: '200px',
            }}
          />
          <button
            onClick={handleSave}
            style={{
              background: FG,
              color: '#fff',
              border: 'none',
              padding: '4px 10px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Tooltip — hover preview */}
      {tooltip && !modal && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y - 8,
            left: tooltip.x,
            transform: 'translate(-50%, -100%)',
            background: FG,
            color: '#fff',
            padding: '4px 10px',
            fontSize: '12px',
            borderRadius: '3px',
            zIndex: 999,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {tooltip.text}
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '8px',
              height: '8px',
              background: FG,
            }}
          />
        </div>
      )}

      {/* Draggable modal — suggestion list */}
      {modal && modalSuggestions.length > 0 && (
        <div
          ref={modalRef}
          style={{
            position: 'absolute',
            top: modal.y,
            left: modal.x,
            transform: 'translateX(-50%)',
            background: '#fff',
            border: `1px solid ${FG}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1001,
            width: '340px',
            maxWidth: 'calc(100vw - 48px)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {/* Drag handle / header */}
          <div
            onMouseDown={handleDragStart}
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #e8eaec',
              cursor: 'grab',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '11px', color: '#5a6e7e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {modalSuggestions.length === 1 ? 'Suggestion' : `${modalSuggestions.length} Suggestions`}
            </span>
            <button
              onClick={() => { setModal(null); setEditingId(null) }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                color: '#5a6e7e',
                cursor: 'pointer',
                padding: '0 2px',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>

          {/* Highlighted text excerpt */}
          <div style={{ padding: '10px 12px 6px', fontSize: '12px', color: '#5a6e7e' }}>
            <span style={{ background: 'rgba(255, 230, 0, 0.35)', padding: '1px 3px', borderRadius: '2px', color: FG }}>
              &ldquo;{excerptText.length > 60 ? excerptText.slice(0, 60) + '...' : excerptText}&rdquo;
            </span>
          </div>

          {/* Suggestion list */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {modalSuggestions.map((s, i) => (
              <div
                key={s.id}
                style={{
                  padding: '8px 12px',
                  borderTop: i > 0 ? '1px solid #e8eaec' : undefined,
                }}
              >
                {editingId === s.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(s.id) }
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                      rows={3}
                      style={{
                        border: '1px solid #ccc',
                        padding: '6px 8px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        resize: 'vertical',
                        lineHeight: 1.5,
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          background: 'none',
                          border: '1px solid #ccc',
                          padding: '3px 10px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: '#5a6e7e',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(s.id)}
                        style={{
                          background: FG,
                          color: '#fff',
                          border: 'none',
                          padding: '3px 10px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: 1.5,
                      color: FG,
                      margin: '0 0 6px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {s.suggestion}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => { setEditText(s.suggestion); setEditingId(s.id) }}
                        style={{
                          background: 'none',
                          border: `1px solid ${FG}`,
                          padding: '2px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          color: FG,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(s.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #c0392b',
                          padding: '2px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          color: '#c0392b',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getSurroundingContext(range: Range, container: HTMLElement) {
  const CONTEXT_LEN = 30

  const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let offset = 0
  let startOffset = 0
  let endOffset = 0

  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode
    const len = node.textContent?.length ?? 0

    if (node === range.startContainer) {
      startOffset = offset + range.startOffset
    }
    if (node === range.endContainer) {
      endOffset = offset + range.endOffset
    }
    offset += len
  }

  const fullText = container.textContent ?? ''
  const prefix = fullText.slice(Math.max(0, startOffset - CONTEXT_LEN), startOffset)
  const suffix = fullText.slice(endOffset, endOffset + CONTEXT_LEN)

  return { prefix, suffix }
}

function wrapTextMatch(container: HTMLElement, suggestion: Suggestion) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const fullText = container.textContent ?? ''

  const searchStr = suggestion.prefix + suggestion.selectedText + suggestion.suffix
  const contextIndex = fullText.indexOf(searchStr)
  let targetStart: number

  if (contextIndex !== -1) {
    targetStart = contextIndex + suggestion.prefix.length
  } else {
    let idx = 0
    let bestIdx = -1
    let bestScore = -1

    while (true) {
      idx = fullText.indexOf(suggestion.selectedText, idx)
      if (idx === -1) break

      let score = 0
      const beforeText = fullText.slice(Math.max(0, idx - suggestion.prefix.length), idx)
      const afterText = fullText.slice(
        idx + suggestion.selectedText.length,
        idx + suggestion.selectedText.length + suggestion.suffix.length,
      )

      for (let i = 0; i < Math.min(beforeText.length, suggestion.prefix.length); i++) {
        if (beforeText[beforeText.length - 1 - i] === suggestion.prefix[suggestion.prefix.length - 1 - i]) score++
      }
      for (let i = 0; i < Math.min(afterText.length, suggestion.suffix.length); i++) {
        if (afterText[i] === suggestion.suffix[i]) score++
      }

      if (score > bestScore) {
        bestScore = score
        bestIdx = idx
      }
      idx++
    }

    if (bestIdx === -1) return
    targetStart = bestIdx
  }

  const targetEnd = targetStart + suggestion.selectedText.length

  // Check if an existing mark already covers this exact range — if so, append ID
  const existingMarks = container.querySelectorAll('mark[data-suggestion-ids]')
  for (const mark of existingMarks) {
    const markText = mark.textContent ?? ''
    if (markText === suggestion.selectedText) {
      // Verify position by checking surrounding text
      const markEl = mark as HTMLElement
      const ids = (markEl.dataset.suggestionIds ?? '').split(',').filter(Boolean)
      if (!ids.includes(suggestion.id)) {
        markEl.dataset.suggestionIds = [...ids, suggestion.id].join(',')
      }
      return
    }
  }

  let charOffset = 0
  const nodesToWrap: { node: Text; start: number; end: number }[] = []

  walker.currentNode = container
  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text
    if (textNode.parentElement?.tagName === 'MARK') {
      charOffset += textNode.length
      continue
    }

    const nodeStart = charOffset
    const nodeEnd = charOffset + textNode.length

    if (nodeEnd > targetStart && nodeStart < targetEnd) {
      nodesToWrap.push({
        node: textNode,
        start: Math.max(0, targetStart - nodeStart),
        end: Math.min(textNode.length, targetEnd - nodeStart),
      })
    }

    charOffset += textNode.length
    if (charOffset >= targetEnd) break
  }

  for (const { node, start, end } of nodesToWrap) {
    const mark = document.createElement('mark')
    mark.dataset.suggestionIds = suggestion.id

    if (start === 0 && end === node.length) {
      node.parentNode?.replaceChild(mark, node)
      mark.appendChild(node)
    } else {
      const before = start > 0 ? node.splitText(start) : node
      if (end - start < before.length) {
        before.splitText(end - start)
      }
      before.parentNode?.replaceChild(mark, before)
      mark.appendChild(before)
    }
  }
}
