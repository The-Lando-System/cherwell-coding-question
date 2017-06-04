'use strict';

$(document).ready(function(){

    // Create a new Triangle Layout with the default pixel scale
    var triangleLayout = new TriangleLayout();

    // Handle coordinate calculation click and validate inputs
    $('#coord-calc-btn').click(function() {
        var rowColInput = $('#row-col-input').val();

        // The first character is the Row and the remainder is the column
        var [row,col] = [ rowColInput.charAt(0), parseInt(rowColInput.slice(1,rowColInput.length)) ];
        
        // Check if the input row and column is valid
        try {
            triangleLayout.isValidRowAndCol(row,col);
        } catch(err) {
            $('#coord-result').text(err);
            return;
        }

        // Invoke the coordinate calculation function
        var coords = triangleLayout.calculateCoordinates(row,col);

        // Show results
        $('#coord-result').text(JSON.stringify(coords,null,2));
    });

    // Handle row and Column calculation click
    $('#row-col-calc-btn').click(function() {

        var [v1x, v1y] = $('#v1-input').val().split(',');
        var [v2x, v2y] = $('#v2-input').val().split(',');
        var [v3x, v3y] = $('#v3-input').val().split(',');

        var coords = new TriangleCoordinates(
            new Coordinate(parseInt(v1x), parseInt(v1y)),
            new Coordinate(parseInt(v2x), parseInt(v2y)),
            new Coordinate(parseInt(v3x), parseInt(v3y))
        );

        var [row,col] = triangleLayout.calculateRowAndColumn(coords);

        $('#row-col-result').text((row && col) ? row + col : 'Incorrect coordinates given' );
    });

    // Handle click to run test
    $('#test-btn').click(function() {
        $('#test-result').text(triangleLayout.testLayout());
    });

});