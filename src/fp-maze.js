/*
JavaScript Maze
By Bob Hwang
https://github.com/afrontend/fp-maze-game
*/

import _ from 'lodash';
import fp from 'lodash/fp';

// configuration

const CONFIG = {
  rows: 40,
  columns: 40
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
  links: null,
  visited: false,
  willVisit: false,
  wall: {
    up: false,
    right: false,
    down: false,
    left: false
  }
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
  const startItem = panel[0][20];
  startItem.willVisit = true;
  startItem.depth = 1;
  startItem.mark = 'S';
  startItem.pos = {
    row: 0,
    col: 20
  };
  startItem.color = getColor(startItem);
  return panel;
};

const createPanel = _.flow([
  () => (getAry(CONFIG.columns * CONFIG.rows, createItem)),
  convert2DimAry,
  addPos,
  addStartItem,
]);

const createPathPanel = _.flow([createPanel]);

// tree

const getItem = (panel, pos) => {
  return panel[pos.row][pos.col];
};

const getSomeLeafItem = _.flow([
  convert1DimAry,
  _.shuffle,
  fp.filter((item) => (item.willVisit === true && item.links === null)),
  _.shuffle,
  _.head
]);

const getLeafItem = (panel) => {
  const leafItem = getSomeLeafItem(panel);
  return _.isEmpty(leafItem) ? null : getItem(panel, leafItem.pos);
};

const getColor = (item) => {
  if (!item.visited && item.willVisit) return 'green';
  if (item.visited && !item.willVisit) return 'blue';
};

const getAdjacentPosition = (panel, pos, testFn ) => {
  const adjacentPositions = [];
  const fourWayPos = _.shuffle([
    { row: pos.row - 1, col: pos.col, direction: 'up', rDirection: 'down' },
    { row: pos.row, col: pos.col + 1, direction: 'right', rDirection: 'left' },
    { row: pos.row + 1, col: pos.col, direction: 'down', rDirection: 'up' },
    { row: pos.row, col: pos.col - 1, direction: 'left', rDirection: 'right' }
  ]);
  _.each(fourWayPos, (p) => {
    const item = panel[p.row] && panel[p.row][p.col] ? panel[p.row][p.col] : undefined;
    if (item && testFn(item)) {
      adjacentPositions.push(p);
    }
  });
  return _.shuffle(adjacentPositions);
};

const markLastItem = (panel) => {
  const ary = convert1DimAry(panel);
  const lastItem = _.maxBy(ary, (item) => (item.depth));
  lastItem.mark = 'E';
  return panel;
}

const markTree = (panel) => {
  const curItem = getLeafItem(panel);
  if (curItem) {
    curItem.visited = true;
    curItem.willVisit = false;
    curItem.color = getColor(curItem);
    curItem.links = getAdjacentPosition(panel, curItem.pos, (item) => (
      item.visited !== true && item.willVisit !== true
    ));
    _.each(curItem.links, (pos) => {
      curItem.wall[pos.direction] = true;
      const nextItem = getItem(panel, pos);
      nextItem.wall[pos.rDirection] = true;
      nextItem.willVisit = true;
      nextItem.color = getColor(nextItem);
      nextItem.depth = curItem.depth + 1;
    });
  } else {
    return markLastItem(panel);
  }
  return markTree(panel);
}

export const initPathPanel = () => ({ pathPanel: createPathPanel() });
export const markPathPanel = (state) => ({ pathPanel: markTree(state.pathPanel) });
export const joinPathPanel = (state) => (convert1DimAry(state.pathPanel));

