import React, { useEffect } from 'react';
import './App.css';
import { useState } from 'react';
import Items from './views/items';
import Sorter from './views/sorter';
import { Item } from './components/item';
import { start } from 'repl';

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

  useEffect(() => {
    if (items.length == 0) {
      setItems([...items, {
        name: "This is a single item in the item list. You can add more items to the list and remove existing ones.",
        image: "",
        id: -1
      }, {
        name: "Try out sorting these tips by how useful they are by pressing the 'Start sorting' button upper right.",
        image: "",
        id: -2
      }, {
        name: " Or you can start removing these tips from the list and begin making your own list of whatever you want to sort!",
        image: "",
        id: -3
      }, {
        name: "You can also save the current list into a file which is good for using the sorter on different devices, sharing the lists with other people, or creating backups.",
        image: "",
        id: -4
      }, {
        name: "Have fun!",
        image: "",
        id: -5
      }])
    }
  }, []);

  const startSort = () => {
    setView(Views.Sorter);
  }

  const viewItems = () => {
    setView(Views.Items);
  }

  // Functions to manage the item set.
  const itemHandlers: ItemHandlers = {
    getItems: () => items,
    setItems: setItems,
    deleteItem: deleteItem
  }

  return (
    <>
      <aside>
        <div>
          <h1>YouSort</h1>
          <h2>A sorting algorithm for subjective stuff</h2>
        </div>
      </aside>
      <main>
        <div>
          {(view == Views.Items &&
            <Items {...itemHandlers} startSort={startSort}></Items>
          )}
          {(view == Views.Sorter &&
            <Sorter {...itemHandlers} viewItems={viewItems}></Sorter>
          )}
        </div>
      </main>
      <canvas id="sortingAnimation"></canvas>
    </>
  );
}

export default App;
