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

const matchKey = (akey, bkey) => (akey === bkey ? 1 : 0);
const isBlank = item => ( item && item.color === CONFIG.color ? true : false );
const isNotBlank = item => (item.color !== CONFIG.color);
const reIndexing = ary => {
  return ary.map((item, index) => {
    item.index = index;
    return item;
  });
};

const tee = (args) => {
  console.log("tee", args);
  return args;
}

const getHeadItem = _.flow([
  _.cloneDeep,
  convert1DimAry,
  fp.filter(isNotBlank),
  fp.sortBy('index'),
  _.head
]);

const getNextItem = (pathPanel, key) => {
  const headItem = getHeadItem(pathPanel);
  const { row, column } = getNewRowColumn(headItem, key);
  return pathPanel && pathPanel[row] && pathPanel[row][column] ? pathPanel[row][column] : undefined;
};
const nextItemIsBlank = _.flow([getNextItem, isBlank]);

const arrowKey = ({ pathPanel, key }) => {
  const headItem = getHeadItem(pathPanel);
  const origKey = pathPanel[headItem.row][headItem.column].key;
  pathPanel[headItem.row][headItem.column].key = nextItemIsBlank(pathPanel, key) ? key : origKey;
  return {
    pathPanel
  };
};

const nop = (nop) => (nop);

const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;

const keyFnList = [
  { key: LEFT , fn: arrowKey },
  { key: UP   , fn: arrowKey },
  { key: RIGHT, fn: arrowKey },
  { key: DOWN , fn: arrowKey },
  { key: 0    , fn: nop }
];

const getNewRowColumn = (headItem, key) => ({
  row: headItem.row - matchKey(key, UP) + matchKey(key, DOWN),
  column: headItem.column - matchKey(key, LEFT) + matchKey(key, RIGHT)
});

const addHeadItem = ary => {
  const snake = _.cloneDeep(ary);
  const headItem = _.cloneDeep(_.head(snake));
  const newHeadItem = _.assign(headItem, getNewRowColumn(headItem, headItem.key));
  return [newHeadItem, ...snake];
};

const justPaintPath = posAry => (paint(createPanel(), posAry, CONFIG.pathColor));

const moveSnakeAndAddTail = _.flow([
  convert1DimAry,
  fp.filter(isNotBlank),
  fp.sortBy('index'),
  addHeadItem,
  reIndexing,
  justPaintPath
]);

const paintPath = panel => {
  return paint(panel, [{
    row: 12,
    column: 12,
    key: 0
  }], CONFIG.pathColor);
};

// panel

const nextItemIsOutOfRange = _.flow([getNextItem, _.isUndefined]);

const updatePanel = pathPanel => {
  const outOfRange = nextItemIsOutOfRange(pathPanel, getHeadItem(pathPanel).key)
  const newPathPanel = outOfRange ? pathPanel : moveSnakeAndAddTail(pathPanel);
  return newPathPanel;
};

// process key

const isValidKey = key => (_.some(keyFnList, (item) => (item.key === key)));
const validKey = ({ pathPanel, key }) => (
  {
    pathPanel,
    key: isValidKey(key) ? key : 0
  }
);

const storeKey = ({ pathPanel, key }) => (
  _.find(keyFnList, (item) => (
    item.key === key
  )).fn({ pathPanel, key })
);

const processKey = _.flow([validKey, storeKey]);

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

const createPathPanel = _.flow([createPanel, paintPath]);

const getKeys = _.flow([
  fp.filter((item) => (item.key !== 0)),
  fp.map((item) => ( item.key ))
]);

const getRandomKey = _.flow([
  getKeys,
  _.shuffle,
  _.head
]);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pathPanel: createPathPanel(),
    };

    this.state.timer = setInterval(() => {
      this.setState((state) => {
        return {
          pathPanel: updatePanel(state.pathPanel)
        };
      });
    });

    this.state.keyTimer = setInterval(() => {
      this.setState((state) => {
        return processKey({
          pathPanel: state.pathPanel,
          key: getRandomKey(keyFnList)
        });
      });
    });
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
