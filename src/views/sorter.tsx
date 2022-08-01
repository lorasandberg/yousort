import React from 'react';
import '../App.css';
import { useState, useEffect, useRef } from 'react';
import { Item } from '../components/item';

function Sorter(props: any) {

  const [values, setValues] = useState<number[]>([]);
  const [left, setLeft] = useState<number>(0);
  const [right, setRight] = useState<number>(1);
  const [matchups, setMatchups] = useState<any>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const items = (): Item[] => props.getItems();

  const resultCanvas = useRef<HTMLCanvasElement>(null);

  // Init sorter
  useEffect(() => {
    let newValues: number[] = [];
    for (let i = 0; i < items().length; i++)
      newValues.push(0);
    setValues(newValues);
    setMatchups({});
  }, [])

  // Whenever the sorting values change, fetch new items to compare.
  useEffect(() => {
    if (values.length == 0)
      return;

    newItems();
  }, [values]);

  useEffect(() => {
    // Check matchups but avoid increasing the stack size.
    requestAnimationFrame(checkMatchups);
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

  // Whenever new items are picked to be compared, check if the comparison can be resolved with an existing matchup
  const checkMatchups = () => {
    let bigger = Math.max(left, right);
    let smaller = Math.min(left, right);
    console.log("Checking matchups: " + bigger + " vs. " + smaller);

    if (matchups[smaller] != undefined && matchups[smaller][bigger] !== undefined) {
      let winner = matchups[smaller][bigger];
      let loser = left == winner ? right : left;
      console.log("Skipping matchups: " + winner + " wins over " + loser);
      choose(winner, loser);
    }
  }

  // Voting finished, show results.
  const finish = () => {
    console.log("Finished!");
    setIsFinished(true);

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

    setTimeout(() => {
      generateResultImage(list);
    }, 10);
  }

  // Create a fancy image to show the results and allow users to save them.
  const generateResultImage = (list : number[][]) => {
    const imageSize = 100;

    const ctx = resultCanvas.current!.getContext("2d");
    resultCanvas.current!.width = 800;
    resultCanvas.current!.height = imageSize * list.length;

    // Make image background black
    ctx!.fillStyle = "#000";
    ctx!.fillRect(0, 0, resultCanvas.current!.width, resultCanvas.current!.height);

    ctx!.strokeStyle = "#000";

    // For each list entry
    for (let i = 0; i < list.length; i++) {

      // Download the item image as file
      let image = new Image();
      image.onload = () => {

        const y = imageSize * i + imageSize / 2;

        // Draw the item image zoomed in an blurred in the background of the entry
        ctx!.filter = "blur(4px)";
        ctx!.drawImage(image, 0, image.height / 2 - 20, image.width, 40, imageSize, y - imageSize / 2, 800 - imageSize, imageSize);
        ctx!.filter = "none";

        // Draw black background for the text
        ctx!.fillStyle = "#000";
        ctx!.fillRect(0, y + 10, 800, 40);

        ctx!.lineWidth = 3;
        ctx!.fillStyle = "#fff";

        // Draw the placing of the item in the list
        ctx!.font = "32px Chewy, sans-serif";
        ctx?.strokeText(ordinal_suffix_of(i + 1), imageSize + 20 + 600 - 2, y - 7); // Outside stroke
        ctx!.font = "30px Chewy, sans-serif";
        ctx?.fillText(ordinal_suffix_of(i + 1), imageSize + 20 + 600, y - 7);

        // Draw the name of the item
        ctx!.font = "25px Chewy, sans-serif";
        ctx?.fillText(items()[list[i][0]].name, imageSize + 20, y + 25);

        // Draw the item image next to the name
        ctx?.drawImage(image, 0, imageSize * i, imageSize, imageSize);
      }
      image.src = items()[list[i][0]].image;
    }
  }

  // ie. 1 -> "1st", 2 -> "2nd"
  function ordinal_suffix_of(i: number): string {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd";
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  }

  return (
    <>
      {(!isFinished && <div id="comparison">
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
      </div>)}
      {(isFinished && <>
        <canvas ref={resultCanvas}></canvas>
        <button onClick={finish}>Finish</button>
      </>
      )}
    </>
  );
}

export default Sorter;
