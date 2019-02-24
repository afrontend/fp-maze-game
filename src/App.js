/*
JavaScript Maze
By Bob Hwang
https://github.com/afrontend/fp-maze-game
*/

import React, { Component } from 'react';
import './App.css';
import {
  initPathPanel,
  markPathPanel,
  joinPathPanel
} from './fp-maze';

const getWallClassName = props => {
  const className = ['block'];
  if (props.wall) {
    if (props.wall.up) className.push('up');
    if (props.wall.right) className.push('right');
    if (props.wall.down) className.push('down');
    if (props.wall.left) className.push('left');
  }
  return className.join(' ');
};

const Block = props => (
  <div className={getWallClassName(props.item)} style={{backgroundColor: props.color}}>
    {props.children}
  </div>
);

const createBlocks = ary => (
  ary.map(
    (item, index) => (
      <Block item={item} color={item.color} key={index}>
        {' '}
      </Block>
    )
  )
);

const Blocks = props => (createBlocks(props.window));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initPathPanel();
    this.state.timer = setInterval(() => {
      this.setState((state) => (markPathPanel(state)));
    });
  }

  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={joinPathPanel(this.state)} />
        </div>
      </div>
    );
  }
}

export default App;
