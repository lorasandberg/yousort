export interface Item {
    name: string,
    image: string, // data URL
    id: number
}

export function ItemElement(props: any) {

    const imageStyle = {
        backgroundImage: "url(" + props.item.image + ")"
    };

    return (<div className="game">
        <div className="image" style={imageStyle}></div>
        <p>{props.item.name}</p>
        <div>
            <button className="onWhite" onClick={() => props.deleteItem(props.item)}>Delete</button>
        </div>
    </div>);
}