import React from 'react';
import './App.css';
import { useState } from 'react';
import Items from './views/items';
import Sorter from './views/sorter';
import { Item } from './components/item';

enum Views { Sorter, Items }

// Provide functions to manage the item set.
interface ItemHandlers {
  setItems: (items: Item[]) => void,
  getItems: () => Item[],
  deleteItem: (item: Item) => void
}

function App() {

  // Lightweight site navigation
  const [view, setView] = useState<Views>(Views.Items);

  // Set of the items to be sorted
  const [items, setItems] = useState<Item[]>([]);

  // Delete item from the set
  const deleteItem = (item: Item) => {
    let tmpList = [...items];
    tmpList.splice(tmpList.indexOf(item), 1);
    setItems(tmpList);
  }

  // Functions to manage the item set.
  const itemHandlers: ItemHandlers = {
    getItems: () => items,
    setItems: setItems,
    deleteItem: deleteItem
  }

  return (
    <>
      <h1>YouSort</h1>
      <h2>A sorting algorithm for subjective stuff</h2>
      <div id="navigation">
        <button onClick={() => setView(Views.Items)}>Items</button>
        <button onClick={() => setView(Views.Sorter)}>Start sorting</button>
      </div>
      <div>
        {(view == Views.Items &&
          <Items {...itemHandlers}></Items>
        )}
        {(view == Views.Sorter &&
          <Sorter {...itemHandlers}></Sorter>
        )}
      </div>
    </>
  );
}

export default App;
