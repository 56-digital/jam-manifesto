'use client'

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { useSuggestionsStore, type Suggestion } from '@/lib/suggestions-store'

// ── Popover state ───────────────────────────────────────────────────────────

interface PopoverState {
  x: number
  y: number
  selectedText: string
  prefix: string
  suffix: string
}

// ── Component ───────────────────────────────────────────────────────────────

export function SuggestionLayer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [input, setInput] = useState('')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  const suggestions = useSuggestionsStore((s) => s.suggestions)
  const addSuggestion = useSuggestionsStore((s) => s.addSuggestion)
  const removeSuggestion = useSuggestionsStore((s) => s.removeSuggestion)

  // ── Highlight rendering (DOM walker) ────────────────────────────────────

  const applyHighlights = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Clean existing marks
    const existing = container.querySelectorAll('mark[data-suggestion-id]')
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
      // Skip if clicking inside the popover
      if (popoverRef.current?.contains(e.target as Node)) return

      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        // Don't close popover if clicking inside it
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
    }

    container.addEventListener('mouseup', handleMouseUp)
    return () => container.removeEventListener('mouseup', handleMouseUp)
  }, [])

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

  // ── Tooltip on hover ──────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'MARK' && target.dataset.suggestionId) {
        const id = target.dataset.suggestionId
        const s = suggestions.find((s) => s.id === id)
        if (!s) return

        const rect = target.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        setTooltip({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top,
          text: s.suggestion,
        })
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'MARK' && target.dataset.suggestionId) {
        setTooltip(null)
      }
    }

    container.addEventListener('mouseover', handleMouseOver)
    container.addEventListener('mouseout', handleMouseOut)
    return () => {
      container.removeEventListener('mouseover', handleMouseOver)
      container.removeEventListener('mouseout', handleMouseOut)
    }
  }, [suggestions])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {children}

      {/* Popover */}
      {popover && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: popover.y - 8,
            left: popover.x,
            transform: 'translate(-50%, -100%)',
            background: '#fff',
            border: '1px solid #273141',
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
              background: '#273141',
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

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y - 8,
            left: tooltip.x,
            transform: 'translate(-50%, -100%)',
            background: '#273141',
            color: '#fff',
            padding: '4px 10px',
            fontSize: '12px',
            borderRadius: '3px',
            zIndex: 1001,
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
              background: '#273141',
            }}
          />
        </div>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getSurroundingContext(range: Range, container: HTMLElement) {
  const CONTEXT_LEN = 30

  // Get full text content and find the range position within it
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

  // Find the right occurrence using prefix/suffix context
  const searchStr = suggestion.prefix + suggestion.selectedText + suggestion.suffix
  let contextIndex = fullText.indexOf(searchStr)
  let targetStart: number

  if (contextIndex !== -1) {
    targetStart = contextIndex + suggestion.prefix.length
  } else {
    // Fallback: find occurrence of selectedText near prefix
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

      // Score by matching chars
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

  // Walk text nodes to find the ones covering our range
  let charOffset = 0
  const nodesToWrap: { node: Text; start: number; end: number }[] = []

  walker.currentNode = container
  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text
    // Skip text nodes inside existing marks
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

  // Wrap matched portions
  for (const { node, start, end } of nodesToWrap) {
    const mark = document.createElement('mark')
    mark.dataset.suggestionId = suggestion.id

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
