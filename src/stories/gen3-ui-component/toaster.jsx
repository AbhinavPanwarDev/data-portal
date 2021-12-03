import { Component } from 'react';
import { storiesOf } from '@storybook/react';
import Toaster from '../../gen3-ui-component/components/Toaster';
import Button from '../../gen3-ui-component/components/Button';

class ToasterWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toasterEnabled: false,
    };
  }

  enableToaster = () => {
    this.setState({ toasterEnabled: true });
  };

  disableToaster = () => {
    this.setState({ toasterEnabled: false });
  };

  render() {
    return (
      <div>
        <Button
          buttonType='primary'
          label='Show Toaster'
          onClick={this.enableToaster}
        />
        <Button
          buttonType='primary'
          label='Close Toaster'
          onClick={this.disableToaster}
        />
        <Toaster isEnabled={this.state.toasterEnabled}>
          <Button
            buttonType='secondary'
            label='Close'
            onClick={this.disableToaster}
          />
        </Toaster>
      </div>
    );
  }
}

storiesOf('Toaster', module).add('Basic', () => <ToasterWrapper />);
