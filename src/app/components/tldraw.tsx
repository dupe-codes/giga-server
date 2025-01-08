import { FC, useCallback, useEffect, useState } from "react";
import {
  Tldraw,
  TLStoreSnapshot,
  getSnapshot,
  loadSnapshot,
  useEditor,
} from "tldraw";
import "tldraw/tldraw.css";

// TODO: Figure out how to share types between server and client

interface DrawingData {
  document: JSON;
  session: JSON;
}

interface GetDrawingResponse {
  name: string;
  drawing: DrawingData;
}

function SnapshotToolbar() {
  const editor = useEditor();

  // --- SAVE ---
  const save = useCallback(async () => {
    const drawing_name = prompt("Enter a name for the drawing:");
    const { document, session } = getSnapshot(editor.store);

    const payload = {
      name: drawing_name,
      drawing: {
        document,
        session,
      },
    };

    try {
      const response = await fetch("/drawing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Save request failed with error code: ${response.status}`,
        );
      }

      setShowCheckMark(true);
    } catch (error) {
      console.error("Failed to save drawing: ", error);
    }
  }, [editor]);

  // --- LOAD ---
  const load = useCallback(async () => {
    try {
      const response = await fetch("/drawing");
      if (!response.ok) {
        throw new Error(`GET /drawing failed with status: ${response.status}`);
      }

      const data = (await response.json()) as { drawings: string[] };
      if (!data.drawings || data.drawings.length === 0) {
        alert("No drawings found!");
        return;
      }
      const drawings = data.drawings;

      const choice = prompt(
        `Available drawings:\n${drawings.join("\n")}\n\nPlease type one exactly:`,
      );
      if (!choice) return;
      console.log("User chose:", choice);

      const drawingResponse = await fetch(`/drawing/${choice}`);
      if (!drawingResponse.ok) {
        throw new Error(
          `GET /drawings/${choice} failed with status: ${drawingResponse.status}`,
        );
      }

      const drawingData = (await drawingResponse.json()) as GetDrawingResponse;
      console.log("Loaded drawing:", drawingData.name);

      const snapshot = drawingData.drawing;
      console.log("Drawing data:", snapshot);
      loadSnapshot(editor.store, snapshot as unknown as TLStoreSnapshot);
    } catch (error) {
      console.error("Failed to load drawings: ", error);
    }
  }, [editor]);

  // --- CHECKMARK STATE ---
  const [showCheckMark, setShowCheckMark] = useState(false);
  useEffect(() => {
    if (showCheckMark) {
      const timeout = setTimeout(() => {
        setShowCheckMark(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
    return;
  });

  return (
    <div
      style={{
        padding: 20,
        pointerEvents: "all",
        display: "flex",
        gap: "10px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          transition: "transform 0.2s ease, opacity 0.2s ease",
          transform: showCheckMark ? `scale(1)` : `scale(0.5)`,
          opacity: showCheckMark ? 1 : 0,
        }}
      >
        Saved ✅
      </span>
      <button
        onClick={() => {
          save();
          setShowCheckMark(true);
        }}
      >
        Save drawing
      </button>
      <button onClick={load}>Load drawing</button>
    </div>
  );
}

const Drawing: FC<object> = () => {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="giga"
        components={{
          SharePanel: SnapshotToolbar,
        }}
      />
    </div>
  );
};

export default Drawing;
