/** @abstract */
class AbstractTetromino {
    /**
     * @param {Number} centerX 
     * @param {Number} centerY 
     * @param {Number} angle
     */
    constructor(centerX, centerY, angle) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.angle = angle;
        this.coords = [[0, 0], [0, 0], [0, 0], [0, 0]];
        /** @type {Number[][][]} */
        this.offsetsArray = [];
    }

    calcCoords() {
        this.angle %= this.offsetsArray.length;
        const offsets = this.offsetsArray[this.angle];
        console.assert(offsets.length === 4 && this.coords.length === 4);
        for (let i = 0; i < 4; i++) {
            this.coords[i][0] = this.centerX + offsets[i][0];
            this.coords[i][1] = this.centerY + offsets[i][1];
        }
    }

    getCoords() {
        this.calcCoords();
        return this.coords;
    }

    moveLeft() {
        this.centerY -= 1;
    }

    moveRight() {
        this.centerY += 1;
    }

    moveUp() {
        this.centerX -= 1;
    }

    moveDown() {
        this.centerX += 1;
    }

    rotateClockwise() {
        const mod = this.offsetsArray.length;
        this.angle = (this.angle + 1) % mod;
    }

    rotateCounterclockwise() {
        const mod = this.offsetsArray.length;
        this.angle = ((this.angle - 1) % mod + mod) % mod;
    }
}

class ITetromino extends AbstractTetromino {
    /**
     * @param {Number} centerX 
     * @param {Number} centerY 
     * @param {Number} angle
     */
    constructor(centerX, centerY, angle) {
        super(centerX, centerY, angle);
        //[][x][][]
        this.offsetsArray.push([
            [0, -1], [0, 0], [0, 1], [0, 2]
        ]);
        //[]
        //[x]
        //[]
        //[]
        this.offsetsArray.push([
            [-1, 0], [0, 0], [1, 0], [2, 0]
        ]);
    }
}

class OTetromino extends AbstractTetromino {
    /**
     * @param {Number} centerX 
     * @param {Number} centerY 
     * @param {Number} angle
     */
    constructor(centerX, centerY, angle) {
        super(centerX, centerY, angle);
        //[x][]
        //[][]
        this.offsetsArray.push([
            [0, 0], [0, 1], [1, 0], [1, 1]
        ]);
    }
}

class TTetromino extends AbstractTetromino {
    /**
     * @param {Number} centerX 
     * @param {Number} centerY 
     * @param {Number} angle
     */
    constructor(centerX, centerY, angle) {
        super(centerX, centerY, angle);
        //  []
        //[][x][]
        this.offsetsArray.push([
            [-1, 0], [0, -1], [0, 0], [0, 1]
        ]);
        //[]
        //[x][]
        //[]
        this.offsetsArray.push([
            [-1, 0], [0, 0], [0, 1], [1, 0]
        ]);
        //[][x][]
        //  []
        this.offsetsArray.push([
            [0, -1], [0, 0], [0, 1], [1, 0]
        ]);
        //  []
        //[][x]
        //  []
        this.offsetsArray.push([
            [-1, 0], [0, -1], [0, 0], [1, 0]
        ]);
    }
}

class JTetromino extends AbstractTetromino {
    /**
     * @param {Number} centerX 
     * @param {Number} centerY 
     * @param {Number} angle
     */
    constructor(centerX, centerY, angle) {
        super(centerX, centerY, angle);
        //[]x
        //[][][]
        this.offsetsArray.push([
            [0, -1], [1, -1], [1, 0], [1, 1]
        ]);
        //[][]
        //[]x
        //[]
        this.offsetsArray.push([
            [-1, -1], [-1, 0], [0, -1], [1, -1]
        ]);
        //[][][]
        //   x[]
        this.offsetsArray.push([
            [-1, -1], [-1, 0], [-1, 1], [0, 1]
        ]);
        //  []
        // x[]
        //[][]
        this.offsetsArray.push([
            [-1, 1], [0, 1], [1, 1], [1, 0]
        ]);
    }
}

class LTetromino extends AbstractTetromino {
    /**
     * @param {Number} centerX 
     * @param {Number} centerY 
     * @param {Number} angle
     */
    constructor(centerX, centerY, angle) {
        super(centerX, centerY, angle);
        //   x[]
        //[][][]
        this.offsetsArray.push([
            [0, 1], [1, -1], [1, 0], [1, 1]
        ]);
        //[]
        //[]x
        //[][]
        this.offsetsArray.push([
            [-1, -1], [0, -1], [1, -1], [1, 0]
        ]);
        //[][][]
        //[]x
        this.offsetsArray.push([
            [-1, -1], [-1, 0], [-1, 1], [0, -1]
        ]);
        //[][]
        // x[]
        //  []
        this.offsetsArray.push([
            [-1, 0], [-1, 1], [0, 1], [1, 1]
        ]);
    }
}

class STetromino extends AbstractTetromino {
    /**
     * @param {Number} centerX 
     * @param {Number} centerY 
     * @param {Number} angle
     */
    constructor(centerX, centerY, angle) {
        super(centerX, centerY, angle);
        //  [x][]
        //[][]
        this.offsetsArray.push([
            [0, 0], [0, 1], [1, -1], [1, 0]
        ]);
        //[]
        //[][x]
        //  []
        this.offsetsArray.push([
            [-1, -1], [0, -1], [0, 0], [1, 0]
        ]);
    }
}

class ZTetromino extends AbstractTetromino {
    /**
     * @param {Number} centerX 
     * @param {Number} centerY 
     * @param {Number} angle
     */
    constructor(centerX, centerY, angle) {
        super(centerX, centerY, angle);
        //[][x]
        //  [][]
        this.offsetsArray.push([
            [0, -1], [0, 0], [1, 0], [1, 1]
        ]);
        //  []
        //[][x]
        //[]
        this.offsetsArray.push([
            [-1, 0], [0, -1], [0, 0], [1, -1]
        ]);
    }
}
