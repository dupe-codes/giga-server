import { React, useCallback, useEffect, useState } from "react"
import { TLEditorSnapshot, Tldraw, getSnapshot, loadSnapshot, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'

// TODO: update component to ask for snapshot file name and POST to server to save
//       if already saved as snapshot, autopopulate file name as the existing
//       also get list of existing snapshots from server, show in dropdown to load
function SnapshotToolbar() {
	const editor = useEditor()

	const save = useCallback(() => {
		const { document, session } = getSnapshot(editor.store)
		localStorage.setItem('snapshot', JSON.stringify({ document, session }))

	}, [editor])

	const load = useCallback(() => {
		const snapshot = localStorage.getItem('snapshot')
		if (!snapshot) return
		loadSnapshot(editor.store, JSON.parse(snapshot))
	}, [editor])

	const [showCheckMark, setShowCheckMark] = useState(false)
	useEffect(() => {
		if (showCheckMark) {
			const timeout = setTimeout(() => {
				setShowCheckMark(false)
			}, 1000)
			return () => clearTimeout(timeout)
		}
		return
	})

	return (
		<div style={{ padding: 20, pointerEvents: 'all', display: 'flex', gap: '10px' }}>
			<span
				style={{
					display: 'inline-block',
					transition: 'transform 0.2s ease, opacity 0.2s ease',
					transform: showCheckMark ? `scale(1)` : `scale(0.5)`,
					opacity: showCheckMark ? 1 : 0,
				}}
			>
				Saved ✅
			</span>
			<button
				onClick={() => {
					save()
					setShowCheckMark(true)
				}}
			>
				Save Snapshot
			</button>
			<button onClick={load}>Load Snapshot</button>
		</div>
	)
}

type Props = {}

const Drawing : React.FC<Props> = ({}) => {
    return (
        <div style={{ position: 'fixed', inset: 0 }}>
            <Tldraw
              persistenceKey="giga"
              components={{
			    SharePanel: SnapshotToolbar,
			  }} />
		</div>
    )
}

export default Drawing
