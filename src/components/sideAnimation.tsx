import { useEffect, useRef, useState } from "react";
import { RandomRange } from "../views/sorter";

/* 
Add fun sorting-themed animation on the right side of the app.
Using Canvas and 2D rendering context.
*/

interface Vector2 { x: number, y: number }

const rectSize = RandomRange(30, 90); // Size of the squares to be sorted.
const introAbsDuration = 400; // Squares move horizontally out of their spot, move vertically to the new spot, and move back into the new spot horizontally. This value is the duration of both horizontal movements (in ms).

let rects: Vector2[] = []; // Stores all the (positions of the) squares.

let ctx: CanvasRenderingContext2D | null; // Rendering context.

// Information about the currently run animation.
let animation = { movingRectIndex: 0, targetRectIndex: 0, start: 0, duration: 3000 };

export function SideAnimation(props: any) {

    const canvas = useRef<HTMLCanvasElement>(null);

    // Initialize the animation
    useEffect(() => {

        ctx = canvas.current!.getContext("2d");

        rects = [];

        // Populate the rect array.
        for (let y = 0; y < canvas.current!.height; y += rectSize) {
            rects.push({ x: rectSize / 2, y: y + rectSize / 2 });
        }

        // The animation loop
        const intervalId = setInterval(loop, 16);
        return () => {
            clearInterval(intervalId);
        }
    }, []);

    // The main loop
    const loop = async () => {
        ctx!.clearRect(0, 0, canvas.current!.width, canvas.current!.height); // Reset canvas
        updateLoop(); // Run rect positioning logic.
        drawLoop(); // Draw rects based on positions.
    }



    // Helper function that returns the initial location of a rect based on their index.
    const indexToPosition = (index: number): Vector2 => { return { x: rectSize / 2, y: index * rectSize + rectSize / 2 } }

    // Math helpers
    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
    const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(n, min)); 

    const easeInOut = (k: number) => 0.5 * (Math.sin((k - .5) * Math.PI) + 1); 


    const updateLoop = () => {

        // Start new rect movement
        if (animation.start + animation.duration < Date.now()) {
            animation.start = Date.now();

            // Get two indices randomly.
            let nums = [];
            for (let i = 0; i < rects.length; i++)
                nums.push(i);

            let rand1 = RandomRange(0, nums.length);
            animation.movingRectIndex = nums[rand1];
            nums.splice(rand1, 1);

            animation.targetRectIndex = nums[RandomRange(0, nums.length)];

            // Adjust animation duration based on how many rects are moved.
            animation.duration = 500 * Math.abs(animation.targetRectIndex - animation.movingRectIndex) + introAbsDuration * 2;

            // Reset all rect positions to initial.
            for (let i = 0; i < rects.length; i++)
                rects[i] = indexToPosition(i);
        }

        // How much of the animation has been run (0-1)
        let ratio = (Date.now() - animation.start) / animation.duration;
        
        // Calculate relative intro duration based on animation duration
        let introDuration = introAbsDuration / animation.duration;

        // Loop through rects
        for (let i = 0; i < rects.length; i++) {

            // Skip all that are not involved in the animation (not the moving rect or any in-between it and the target location)
            if (i < animation.movingRectIndex && i < animation.targetRectIndex)
                continue;
            if (i > animation.movingRectIndex && i > animation.targetRectIndex)
                continue;

            // Define the repositioning rect's position
            if (i == animation.movingRectIndex) {

                if (ratio < introDuration) { // Moving out of its spot
                    rects[i].x = lerp(indexToPosition(i).x, indexToPosition(i).x + rectSize, (ratio / introDuration));
                    rects[i].y = indexToPosition(i).y;
                }
                else if (ratio > 1 - introDuration) { // Moving into its new spot
                    rects[i].x = lerp(indexToPosition(i).x, indexToPosition(i).x + rectSize, ((1 - ratio) / introDuration));
                    rects[i].y = indexToPosition(animation.targetRectIndex).y;
                }
                else { // Finding the new spot vertically
                    rects[i].x = indexToPosition(i).x + rectSize;
                    rects[i].y = lerp(indexToPosition(i).y, indexToPosition(animation.targetRectIndex).y, (ratio - introDuration) / (1 - introDuration* 2));
                }
                continue;
            }

            // Helper function the find position for the rects between.
            // Basically move them one index up or down, depending on which direction the main rect is moving.
            // Delay the movements slightly per rect so they moving asynchronously
            const betweenRectPosition = (i: number): number => {
                let diff = 0.3;
                let adjustedRatio = clamp((ratio - introDuration) / (1 - 2 * introDuration), 0, 1);

                let positionRatio = Math.abs(i - animation.movingRectIndex) / (Math.abs(animation.targetRectIndex - animation.movingRectIndex) + 1);

                let upperBound = positionRatio + diff / 2;
                let lowerBound = positionRatio - diff / 2;

                let subRatio = clamp((adjustedRatio - lowerBound) / (upperBound - lowerBound), 0, 1);

                return easeInOut(subRatio);
            }

            // Reset in-between positions if the main rectangle is moving into or out of its spot.
            if(ratio < introDuration) {
                rects[i] = indexToPosition(i);
                continue;
            }
            if(ratio > 1 - introDuration){
                rects[i] = indexToPosition(i + (animation.movingRectIndex > animation.targetRectIndex ? 1 : -1));
                continue;
            }

            // Set in-between rect positions
            if (i < animation.movingRectIndex && i >= animation.targetRectIndex)
                rects[i].y = lerp(indexToPosition(i).y, indexToPosition(i + 1).y, betweenRectPosition(i));

            if (i > animation.movingRectIndex && i <= animation.targetRectIndex)
                rects[i].y = lerp(indexToPosition(i).y, indexToPosition(i - 1).y, betweenRectPosition(i));
        }
    }

    // Straightforward function to draw the rectangles.
    const drawLoop = () => {

        let scale = 1;
        ctx!.fillStyle = "#000";
        for (let i = 0; i < rects.length; i++) {
            ctx!.fillRect(rects[i].x - rectSize / 2, rects[i].y - rectSize / 2, rectSize * scale, rectSize * scale);
        }
    }


    return (
        <canvas id="sortingAnimation" width="300" height="800" ref={canvas}></canvas>
    );
}

export default SideAnimation;