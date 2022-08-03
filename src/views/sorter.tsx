import React from 'react';
import '../App.css';
import star from "../images/star.png";
import { useState, useEffect, useRef } from 'react';
import { Item } from '../components/item';
import { isBreakStatement } from 'typescript';


export function RandomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}


function Sorter(props: any) {

  const [values, setValues] = useState<number[]>([]);
  const [left, setLeft] = useState<number>(0);
  const [right, setRight] = useState<number>(1);
  const [matchups, setMatchups] = useState<any>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [sortingStates, setSortingStates] = useState<any>([]);

  const items = (): Item[] => props.getItems();

  const resultCanvas = useRef<HTMLCanvasElement>(null);
  const [editableTitle, setEditableTitle] = useState("better");
  const [starImage, setStarImage] = useState<HTMLImageElement | null>(null);

  const [skipNewItemReroll, setSkipNewItemReroll] = useState(false);

  const imageSize = 100;

  // Init sorter
  useEffect(() => {
    setValues(getInitialValues());
    setMatchups({});
    setSortingStates([]);

    // Load a default picture for when user has not set one.
    let image = new Image();
    image.onload = () => {
      setStarImage(image);
    }
    image.src = star;

    // Check if user changed any items from the initial tutorial
    let changed: boolean = false;

    for (let i = 0; i < items().length; i++)
      if (items()[i].id >= 0) {
        changed = true;
        break;
      }

    if (!changed)
      changeTutorialText();
  }, [])

  const getInitialValues = () => {
    let newValues: number[] = [];
    for (let i = 0; i < items().length; i++)
      newValues.push(0);
    return newValues;
  }

  // Small animations that changes the header from "Which on is better" to "Which one is a more useful tip" 
  // Happens when the user doesn't remove the intial tips from the item list
  const changeTutorialText = async () => {

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    let old = editableTitle;
    let len = old.length;

    await delay(3000);

    for (let i = 0; i < len; i++) {
      old = old.slice(0, -1);
      setEditableTitle(old);
      await delay(50);
    }

    const title = "a more useful tip";
    let newTitle = "";

    for (let i = 0; i < title.length; i++) {
      await delay(50);
      newTitle += title[i];
      setEditableTitle(newTitle);
    }
  }

  // Whenever the sorting values change, fetch new items to compare.
  useEffect(() => {
    if (values.length == 0)
      return;
    if(skipNewItemReroll) {
      setSkipNewItemReroll(false);
      return;
    }

    newItems();
  }, [values]);

  useEffect(() => {
    // Check matchups but avoid increasing the stack size.
    requestAnimationFrame(checkMatchups);
  }, [left, right]);

  // Update sorting values based on which item the player chose.
  const choose = (id: number, other: number, skipped: boolean = false) => {

    // Set history
    setSortingStates([...sortingStates, {
      matchups: JSON.parse(JSON.stringify(matchups)),
      values: JSON.parse(JSON.stringify(values)),
      left: left,
      right: right,
      skipped: skipped
    }]);

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

  const undo = () => {

    let i;

    for (i = sortingStates.length - 1; i >= 0; i--) {
      if (!sortingStates[i].skipped)
        break;
    }

    // Reset sorting completely.
    if (i < 0) {
      setValues(getInitialValues());
      setMatchups({});
      setSortingStates([]);
    }
    else {
      setValues(sortingStates[i].values);
      setMatchups(sortingStates[i].matchups);
      setRight(sortingStates[i].right);
      setLeft(sortingStates[i].left);
      
      setSortingStates(sortingStates.slice(0, i));

      setSkipNewItemReroll(true);
    }
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

    if (matchups[smaller] != undefined && matchups[smaller][bigger] !== undefined) {
      let winner = matchups[smaller][bigger];
      let loser = left == winner ? right : left;
      choose(winner, loser, true);
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
  const generateResultImage = (list: number[][]) => {

    const ctx = resultCanvas.current!.getContext("2d");
    resultCanvas.current!.width = 800;
    resultCanvas.current!.height = imageSize * list.length;

    // Make image background black
    ctx!.fillStyle = "#000";
    ctx!.fillRect(0, 0, resultCanvas.current!.width, resultCanvas.current!.height);

    ctx!.strokeStyle = "#000";

    // For each list entry
    for (let i = 0; i < list.length; i++) {

      let item = items()[list[i][0]];

      if (item.image !== null && item.image !== "") {
        // Download the item image as file
        let image = new Image();
        image.onload = () => {
          drawEntry(ctx!, item.name, i, image);
        }
        image.src = item.image;
      }
      else
        drawEntry(ctx!, item.name, i, null);

    }
  }

  function drawEntry(ctx: CanvasRenderingContext2D, name: string, index: number, image: HTMLImageElement | null) {

    const y = imageSize * index + imageSize / 2;

    // Draw the item image zoomed in an blurred in the background of the entry

    if (image !== null) {
      ctx!.filter = "blur(4px)";
      ctx!.drawImage(image, 0, image.height / 2 - 20, image.width, 40, imageSize, y - imageSize / 2, 800 - imageSize, imageSize);
      ctx!.filter = "none";
    }
    else {
      let ratio = index / items().length;
      console.log(ratio);
      ctx.fillStyle = "hsl(" + Math.round(ratio * 360) + ", 70%, 60%)";
      ctx!.fillRect(imageSize, y - imageSize / 2, 800 - imageSize, imageSize);
    }

    // Draw black background for the text
    ctx!.fillStyle = "#000";
    ctx!.fillRect(0, y + 10, 800, 40);

    ctx.beginPath();
    ctx.arc(imageSize + 22, y - 5, 30, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();

    ctx!.lineWidth = 3;
    ctx!.fillStyle = "#fff";
    // Draw the placing of the item in the list
    //ctx!.font = "32px Chewy, sans-serif";
    //ctx?.strokeText(ordinal_suffix_of(index + 1), imageSize + 20 + 600 - 2, y - 7); // Outside stroke

    let placing = (index + 1) + "";
    ctx!.font = "20px Chewy, sans-serif";
    ctx?.fillText(placing, imageSize + 22 - Math.min(ctx.measureText(placing).width, 30) / 2, y - 3, 30);

    // Draw the name of the item
    let trimmed = name;
    while (ctx.measureText(trimmed).width > 650)
      trimmed = trimmed.substring(0, trimmed.length - 5);

    if (trimmed.length < name.length)
      trimmed = trimmed + "...";

    ctx!.font = "25px Chewy, sans-serif";
    ctx?.fillText(trimmed, imageSize + 20, y + 35, 650);

    if (image !== null) {
      // Draw the item image next to the name
      ctx?.drawImage(image, 0, imageSize * index, imageSize, imageSize);
    }
    else {
      // Draw the item image next to the name
      ctx?.drawImage(starImage as HTMLImageElement, 0, imageSize * index, imageSize, imageSize);
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
      {(!isFinished && <>
        <h1 style={{ textAlign: "center", marginTop: "120px" }}>Which one is {editableTitle}?</h1>
        <div id="comparison">
          <div id="itemLeft" onClick={() => choose(left, right)}>
            <img src={items()[left]?.image} />
            <h2 style={{ fontSize: "1.2em", marginTop: "10px" }}>{items()[left]?.name}</h2>
            <p>{values[left]}</p>
          </div>
          <div id="itemLeft" onClick={() => choose(right, left)}>
            <img src={items()[right]?.image} />
            <h2 style={{ fontSize: "1.2em", marginTop: "10px" }}>{items()[right]?.name}</h2>
            <p>{values[right]}</p>
          </div>
        </div>
        <button className="onBlack" onClick={undo}>Redo previous</button>
      </>)}
      {(isFinished && <>
        <h1 style={{ textAlign: "center", marginTop: "120px" }}>Your list is ready!</h1>
        <canvas style={{ maxWidth: "100%", marginTop: "120px" }} ref={resultCanvas}></canvas>
        <p><button className="onBlack" onClick={props.viewItems}>Back to items</button></p>
      </>
      )}
    </>
  );
}

export default Sorter;
