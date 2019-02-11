/*
JavaScript Maze
By Bob Hwang
https://github.com/afrontend/fp-maze-game
*/

import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';

// configuration

const CONFIG = {
  rows: 20,
  columns: 20,
  color: 'grey' ,
  pathColor: 'blue'
};

// panel functions

const getAry = (len, fn) => (
  _.range(len).map(() => (
    fn
    ? (
      _.isFunction(fn)
      ? fn()
      : fn )
    : null)
  ));

const createItem = () => ({ color: CONFIG.color });
const getEmptyRow = () => (getAry(CONFIG.columns, createItem));
const createPanel = () => (getAry(CONFIG.rows, getEmptyRow));
const convert1DimAry = _.flattenDepth;

const Block = props => (
  <div className="block" style={{backgroundColor: props.color}}>
    {props.children}
  </div>
);

// paint

const paint = (panel, posAry, color) => {
  const newPanel = _.cloneDeep(panel);
  posAry.forEach((pos, index) => {
    const item = _.assign(_.cloneDeep(pos), {
      index,
      color
    });
    newPanel[pos.row][pos.column] = item;
  });
  return newPanel;
};

const paintPath = panel => {
  return paint(panel, [{
    row: _.random(0, panel.length - 1),
    column: _.random(0, panel[0].length - 1)
  }], CONFIG.pathColor);
};

// react components

const Blocks = props => (createBlocks(props.window));

const createBlocks = ary => (
  ary.map(
    (item, index) => (
      <Block color={item.color} key={index}>
        {item.count}
      </Block>
    )
  )
);

const createPathPanel = _.flow([createPanel, paintPath]);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pathPanel: createPathPanel(),
    };
  }

  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={convert1DimAry(this.state.pathPanel)} />
        </div>
      </div>
    );
  }
}

export default App;
