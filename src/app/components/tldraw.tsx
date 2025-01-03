import React from "react"
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

type Props = {}

const Drawing : React.FC<Props> = ({}) => {
    return (
        <div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw />
		</div>
    )
}

export default Drawing
