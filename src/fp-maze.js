/*
JavaScript Maze
By Bob Hwang
https://github.com/afrontend/fp-maze-game
*/

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

const convert1DimAry = _.flattenDepth;
const convert2DimAry = fp.chunk(CONFIG.columns)
const createItem = () => ({
  color: CONFIG.color,
  links: null,
  visited: false,
  willVisit: false,
});
const addPos = (panel) => {
  panel.forEach((rows, rIndex) => (
    rows.forEach((item, cIndex) => {
      item.pos = { row: rIndex, col: cIndex };
      return item;
    })
  ));
  return panel;
}

const addStartItem = (panel) => {
  const startItem = panel[0][0];
  startItem.willVisit = true;
  startItem.pos = {
    row: 0,
    col: 0
  };
  startItem.color = getColor(startItem);
  return panel;
};
const createPanel = () => (addStartItem(addPos(convert2DimAry(getAry(CONFIG.columns * CONFIG.rows, createItem)))));

const createPathPanel = _.flow([createPanel]);

// path

const tee = (args) => {
  console.log("tee", args);
  return args;
}

const getItem = (panel, pos) => {
  // return panel && pos.row && pos.col && panel[pos.row] && panel[pos.row][pos.col] ? panel[pos.row][pos.col] : null;
  return panel[pos.row][pos.col];
};

const getLeafItem = (panel) => {
  const ary = _.shuffle(convert1DimAry(panel));
  const leafItems = _.head(_.shuffle(_.filter(ary, (item) => (item.willVisit === true && item.links === null))));
  if (_.isEmpty(leafItems)) {
    return null;
  }
  return getItem(panel, leafItems.pos);
};

const getColor = (item) => {
  if (!item.visited && item.willVisit) return 'green';
  if (item.visited && !item.willVisit) return 'blue';
};

const getAdjacentPosition = (panel, pos, testFn ) => {
  const adjacentPositions = [];
  const fourWayPos = _.shuffle([
    {row: pos.row - 1, col: pos.col},
    {row: pos.row, col: pos.col + 1},
    {row: pos.row + 1, col: pos.col},
    {row: pos.row, col: pos.col - 1}
  ]);
  _.each(fourWayPos, (p) => {
    const item = panel[p.row] && panel[p.row][p.col] ? panel[p.row][p.col] : undefined;
    if (item && testFn(item)) {
      adjacentPositions.push(p);
    }
  });
  return adjacentPositions;
};

const fillTree = (panel) => {
  const item = getLeafItem(panel);
  if (item) {
    item.visited = true;
    item.willVisit = false;
    item.color = getColor(item);
    item.links = getAdjacentPosition(panel, item.pos, (item) => (
      item.visited !== true && item.willVisit !== true)
    );
    _.each(item.links, (pos) => {
      const item = getItem(panel, pos);
      item.willVisit = true;
      item.color = getColor(item);
    });
    console.log('item', item);
  }
  return panel;
};

const markTree = (panel) => {
  return fillTree(panel);
}

export const initPathPanel = () => ({pathPanel: createPathPanel()});
export const markPathPanel = (state) => ({ pathPanel: markTree(state.pathPanel) });
export const joinPathPanel = (state) => (convert1DimAry(state.pathPanel));

export default {};
