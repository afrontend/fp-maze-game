/*
JavaScript Maze
By Bob Hwang
https://github.com/afrontend/fp-maze-game
*/

import React, { Component } from 'react';
import _ from 'lodash';
import fp from 'lodash/fp';
import './App.css';

// configuration

const CONFIG = {
  rows: 25,
  columns: 25,
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
const convert2DimAry = fp.chunk(CONFIG.columns)

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

// path

const paintPath = panel => {
  return paint(panel, [{
    row: 12,
    column: 12
  }], CONFIG.pathColor);
};

const updatePath = f => f;

/*
const paintPath = panel => {
  return paint(panel, [{
    row: _.random(0, panel.length - 1),
    column: _.random(0, panel[0].length - 1)
  }], CONFIG.pathColor);
};
*/

// react components

const getWall = props => {
  const className = ['block'];
  if(props.top) className.push('top');
  if(props.right) className.push('right');
  if(props.bottom) className.push('bottom');
  if(props.left) className.push('left');
  return className.join(' ');
};

const Block = props => (
  <div className={getWall(props.item)} style={{backgroundColor: props.color}}>
    {props.children}
  </div>
);

const createBlocks = ary => (
  ary.map(
    (item, index) => (
      <Block item={item} color={item.color} key={index}>
        {item.count}
      </Block>
    )
  )
);

const Blocks = props => (createBlocks(props.window));

const addWall = panel => {
  const newPanel = _.cloneDeep(panel);
  const ary =  _.map(convert1DimAry(newPanel), (item) => {
    item.top = true;
    item.right = true;
    item.bottom = true;
    item.left = true;
    return item;
  });
  return convert2DimAry(ary);
}

const createPathPanel = _.flow([createPanel, paintPath, addWall]);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pathPanel: createPathPanel(),
    };

    this.state.timer = setInterval(() => {
      this.setState((state) => {
        return {
          pathPanel: updatePath(state.pathPanel),
        };
      });
    }, 1000);
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
