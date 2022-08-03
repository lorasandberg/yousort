import React from 'react';
import { getAutomaticTypeDirectiveNames } from 'typescript';
import '../App.css';
import Dropzone from '../components/dropzone';
import { Item, ItemElement } from '../components/item';
import ItemForm from '../components/addItemForm';
import { useState, useEffect, useRef } from 'react';


// Parent view for adding, viewing and deleting items.
function Items(props: any) {

    const [a, setA] = useState<boolean>(true);
    const [b, setB] = useState<boolean>(true);

    const loadField = useRef<HTMLInputElement>(null);

    // Import items from a JSON file
    const handleSetFile = (file: Blob) => {

        let reader = new FileReader();
        reader.onloadend = function () {
            props.setItems([...props.getItems(), ...JSON.parse(reader.result as string)]);
        }
        reader.readAsText(file);
    }

    // Add item to the set.
    const handleItemAddForm = (id: number, name: string, image: string) => {
        props.setItems([...props.getItems(), { name: name, image: image, id: id }]);
    }

    // Save the current set into a json file.
    const downloadJSON = () => {
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(props.getItems())], { type: "text/json" });
        a.href = URL.createObjectURL(file);
        a.download = "YouSort Set.json";
        a.click();
    }

    const uploadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files === null)
            return;
        let reader = new FileReader();
        reader.onloadend = function () {
            if (props.getItems() !== null && props.getItems().length > 0)
                props.setItems([...props.getItems(), ...JSON.parse(reader.result as string)]);
            else
                props.setItems([...JSON.parse(reader.result as string)]);
        }
        reader.readAsText(e.target.files![0]);
    }

    // Get new unique ID for a new item.
    const getNewID = (): number => {
        let highest = 0;

        for (let i = 0; i < props.getItems().length; i++)
            if (props.getItems()[i].id > highest)
                highest = props.getItems()[i].id;
        return highest + 1;
    }

    const orderByID = (a: Item, b: Item): number => {
        if (a.id < b.id)
            return 1;
        if (a.id > b.id)
            return -1;
        return 0;
    }

    return (
        <>
            <div className="alignRight"><button className="onBlack" onClick={props.startSort}>Start sorting {props.getItems().length} items</button></div>
            <div id="options">
                <ItemForm handler={handleItemAddForm} getNewID={getNewID}></ItemForm>
                {/*<Dropzone fileHandler={handleSetFile}></Dropzone>*/}
            </div>
            <div id="itemListOptions">
                <input type="file" onChange={uploadJson} ref={loadField}></input>
                <h1>Items</h1>
                <div>
                    <button className="onBlack" onClick={downloadJSON}>Save</button>
                    <button className="onBlack" onClick={() => loadField.current!.click()}>Load</button>
                </div>
            </div>
            {props.getItems().sort(orderByID).map((item: Item) => {
                return (
                    <ItemElement key={item.id} item={item} deleteItem={props.deleteItem}></ItemElement>
                );
            })}
        </>
    );
}

export default Items;
