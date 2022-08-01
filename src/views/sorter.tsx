import React from 'react';
import '../App.css';
import { useState, useEffect } from 'react';
import { Item } from '../components/item';

function Sorter(props: any) {

  const [values, setValues] = useState<number[]>([]);
  const [left, setLeft] = useState<number>(0);
  const [right, setRight] = useState<number>(1);
  const [matchups, setMatchups] = useState<any>({});

  const items = (): Item[] => props.getItems();

  // Init sorter
  useEffect(() => {
    let newValues: number[] = [];
    for (let i = 0; i < items().length; i++)
      newValues.push(0);
    setValues(newValues);
  }, [])

  // Whenever the sorting values change, fetch new items to compare.
  useEffect(() => {
    if (values.length == 0)
      return;

    newItems();
  }, [values]);

  // Whenever new items are picked to be compared, check if the comparison can be resolved with an existing matchup
  useEffect(() => {
    let bigger = Math.max(left, right);
    let smaller = Math.min(left, right);

    if (matchups[smaller] != null && matchups[smaller][bigger] != null) {
      let winner = matchups[smaller][bigger];
      let loser = left == winner ? right : left;
      choose(winner, loser); // Skipped with Matchup
    }
  }, [left, right]);

  // Update sorting values based on which item the player chose.
  const choose = (id: number, other: number) => {
    let newValues: number[] = [...values];
    newValues[id]++;
    setValues(newValues);

    // Save the new matchup between two items so it won't be checked again in the future.
    let newMUs: any = JSON.parse(JSON.stringify(matchups));
    if (newMUs[Math.min(id, other)] === undefined)
      newMUs[Math.min(id, other)] = {};
    newMUs[Math.min(id, other)][Math.max(id, other)] = id;
    setMatchups(newMUs);
  }

  function RandomRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Get new items to compare
  function newItems() {
    
    // First calculate how many items with different amount of vote values are there.
    let counts: number[] = [];

    for (let i = 0; i < values.length; i++)
      counts.push(0);

    // For each amount of votes, calculate how many items have that many votes.
    for (let i = 0; i < values.length; i++)
      counts[values[i]]++;

    // Find the highest vote count for vote amount that at least two items have.
    let highestMultiple: number = -1;

    for (let i = counts.length - 1; i >= 0; i--)
      if (counts[i] > 1) {
        highestMultiple = i;
        break;
      }

    // If such count couldn't be found, it means that every item has an unique amount of votes and the sorting is finished.
    if (highestMultiple < 0) {
      finish();
      return;
    }

    // Find two random values for the items with highest shared vote counts.
    let toCompare = [];

    for (let i = 0; i < values.length; i++)
      if (values[i] == highestMultiple)
        toCompare.push(i);

    let left = RandomRange(0, toCompare.length);
    let right;
    do {
      right = RandomRange(0, toCompare.length)
    } while (left == right);

    // Set new items to be compared.
    setLeft(toCompare[left]);
    setRight(toCompare[right]);
  }

  // Voting finished, show results.
  const finish = () => {
    console.log("Finished!");

    let list: any = [];

    for (let i = 0; i < values.length; i++)
      list.push([i, values[i]]);

    list.sort((a: any, b: any) => {
      if (a[1] < b[1])
        return 1;
      if (a[1] > b[1])
        return -1;

      return 0;
    });

    console.log(list);
    let output: string = "";
    for (let i = 0; i < list.length; i++) {
      console.log((i + 1) + ": " + items()[list[i][0]].name);
      output = output + "\n" + (i + 1) + ": " + items()[list[i][0]].name;
    }
    console.log(output);
  }

  return (
    <>
      <div id="comparison">
        <div id="itemLeft" onClick={() => choose(left, right)}>
          <h2>{items()[left]?.name}</h2>
          <img src={items()[left]?.image} />
          <p>{values[left]}</p>
        </div>
        <div id="itemLeft" onClick={() => choose(right, left)}>
          <h2>{items()[right]?.name}</h2>
          <img src={items()[right]?.image} />
          <p>{values[right]}</p>
        </div>
      </div>
    </>
  );
}

export default Sorter;
