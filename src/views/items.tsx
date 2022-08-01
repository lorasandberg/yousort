import React from 'react';
import { getAutomaticTypeDirectiveNames } from 'typescript';
import '../App.css';
import Dropzone from '../components/dropzone';
import { Item, ItemElement } from '../components/item';
import ItemForm from '../components/addItemForm';
import { useState, useEffect } from 'react';


// Parent view for adding, viewing and deleting items.
function Items(props: any) {

    const [a, setA] = useState<boolean>(true);
    const [b, setB] = useState<boolean>(true);

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
            <div id="options">
                <ItemForm handler={handleItemAddForm} getNewID={getNewID}></ItemForm>
                <Dropzone fileHandler={handleSetFile}></Dropzone>
            </div>

            <h1>Items</h1>
            <button onClick={downloadJSON}>Save</button>
            {props.getItems().sort(orderByID).map((item: Item) => {
                return (
                    <ItemElement key={item.id} item={item} deleteItem={props.deleteItem}></ItemElement>
                );
            })}
        </>
    );
}

export default Items;
