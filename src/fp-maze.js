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
  visited: false
});
const createPanel = () => (convert2DimAry(getAry(CONFIG.columns * CONFIG.rows, createItem)));

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
    row: 12,
    column: 12,
    key: 0
  }], CONFIG.pathColor);
};

const createPathPanel = _.flow([createPanel]);

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

const getNewRowColumn = (headItem, key) => ({
  row: headItem.row - matchKey(key, UP) + matchKey(key, DOWN),
  column: headItem.column - matchKey(key, LEFT) + matchKey(key, RIGHT)
});

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

// key

const getKeys = _.flow([
  fp.filter((item) => (item.key !== 0)),
  fp.map((item) => ( item.key ))
]);

const getRandomKey = _.flow([
  getKeys,
  _.shuffle,
  _.head
]);

// panel

const nextItemIsOutOfRange = _.flow([getNextItem, _.isUndefined]);

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

const updatePanel = pathPanel => {
  const outOfRange = nextItemIsOutOfRange(pathPanel, getHeadItem(pathPanel).key)
  const newPathPanel = outOfRange ? pathPanel : moveSnakeAndAddTail(pathPanel);
  return newPathPanel;
};

// process key

/*
 * const isValidKey = key => (_.some(keyFnList, (item) => (item.key === key)));
 * const validKey = ({ pathPanel, key }) => (
 *   {
 *     pathPanel,
 *     key: isValidKey(key) ? key : 0
 *   }
 * );
 */

const getItem = (panel, p) => (panel[p.row] && panel[p.row][p.col] ? panel[p.row][p.col] : undefined);

const getAdjacentItems = (panel, pos) => {
  const adjacentItems = [];
  const fourWayPos = _.shuffle([
    {row: pos.row - 1, col: pos.col},
    {row: pos.row, col: pos.col + 1},
    {row: pos.row + 1, col: pos.col},
    {row: pos.row, col: pos.col - 1}
  ]);
  _.each(fourWayPos, (p) => {
    const item = panel[p.row] && panel[p.row][p.col] ? panel[p.row][p.col] : undefined;
    if (item && item.visited !== true) {
      item.visited = true;
      adjacentItems.push(p);
    }
  });

  return adjacentItems;
};

/*
 * const hasUnvisitedItem = (panel, links) => (
 *   _.some(links, (pos) => {
 *     return getItem(panel, pos).visited !== true;
 *   })
 * );
 */

const getLeafItem = (panel) => {
  const ary = convert1DimAry(panel);
  const leafItems = _.filter(ary, (item) => (item.visited && item.links = null));
  if (leafItems.length > 0) {
    return _.head(_.shuffle(leafItems)).pos;
  }
  return { row: 0, col: 0 };
}

const fillTree = (panel) => {
  const curPos = getLeafItem(panel);
  if (!panel) return panel
  const curItem = getItem(panel, curPos);
  console.log('curItem', curItem);
  if (curItem.visited) return panel
  curItem.visited = true;
  curItem.color = CONFIG.pathColor;
  curItem.pos= { row: curPos.row, col: curPos.col };
  console.log('curItem', curItem);
  curItem.links = getAdjacentItems(panel, curPos);
  return panel;
};

const markTree = (panel) => {
  return fillTree(panel);
}

// test

const addWall = panel => {
  const newPanel = _.cloneDeep(panel);
  const ary =  _.map(convert1DimAry(newPanel), (item) => {
    item.top = false;
    item.right = false;
    item.bottom = false;
    item.left = false;
    return item;
  });
  return convert2DimAry(ary);
}

export const initPathPanel = () => ({pathPanel: createPathPanel()});
export const markPathPanel = (state) => ({ pathPanel: markTree(state.pathPanel) });
export const joinPathPanel = (state) => (convert1DimAry(state.pathPanel));

export default {};
