import { IncomingMessage } from "http";
import { useState, useRef, useEffect } from "react";

function ItemForm(props : any) {

    const RESIZED_IMAGE_SIZE = 250;

    const imageFileField = useRef<HTMLInputElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);

    const [dataUrl, setDataUrl] = useState<string>("");
    const [backgroundImage, setBackgroundImage ] = useState<{}>({});

    const [name, setName] = useState<string>("");
    const form = useRef(null);

    const imageStyle = {
        backgroundImage: "url(" + dataUrl + ")"
    };

    // Display image whenever its updated.
    useEffect(() => {
        setBackgroundImage({
            backgroundImage: "url(" + dataUrl + ")"
        })
    }, [dataUrl]);

    // Add item to the set.
    const handleForm = () => { 
        props.handler(props.getNewID(), name, dataUrl);
        setName("");
        setDataUrl("");
    }

    // Fetch the item from input file field, load, resize, and display.
    const setImage = (e: any) => {
        var reader = new FileReader();
        reader.onloadend = function () {
            setDataUrl(reader.result as string);
            resizeImage(reader.result as string);
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    // Resize images using the canvas element
    const resizeImage = (dataUrl : string) => {
        let context = canvas.current!.getContext("2d");

        let image = new Image();

        image.onload = () => {

            // Scale the image so that it covers the canvas exactly for its shorter dimension.
            // The larger dimension will be cropped.
            let scale = Math.max(RESIZED_IMAGE_SIZE / image.width, RESIZED_IMAGE_SIZE / image.height);

            context!.clearRect(0,0,RESIZED_IMAGE_SIZE,RESIZED_IMAGE_SIZE);
            context!.drawImage(image, 0, 0,
                image.width, image.height, 
                RESIZED_IMAGE_SIZE / 2 - image.width * scale / 2,
                RESIZED_IMAGE_SIZE / 2 - image.height * scale / 2,
                image.width * scale, image.height * scale);
            setDataUrl(canvas.current!.toDataURL());
        }
        image.src = dataUrl;
    }

    const uploadImage = () => {
        if(imageFileField.current)
            imageFileField.current.click();
    }
    
    return (
        <div className="formContainer">
            <form ref={form} className="addItemForm">
            <input ref={imageFileField} type="file" name="image" className="hidden" onChange={setImage} />
                <div className="imageContainer">
                    <label>Image</label>
                    <div className="image" onClick={uploadImage} style={backgroundImage}></div>
                </div>
                <div className="nameContainer">
                    <label htmlFor="name">Name</label>
                    <input className="name" type="text" placeholder="Name of the item" name="name" value={name} onChange={(e) => { setName(e.target.value); }} />
                </div>
            </form>
            <div className="addItem">
                <input type="button" value="Add Item" onClick={handleForm} />
                <canvas ref={canvas} className="hidden" width={RESIZED_IMAGE_SIZE} height={RESIZED_IMAGE_SIZE}></canvas>
            </div>
        </div>
    );
}

export default ItemForm;