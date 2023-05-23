import React, { Component } from 'react';
import ping from 'ping';

interface PingComponentProps {}

interface PingComponentState {
  pong: string;
}

class PingComponent extends Component<PingComponentProps, PingComponentState> {
  constructor(props: PingComponentProps) {
    super(props);
    this.state = {
      pong: 'pending'
    };
  }

  componentDidMount() {
    const ipAddress = '192.168.0.1'; // Replace with the desired IP address

    ping.sys.probe(ipAddress, (isAlive) => {
      const pongMessage = isAlive ? `Ping to ${ipAddress} successful` : `Ping to ${ipAddress} failed`;
      this.setState({ pong: pongMessage });
    });
  }

  render() {
    return <h1>{this.state.pong}</h1>;
  }
}

export default PingComponent;
