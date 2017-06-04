'use strict';

// Provides methods for creating and using a Triangle Layout
class TriangleLayout {

    /**
     * Create a new instance of the TriangleLayout
     * 
     * @param {int} [scale] - Determines the default pixel size of the non-hypotenuse sides of each triangle
     */
    constructor(scale) {

        // Define the pixel scale for the triangle layout
        // Default is 10 pixels per non-hypotenuse side
        if (!scale) { scale = 10; }
        this.SCALE = scale;

        // Create the following map of row characters to pixels with the given scale:
        // { 'A':0 , 'B':10 , ... }
        this.ROW_CHARS = 'ABCDEF'.split('');
        this.ROW_MAP = new Map();
        for (var i=0; i<this.ROW_CHARS.length; i++){
            this.ROW_MAP.set(this.ROW_CHARS[i] , this.SCALE * i);
        }

        // Create the following map of column numbers to pixels with the given scale:
        // { 1:0 , 2:0 , 3:10 , 4:10 , ... }
        this.MAX_COLS = 12;
        this.COL_MAP = new Map();
        this.COL_MAP.set(1,0);
        for (var i=2; i<this.MAX_COLS+1; i++){
            // Even columns will use the same pixel value as the previous odd column
            var colVal = (i % 2 === 0) ? this.COL_MAP.get(i-1) : this.COL_MAP.get(i-1) + this.SCALE;
            this.COL_MAP.set(i , colVal);
        }
    }

    /**
     * Given a Row and Column, calculate the pixel vertices of the triangle
     * 
     * @param {string} row - e.g. A, B, C ... F
     * @param {int} col - e.g. 1, 2, 3 ... 12
     * @returns {TriangleCoordinates}
     */
    calculateCoordinates(row,col)  {
        
        var isEvenColumn = (col % 2 === 0);
        var [x, y] = [this.COL_MAP.get(col), this.ROW_MAP.get(row)]; // Lookup the top left vertex to derive the others

        return new TriangleCoordinates(
            isEvenColumn ? new Coordinate(x + this.SCALE, y) : new Coordinate(x, y + this.SCALE),
            isEvenColumn ? new Coordinate(x + this.SCALE, y + this.SCALE) : new Coordinate(x, y),
            isEvenColumn ? new Coordinate(x, y) : new Coordinate(x + this.SCALE, y + this.SCALE)
        )
    };

    /**
     * Given a triangle coordinates, calculate the corresponding row and column
     * 
     * @param {TriangleCoordinates} coords 
     * @returns {[string,int]} - e.g. ['A', 1] or ['F', 6]
     */
    calculateRowAndColumn(coords) {

        // Check if the column is odd based on the row pixel value of the 1st and 2nd vertices
        var isOddColumn = (coords.V1.Y > coords.V2.Y);

        // Use top left vertex to lookup the row and column map keys
        var [x, y] = isOddColumn ? 
                [coords.V2.X, coords.V2.Y] :
                [coords.V3.X, coords.V3.Y] ;

        var col = this.getMapKeyUsingValue(this.COL_MAP, x);

        // The odd columns will always be returned from the map key lookup because they have 
        // the same pixel value as even columns, so we need to increment for even columns
        col = isOddColumn ? col : parseInt(col) + 1; 

        var row = this.getMapKeyUsingValue(this.ROW_MAP, y);

        // Quick and dirty way to compare if the given coordinates are valid ones
        var actualCoords = this.calculateCoordinates(row, col);
        if (JSON.stringify(coords) !== JSON.stringify(actualCoords)) {
            return ['',''];
        } else {
            return [row,col];
        }

    };

    /**
     * Convenience method to get the first key from a map that matches the given value
     * NOTE: ECMA 6 Maps are ordered, so the map will be iterated
     *       over in the same order it was initialized
     * @param {Map} map 
     * @param {*} val 
     */
    getMapKeyUsingValue(map, val) {
        for (let key of map.keys()) {
            if (val === map.get(key)) {
                return key;
            }
        }
    }

    /**
     * Check if a given row and column is valid per the triangle layout
     * 
     * @param {*} row 
     * @param {*} col 
     */
    isValidRowAndCol(row,col) {
        if (!this.ROW_CHARS.includes(row)){
            throw 'Row [' + row + '] is not a valid row character';
        }
        if (isNaN(col) || col < 1 || col > this.MAX_COLS){
            throw 'Invalid column number';
        }
        return true;
    }

    /**
     * Test the triangle layout by calculating the coordinates for all
     * possible row/column combinations and then recalculating the row
     * and column from the coodrinates. Return text based output and errors
     */
    testLayout() {
        var testOutput = '';
        var errors = '';

        for (let rowKey of this.ROW_MAP.keys()) {
            for (let colKey of this.COL_MAP.keys()) {

                testOutput += '-----------------------\n';
                testOutput += 'Finding coordinates for [' + rowKey + colKey + '] ...\n';

                var coords = this.calculateCoordinates(rowKey,colKey);

                testOutput += 'Found coordinates:\n'
                testOutput += JSON.stringify(coords) + '\n';

                testOutput += 'Using above coordinates to find row and column ...\n';
                var [row, col] = this.calculateRowAndColumn(coords);

                if (row === rowKey) {
                    testOutput += 'Input row [' + rowKey + '] matches calculated row [' + row + ']\n';
                } else {
                    errors += 'Input [' + rowKey + colKey + '] does NOT match calculated row [' + row + ']\n';
                }

                if (parseInt(col) === parseInt(colKey)) {
                    testOutput += 'Input column [' + colKey + '] matches calculated column [' + col + ']\n';
                } else {
                    errors += 'Input [' + rowKey + colKey + '] does NOT match calculated column [' + col + ']\n';
                }
            }
        }

        errors = errors ? 'Found errors:\n' + errors : 'No errors found!\n';
        return errors + testOutput;
    }

}

// Holds the coordinates for a triangle. Each triangle vertex (V1, V2, V3) should hold a Coordinate
class TriangleCoordinates {
    constructor(v1,v2,v3) {
        this.V1 = v1;
        this.V2 = v2;
        this.V3 = v3;
    }
}

// Holds the X and Y pixel values for a coordinate
class Coordinate {
    constructor(x,y) {
        this.X = x;
        this.Y = y;
    }
}