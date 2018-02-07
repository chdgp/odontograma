/* 
 * Copyright (c) 2018 Bardur Thomsen <https://github.com/bardurt>.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Bardur Thomsen <https://github.com/bardurt> - initial API and implementation and/or initial documentation
 */

document.writeln("<script type='text/javascript' src='js/odontCanvas/core/settings.js'></script>");
document.writeln("<script type='text/javascript' src='js/odontCanvas/models/rect.js'></script>");
document.writeln("<script type='text/javascript' src='js/odontCanvas/models/damage.js'></script>");
document.writeln("<script type='text/javascript' src='js/odontCanvas/models/tooth.js'></script>");
document.writeln("<script type='text/javascript' src='js/odontCanvas/core/renderer.js'></script>");
document.writeln("<script type='text/javascript' src='js/odontCanvas/core/odontogramaGenerator.js'></script>");
document.writeln("<script type='text/javascript' src='js/odontCanvas/core/collisionHandler.js'></script>");

function Engine()
{
    // canvas which is used by the engine
    this.canvas = null;

    this.adultShowing = true;

    // array which contains all the teeth for an odontograma
    this.mouth = new Array();

    // array which holds all the spaces between teeth
    this.spaces = new Array();

    // array for an adult odontograma
    this.odontAdult = new Array();

    // spaces for a adult odontograma
    this.odontSpacesAdult = new Array();

    // array for a child odontograma
    this.odontChild = new Array();

    // spaces for a child odontograma
    this.odontSpacesChild = new Array();

    // renderer which will render everything on a canvas
    this.renderer = new Renderer();

    // helper to create odontograma
    this.odontogramaGenerator = new OdontogramaGenerator();

    // helper for handeling collision
    this.collisionHandler = new CollisionHandler();

    this.settings = new Settings();

    // value of the selected damage which should be added or removed
    this.selectedHallazgo = "0";

    // x position of the mouse pointer
    this.cursorX = 0;

    // y position of the mouse pointer
    this.corsorY = 0;

    this.multiSelect = false;
    this.multiSelection = Array();

}

/**
 * Method to set the canvas for the engine.
 * @param {type} canvas the canvas which will be used for drawing
 * @returns {undefined}
 */
Engine.prototype.setCanvas = function (canvas)
{
    console.log("Engine, setting canvas: " + canvas);
    this.canvas = canvas;
    this.renderer.init(this.canvas);
};

/**
 * Helper method to get the real x position of mouse
 * @param {type} event mouse event containing mouse position
 * @returns {Number} the x position of the mouse
 */
Engine.prototype.getXpos = function (event)
{

    var boundingRect = this.canvas.getBoundingClientRect();

    return Math.round(event.clientX - (boundingRect.left));
};

/**
 * Helper method to get the real y position of mouse
 * @param {type} event mouse event containing mouse position
 * @returns {Number} the y position of the mouse
 */
Engine.prototype.getYpos = function (event)
{

    var boundingRect = this.canvas.getBoundingClientRect();

    return Math.round(event.clientY - (boundingRect.top));
};

/**
 * Method to prepare the engine
 * @returns {undefined}
 */
Engine.prototype.init = function () {

    // set up the odontograma
    this.odontogramaGenerator.setEngine(this);

    this.odontogramaGenerator.setSettings(this.settings);

    this.odontogramaGenerator.prepareOdontogramaAdult(this.odontAdult,
            this.odontSpacesAdult, this.canvas);

    this.odontogramaGenerator.prepareOdontogramaChild(this.odontChild,
            this.odontSpacesChild, this.canvas);


    this.mouth = this.odontAdult;
    this.spaces = this.odontSpacesAdult;
};

/**
 * Method for updating the engine
 * @returns {undefined}
 */
Engine.prototype.update = function ()
{
    this.renderer.clear();
    this.renderer.render(this.mouth, this.settings);
    this.renderer.render(this.spaces, this.settings);

    if (this.settings.DEBUG) {

        this.renderer.renderText("DEBUG MODE", 2, 15, "#000000");

        this.renderer.renderText("X: " + this.cursorX + ", Y: " + this.cursorY,
                128, 15, "#000000");
    }
};

Engine.prototype.printMultiSelection = function () {

    console.log("Multi Select count: " + this.multiSelection.length);
    for (var i = 0; i < this.multiSelection.length; i++) {

        console.log("multiSelection[" + i + "]: " + this.multiSelection[i].id);

    }

};

Engine.prototype.resetMultiSelect = function () {

    this.multiSelect = false;
    this.multiSelection.length = 0;

    this.update();
};


/**
 * Method to get the index for a tooth
 * @param {type} tooth the tooth to find the index of
 * @returns {Number} index of the tooth
 */
Engine.prototype.getIndexForTooth = function (tooth) {

    var index = -1;

    for (var i = 0; i < this.mouth.length; i++) {

        if (this.mouth[i].id === tooth.id) {
            index = i;
            break;
        }
    }

    return index;

};

Engine.prototype.handleMultiSelection = function ()
{

    console.log("handleMultiSelection called");

    if (this.multiSelection.length === 2) {

        item1 = this.multiSelection[0];
        item2 = this.multiSelection[1];

        if (item1.type === item2.type) {
            console.log("Multi select same type");

            var result = Math.abs(item1.address - item2.address);

            console.log("Math.abs = " + result);

            if (result === 1) {
                console.log("Multi select Neighbours");
                this.createDiastema(item1, item2);
            } else {
                console.log("Multi select NOT Neighbours");
            }

        } else {
            console.log("Multi select NOT same type");

        }

    } else {

    }

};

Engine.prototype.addToMultiSelection = function (tooth)
{
    this.multiSelection.push(tooth);

    this.printMultiSelection();

    //this.handleMultiSelection();

};

Engine.prototype.removeHighlight = function()
{
    for(var i = 0; i < this.mouth.length; i++){
        this.mouth[i].highlight = false;
    }
    
}

Engine.prototype.highlightMultiSelection = function (tooth)
{
    try {

        if (this.multiSelection.length > 0) {

            for (var i = 0; i < this.mouth.length; i++) {
                this.mouth[i].highlight = false;
            }

            var tooth1 = this.multiSelection[0];

            // check if these are same types
            if (tooth1.type === tooth.type) {

                var index1 = this.getIndexForTooth(tooth1);
                var index2 = this.getIndexForTooth(tooth);

                var begin = Math.min(index1, index2);
                var end = Math.max(index1, index2);

                for (var i = begin; i <= end; i++) {

                    this.mouth[i].highlight = true;
                }

            }

            this.update();
        }

    } catch (error) {
        console.log("Engine highlightMultiSelection e: " + error.message);
    }

};

/**
 * Event handler for when the mouse is clicked
 * @param {type} event mouse click event
 * @returns {undefined}
 */
Engine.prototype.onMouseClick = function (event)
{

    shouldUpdate = false;

    if (!this.settings.HIHGLIGHT_SPACES) {
        // loop through all teeth
        for (var i = 0; i < this.mouth.length; i++)
        {
            this.mouth[i].toggleSelected(false);

            // check collision for current tooth
            if (this.mouth[i].rect.checkCollision(
                    this.getXpos(event),
                    this.getYpos(event))) {

                if (this.multiSelect) {

                    this.addToMultiSelection(this.mouth[i]);

                } else {
                    this.collisionHandler.handleCollision(this.mouth[i],
                            this.selectedHallazgo);
                }

                shouldUpdate = true;
            }

            // check if there is a collision with one of the tooth surfaces
            for (var j = 0; j < this.mouth[i].checkBoxes.length; j++)
            {
                if (this.mouth[i].checkBoxes[j].checkCollision(this.getXpos(event),
                        this.getYpos(event)))
                {
                    this.collisionHandler.handleCollisionCheckBox(
                            this.mouth[i].checkBoxes[j],
                            this.selectedHallazgo);

                    shouldUpdate = true;
                }
            }
        }
    } else {

        for (var i = 0; i < this.spaces.length; i++)
        {
            // check collision for current space
            if (this.spaces[i].checkCollision(
                    this.getXpos(event),
                    this.getYpos(event))) {

                this.collisionHandler.handleCollision(
                        this.spaces[i],
                        this.selectedHallazgo);

                shouldUpdate = true;
            }
        }
    }

    // only update if something new has occurred
    if (shouldUpdate) {
        this.update();
    }

};

/**
 * Method to get the x and y coordinates of the mouse cursor
 * @param {type} event mouse move event
 * @returns {undefined}
 */
Engine.prototype.followMouse = function (event)
{

    this.cursorX = this.getXpos(event);
    this.cursorY = this.getYpos(event);

    this.update();
};

/**
 * Event handler for when the mouse is moved
 * @param {type} event mouse click event
 * @returns {undefined}
 */
Engine.prototype.onMouseMove = function (event)
{

    if (this.settings.HIHGLIGHT_SPACES)
    {
        for (var i = 0; i < this.spaces.length; i++) {

            var update = false;

            if (this.spaces[i].checkCollision(this.getXpos(event),
                    this.getYpos(event)))
            {
                this.spaces[i].onTouch(true);
                update = true;
            } else
            {
                this.spaces[i].onTouch(false);
            }
        }

        if (update) {
            this.update();
        }
    } else {

        for (var i = 0; i < this.mouth.length; i++) {

            if (this.mouth[i].checkCollision(this.getXpos(event),
                    this.getYpos(event)))
            {
                this.mouth[i].onTouch(true);

                if (this.multiSelect) {
                    if (this.multiSelection.length > 0) {
                        this.highlightMultiSelection(this.mouth[i]);
                    }
                }

            } else
            {
                this.mouth[i].onTouch(false);
            }

            for (var j = 0; j < this.mouth[i].checkBoxes.length; j++)
            {
                if (this.mouth[i].checkBoxes[j].checkCollision(
                        this.getXpos(event), this.getYpos(event)))
                {
                    this.mouth[i].checkBoxes[j].touching = true;
                } else
                {
                    this.mouth[i].checkBoxes[j].touching = false;
                }
            }
        }

    }

    this.followMouse(event);

};

/*'
 * Method to reset the odontograma
 * @returns {undefined}
 */
Engine.prototype.reset = function ()
{

    for (var i = 0; i < this.mouth.length; i++)
    {
        this.mouth[i].damages.length = 0;

        for (var j = 0; j < this.mouth[i].checkBoxes.length; j++)
        {
            this.mouth[i].checkBoxes[j].state = 0;
        }
    }

    for (var i = 0; i < this.spaces.length; i++)
    {
        this.spaces[i].damages.length = 0;
    }

    this.update();
};

/**
 * Method to save the odontograma as an image file
 * @returns {undefined}
 */
Engine.prototype.save = function ()
{

    // save image as png
    var link = document.createElement('a');
    link.download = "test.png";
    link.href = this.canvas.toDataURL("image/png")
            .replace("image/png", "image/octet-stream");

    link.click();

};

/**
 * Event handler for when the mouse is clicked
 * @param {type} event mouse click event
 * @returns {undefined}
 */
Engine.prototype.onButtonClick = function (event)
{
    console.log("key " + event.key);

    if (event.key !== "d") {
        this.selectedHallazgo = "0";
    }

    if (event.key === "1")
    {
        this.selectedHallazgo = "1";
    }

    if (event.key === "2")
    {
        this.selectedHallazgo = "2";
    }

    if (event.key === "3")
    {
        this.selectedHallazgo = "3";
    }

    if (event.key === "4")
    {
        this.selectedHallazgo = "4";
    }

    if (event.key === "5")
    {
        this.selectedHallazgo = "5";
    }

    if (event.key === "6")
    {
        this.selectedHallazgo = "6";
    }

    if (event.key === "7")
    {
        this.selectedHallazgo = "7";
    }

    if (event.key === "8")
    {
        this.selectedHallazgo = "8";
    }

    if (event.key === "9")
    {
        this.selectedHallazgo = "9";
    }

    if (event.key === "0")
    {
        this.selectedHallazgo = "10";
    }

    if (event.key === "q")
    {
        this.selectedHallazgo = "11";
    }

    if (event.key === "w")
    {
        this.selectedHallazgo = "12";
    }

    if (event.key === "r")
    {
        this.selectedHallazgo = "13";
    }

    if (event.key === "b")
    {
        this.selectedHallazgo = "14";
    }

    if (event.key === "e")
    {
        this.selectedHallazgo = "15";
    }

    if (event.key === "t")
    {
        this.selectedHallazgo = "16";
    }

    if (event.key === "y")
    {
        this.selectedHallazgo = "17";
    }

    if (event.key === "u")
    {
        this.selectedHallazgo = "18";
    }

    if (event.key === "i")
    {
        this.selectedHallazgo = "19";
    }

    if (event.key === "o")
    {
        this.selectedHallazgo = "20";
    }

    if (event.key === "a") {

        this.selectedHallazgo = "21";
        this.settings.HIHGLIGHT_SPACES = true;
        this.update();

    }

    if (event.key === "s") {

        this.selectedHallazgo = "22";
        this.settings.HIHGLIGHT_SPACES = true;
        this.update();

    }

    if (event.key !== "d") {
        if (event.key !== "a" && event.key !== "s")
        {
            this.settings.HIHGLIGHT_SPACES = false;
            this.update();
        }
    }

    if (event.key === "h")
    {
        this.selectedHallazgo = "0";
    }

    if (event.key === "z")
    {
        this.selectedHallazgo = "0";
        this.reset();
    }

    if (event.key === "m")
    {
        this.selectedHallazgo = "0";
        this.save();
    }

    if (event.key === "d") {

        this.settings.DEBUG = !this.settings.DEBUG;

        this.update();
    }

    if (event.key === "Control") {

        this.multiSelect = !this.multiSelect;
        console.log("multiselect: " + this.multiSelect);
        if (!this.multiSelect) {
            this.multiSelection.length = 0;
            this.removeHighlight();
            this.update();
        }

    }

    if (event.key === "F1") {

        this.adultShowing = true;
        console.log("Setting odontograma to adult");
        this.mouth = this.odontAdult;
        this.spaces = this.odontSpacesAdult;
        this.update();

    }

    if (event.key === "F2") {

        this.adultShowing = false;
        console.log("Setting odontograma to child");
        this.mouth = this.odontChild;
        this.spaces = this.odontSpacesChild;
        this.update();

    }

};

/**
 * Method to displaying a splash screen
 * @returns {undefined}
 */
Engine.prototype.splash = function () {

    this.renderer.drawSplash();

    var self = this;

    // show splash screen for 3 seconds 
    // then continue
    setTimeout(function () {
        self.update();
    }, 3000);

};