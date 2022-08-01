import React, { DragEventHandler, useRef } from "react";

// A file input dropzone
function Dropzone(props: any) {

    const fileInput = useRef<any>(null);

    const dropHandler = (e: React.DragEvent) => {
        e.preventDefault();
        props.fileHandler(e.dataTransfer.items[0].getAsFile());
    }

    const dragOverHandler = (e: React.DragEvent) => {
        e.preventDefault();
    }

    const clickHandler = (e : React.MouseEvent) => {
        e.preventDefault();
        fileInput.current?.click();
    }

    const fileDialogHandler = (e : React.ChangeEvent<HTMLInputElement>) => {
        if(e.currentTarget.files !== null)
            props.fileHandler(e.currentTarget.files[0]);
    }

    return (
        <>
            <div className="dropzone" onDrop={dropHandler} onDragOver={dragOverHandler} onClick={clickHandler}>
                <span>Get items from a file</span>
            </div>
            <input className="hidden" type="file" ref={fileInput} onChange={fileDialogHandler}></input>
        </>
    )
}

export default Dropzone;