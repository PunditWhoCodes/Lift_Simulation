document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate');
    const floorsContainer = document.getElementById('floors-container');
    const liftsContainer = document.getElementById('lifts-container');

    let floors, lifts, liftStates;

    function initializeLiftStates(numLifts) {
        return Array(numLifts).fill().map(() => ({
            currentFloor: 0,
            targetFloors: [],
            isMoving: false,
            doorsOpen: false
        }));
    }

    function findNearestAvailableLift(floorNumber) {
        let nearestLift = -1;
        let minDistance = Infinity;

        for (let i = 0; i < lifts; i++) {
            const lift = liftStates[i];
            const distance = Math.abs(lift.currentFloor - floorNumber);
            if (!lift.isMoving && !lift.doorsOpen && distance < minDistance) {
                minDistance = distance;
                nearestLift = i;
            }
        }

        if (nearestLift === -1) {
            for (let i = 0; i < lifts; i++) {
                const lift = liftStates[i];
                const distance = Math.abs(lift.currentFloor - floorNumber);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestLift = i;
                }
            }
        }

        return nearestLift;
    }

    function requestLift(floorNumber) {
        const availableLift = findNearestAvailableLift(floorNumber);
        if (availableLift !== -1) {
            liftStates[availableLift].targetFloors.push(floorNumber);
            if (!liftStates[availableLift].isMoving) {
                moveLift(availableLift);
            }
        }
    }

    function animateLiftMovement(liftIndex, targetFloor, moveTime) {
        return new Promise(resolve => {
            const liftElement = document.querySelector(`.lift-shaft:nth-child(${liftIndex + 1}) .lift`);
            const floorHeight = 100; // Height of each floor in pixels
            const targetPosition = (floors - 1 - targetFloor) * floorHeight;

            liftElement.style.transition = `top ${moveTime}ms linear`;
            liftElement.style.top = `${targetPosition}px`;

            setTimeout(resolve, moveTime);
        });
    }

    function openCloseDoors(liftIndex) {
        return new Promise(resolve => {
            const liftElement = document.querySelector(`.lift-shaft:nth-child(${liftIndex + 1}) .lift`);
            const leftDoor = liftElement.querySelector('.lift-door.left');
            const rightDoor = liftElement.querySelector('.lift-door.right');

            // Open doors
            leftDoor.classList.add('open');
            rightDoor.classList.add('open');

            // Wait for 2 seconds
            setTimeout(() => {
                // Close doors
                leftDoor.classList.remove('open');
                rightDoor.classList.remove('open');

                // Wait for another 2 seconds before resolving
                setTimeout(resolve, 2000);
            }, 2000);
        });
    }

    async function moveLift(liftIndex) {
        const lift = liftStates[liftIndex];
        lift.isMoving = true;

        while (lift.targetFloors.length > 0) {
            const targetFloor = lift.targetFloors[0];
            const floorsToMove = Math.abs(targetFloor - lift.currentFloor);
            const moveTime = floorsToMove * 1000; // 1 second per floor

            await animateLiftMovement(liftIndex, targetFloor, moveTime);
            lift.currentFloor = targetFloor;
            lift.targetFloors.shift();

            await openCloseDoors(liftIndex);
        }

        lift.isMoving = false;
    }

    generateButton.addEventListener('click', () => {
        floors = parseInt(document.getElementById('floors').value);
        lifts = parseInt(document.getElementById('lifts').value);

        if (isNaN(floors) || isNaN(lifts) || floors < 2 || lifts < 1) {
            alert('Please enter valid numbers for floors (min 2) and lifts (min 1).');
            return;
        }

        liftStates = initializeLiftStates(lifts);
        floorsContainer.innerHTML = '';
        liftsContainer.innerHTML = '';

        // Create floors
        for (let i = 0; i < floors; i++) {
            const floor = document.createElement('div');
            floor.className = 'floor';

            const floorNumber = document.createElement('div');
            floorNumber.className = 'floor-number';
            floorNumber.textContent = i + 1;

            const liftButtons = document.createElement('div');
            liftButtons.className = 'lift-buttons';

            if (i < floors - 1) {
                const upButton = document.createElement('button');
                upButton.className = 'lift-button';
                upButton.textContent = 'Up';
                upButton.addEventListener('click', () => requestLift(i));
                liftButtons.appendChild(upButton);
            }

            if (i > 0) {
                const downButton = document.createElement('button');
                downButton.className = 'lift-button';
                downButton.textContent = 'Down';
                downButton.addEventListener('click', () => requestLift(i));
                liftButtons.appendChild(downButton);
            }

            floor.appendChild(floorNumber);
            floor.appendChild(liftButtons);
            floorsContainer.appendChild(floor);
        }

        // Create lifts
        for (let i = 0; i < lifts; i++) {
            const liftShaft = document.createElement('div');
            liftShaft.className = 'lift-shaft';
            liftShaft.style.height = `${floors * 100}px`; // Set height based on number of floors

            const lift = document.createElement('div');
            lift.className = 'lift';

            const liftDoors = document.createElement('div');
            liftDoors.className = 'lift-doors';

            const leftDoor = document.createElement('div');
            leftDoor.className = 'lift-door left';

            const rightDoor = document.createElement('div');
            rightDoor.className = 'lift-door right';

            liftDoors.appendChild(leftDoor);
            liftDoors.appendChild(rightDoor);
            lift.appendChild(liftDoors);
            liftShaft.appendChild(lift);
            liftsContainer.appendChild(liftShaft);

            // Set initial position of the lift to the ground floor
            lift.style.top = `${(floors - 1) * 100}px`;
        }

        // Set container heights
        floorsContainer.style.height = `${floors * 100}px`;
        liftsContainer.style.height = `${floors * 100}px`;
        
        // Ensure lifts container is scrollable horizontally
        liftsContainer.style.overflowX = 'auto';
        liftsContainer.style.width = '100%';
        
        // Set a minimum width for the lifts container to ensure scrolling
        const minWidth = lifts * 80 + (lifts - 1) * 20; // 80px per lift + 20px gap
        liftsContainer.style.minWidth = `${minWidth}px`;
    });
});