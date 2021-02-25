import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Input } from 'antd';

type Operator = '+' | '-' | 'x' | '/';

interface ICalculatorProps {
  visible: boolean
}

interface ICalculatorState {
  operator: Operator | null
  value: number | ''
  memory: number | null
}

class Calculator extends Component<ICalculatorProps, ICalculatorState> {
  inputRef: React.RefObject<Input>;

  constructor(props: ICalculatorProps) {
    super(props);
    this.inputRef = createRef();
    this.state = {
      operator: null,
      value: '',
      memory: null
    };
    this.focusInput = this.focusInput.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.calculate = this.calculate.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
    this.focusInput();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  }

  componentDidUpdate(prevProps: ICalculatorProps) {
    if (prevProps.visible !== this.props.visible) {
      this.setState({ operator: null });
      this.focusInput();
    }
  }

  focusInput() { // TODO: focus ain't working
    if (this.props.visible) {
      this.inputRef.current?.focus({ cursor: 'end' });
    }
  }

  handleKeyPress(e: KeyboardEvent) {
    if (this.props.visible) {
      if (e.key === 'Enter') {
        this.calculate(true);
        this.focusInput();
        return;
      }

      if (e.key === 'Delete') {
        this.setState({ value: '' });
        return;
      }
  
      if (['+', '-', 'x', '/'].includes(e.key)) {
        this.calculate(false);
        this.setState({ operator: e.key as Operator });
        this.focusInput();
      }
      else if (['*', 'X'].includes(e.key)) {
        this.calculate(false);
        this.setState({ operator: 'x' });
        this.focusInput();
      }
    }
  }

  calculate(showAnswer: boolean) {
    if (this.state.value === '') return;

    if (this.state.memory === null) {
      this.setState({ memory: this.state.value, value: "" });
    }
    else {
      let answer: number = 0;
      switch (this.state.operator) {
        case '+':
          answer = this.state.memory + this.state.value;
          break;
        case '-':
          answer = this.state.memory - this.state.value;
          break;
        case 'x':
          answer = this.state.memory * this.state.value;
          break;
        case '/':
          answer = this.state.memory / this.state.value;
          break;
      }
      if (showAnswer) {
        this.setState({ memory: null, value: answer, operator: null });
      }
      else {
        this.setState({ memory: answer, value: "" });
      }
    }
  }

  render() {
    return (
      <CalculatorStyles>
        <Input ref={this.inputRef}
          value={this.state.value}
          placeholder={this.state.memory?.toString()}
          onChange={e => {
            // Delete value to blank.
            if (e.target.value.length === 0) {
              this.setState({ value: '' });
              return;
            }

            // Numeric inputs only.
            const numericInput = Number(e.target.value);
            if (numericInput) {
              this.setState({ value: numericInput });
            }
          }} />
        <span>{this.state.operator}</span>
      </CalculatorStyles>
    );
  }
}

export default Calculator;

const CalculatorStyles = styled.div`
  position: relative;

  > span:last-child {
    position: absolute;
    right: 10px;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
  }
`;
