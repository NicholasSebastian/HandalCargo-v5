import React, { Component, FC, Fragment, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Typography, Layout, Menu, Empty, Input, Button, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';

import { query, simpleQuery } from '../utils/query';
import PageEffect from '../components/PageEffect';

import { messages } from '../Queries.json';
const { contactsQuery, messageQuery, sendQuery, clearQuery } = messages;

const { Title } = Typography;
const { Sider, Content, Footer } = Layout;
const { Item } = Menu;

const REFRESH_INTERVAL = 2000; // refreshes messages every 2 seconds.

interface IMessage {
  message: string
  datetime: Date
  sender: string
  receiver: string
}

interface IGroupedMessage {
  sender: string
  name: string
  image: any
  messages: Array<IMessage>
}

interface IMailState {
  messagebox: Array<IGroupedMessage>
  current: string | null
}

interface IConversationProps {
  data: IGroupedMessage
  refresh: () => void
  scrollToBottom: () => void
}

const Conversation: FC<IConversationProps> = props => {
  const { data, refresh, scrollToBottom } = props;
  const { sender, name, image, messages } = data;
  const inputRef = useRef<Input>(null);

  function handleSubmit() {
    const profile = JSON.parse(window.sessionStorage.getItem('profile')!);
    const user = profile.staffid;

    const { value } = inputRef.current!.state;
    inputRef.current?.setState({ value: '' });

    query(sendQuery, [value, user, sender])
    .then(() => {
      refresh();
      scrollToBottom();
    })
    .catch(() => message.error("Failed to send message"));
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  const timeFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  return (
    <InnerStyles>
      <Content className='chat-body'>
        <span>Chat history is only kept for 7 days.</span>
        {messages.map((msg, i) => {
          const timeSent = msg.datetime.toLocaleTimeString(navigator.language, timeFormat);
          return (
            msg.sender === sender ? (
              <RecevingDialog key={i}>
                <div>
                  {msg.message}
                  <span>{timeSent}</span>
                </div>
              </RecevingDialog>
            ) : (
              <SendingDialog key={i}>
                <div>
                  {msg.message}
                  <span>{timeSent}</span>
                </div>
              </SendingDialog>
            )
          );
        })}
      </Content>
      <Footer>
        <Input ref={inputRef} maxLength={100} onKeyDown={handleKeyDown} />
        <Button icon={<SendOutlined />} onClick={handleSubmit} />
      </Footer>
    </InnerStyles>
  );
}

class Mail extends Component<never, IMailState> {
  refreshTimer!: NodeJS.Timeout;
  user: string;
  
  constructor(props: never) {
    super(props);
    this.state = {
      messagebox: [],
      current: null
    };
    this.refreshMessages = this.refreshMessages.bind(this);
    this.groupMessages = this.groupMessages.bind(this);
    this.scrollBottom = this.scrollBottom.bind(this);
    
    const profile = JSON.parse(window.sessionStorage.getItem('profile')!);
    this.user = profile.staffid;
  }

  componentDidMount() {
    this.refreshTimer = setInterval(this.refreshMessages, REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
  }

  async refreshMessages() {
    await simpleQuery(clearQuery);
    const contacts = await query(contactsQuery, [this.user]) as Array<any>;
    const messages = await query(messageQuery, [this.user, this.user]) as Array<IMessage>;
    const messagebox = this.groupMessages(contacts, messages);
    this.setState({ messagebox });
  }

  groupMessages(contacts: Array<any>, messages: Array<IMessage>) {
    return contacts.map((contact): IGroupedMessage => {
      const sender = contact.staffid;
      const name = contact.staffname;
      const conversation = messages.filter(msg => {
        const received = msg.sender === sender && msg.receiver === this.user;
        const sent = msg.receiver === sender && msg.sender === this.user;
        return received || sent;
      });
      return {
        sender, name,
        image: null, // TODO: images
        messages: conversation
      }
    });
  }

  scrollBottom() {
    const chatBody = document.getElementsByClassName('chat-body')[0];
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  render() {
    const { messagebox, current } = this.state;
    const openMessages = current && messagebox.find(msg => msg.sender === current);
    const NotOpen = (
      <NotOpenStyles>
        <Empty description={null} />
      </NotOpenStyles>
    );
    return (
      <Fragment>
        <PageEffect pageKey='mail' function={this.refreshMessages} />
        <MailStyles>
          <Sider theme='light'>
            <Title level={5}>Staff Contacts</Title>
            <Menu mode='inline' theme='light' 
              selectedKeys={current ? [current] : undefined}
              onClick={({ key }) => {
                this.setState({ current: key as string });
                setTimeout(this.scrollBottom, 5);
              }}>
              {messagebox.map(entry => (
                <Item key={entry.sender}>{entry.sender}</Item>
              ))}
            </Menu>
          </Sider>
          {current ? (
            <Conversation data={openMessages as never} refresh={this.refreshMessages}
              scrollToBottom={this.scrollBottom} />
          ) : NotOpen}
        </MailStyles>
      </Fragment>
    );
  }
}

export default Mail;

const MailStyles = styled(Layout)`
  height: 100%;

  h5 {
    margin-top: 12px;
    margin-left: 16px;
  }
`;

const InnerStyles = styled(Layout)`
  margin-left: 10px;

  > main {
    background-color: #fff;
    padding: 0 20px;
    overflow-y: scroll;

    > span:first-child {
      display: block;
      margin-top: 4px;
      text-align: center;
      font-size: 10.5px;
      color: #888;
    }

    > div {
      margin-bottom: 5px;
      display: flex;

      > div {
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 15px;

        > span {
          font-size: 10.5px;
          margin-left: 8px;
        }
      }
    }
  }

  > footer {
    background-color: #fafafa;
    padding: 10px 20px;
    display: grid;
    grid-template-columns: 1fr 32px;
    column-gap: 4px;
  }
`;

const RecevingDialog = styled.div`
  justify-content: flex-start;

  > div {
    background-color: #e6f7ff;
  }
`;

const SendingDialog = styled.div`
  justify-content: flex-end;

  > div {
    background-color: #1890ff;
    color: #fff;
  }
`;

const NotOpenStyles = styled.div`
  background-color: #fff;
  width: 100%;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
