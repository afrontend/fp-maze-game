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
  color: 'grey'
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

console.log(createPanel());

const Block = props => (
  <div className="block" style={{backgroundColor: props.color}}>
    {props.children}
  </div>
);

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

class App extends Component {
  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={convert1DimAry(createPanel())} />
        </div>
      </div>
    );
  }
}

export default App;
