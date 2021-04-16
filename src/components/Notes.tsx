import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Button, Input, List, Space } from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Item } = List;

class Notes extends Component {
  inputRef: React.RefObject<Input>;

  constructor(props: {}) {
    super(props);
    this.inputRef = createRef();
    this.handleAdd = this.handleAdd.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  getDataFromStorage(): Array<string> {
    const localStorage = window.localStorage.getItem('notes');
    return localStorage ? JSON.parse(localStorage) : [];
  }

  handleAdd(item: string) {
    if (item.length > 0) {
      const data = this.getDataFromStorage();
      data.push(item);
      window.localStorage.setItem('notes', JSON.stringify(data));
      this.forceUpdate();
      this.inputRef.current?.setState({ value: '' });
    }
  }

  handleDelete(index: number) {
    const data = this.getDataFromStorage();
    data.splice(index, 1);
    window.localStorage.setItem('notes', JSON.stringify(data));
    this.forceUpdate();
  }

  render() {
    const data = this.getDataFromStorage();
    return (
      <Space direction='vertical'>
        <List size='small'
          dataSource={data}
          renderItem={(item, i) => (
            <Item actions={[
              <StyledButton onClick={() => this.handleDelete(i)}>
                <CloseCircleOutlined />
              </StyledButton>
            ]}>
              {item}
            </Item>
          )} />
        <AddButtonStyles>
          <Input ref={this.inputRef} />
          <Button icon={<PlusOutlined />}
            onClick={() => this.handleAdd(this.inputRef.current?.state.value)} />
        </AddButtonStyles>
      </Space>
    );
  }
}

export default Notes;

const AddButtonStyles = styled.div`
  display: grid;
  grid-template-columns: 1fr 32px;
  column-gap: 4px;
`;

const StyledButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-right: -8px;
  transition: color 200ms;

  &:hover {
    cursor: pointer;
    color: red;
  }
`;