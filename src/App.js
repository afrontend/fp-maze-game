/*
JavaScript Maze
By Bob Hwang
https://github.com/afrontend/fp-maze-game
*/

import React, { Component } from 'react';
import './App.css';
import {
  initPathPanel,
  movePathPanel,
  keyPathPanel,
  joinPathPanel
} from './fp-maze'

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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initPathPanel();
    this.state.timer = setInterval(() => {
      this.setState((state) => (movePathPanel(state)));
    });

    this.state.keyTimer = setInterval(() => {
      this.setState((state) => (keyPathPanel(state)));
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
