import React from 'react';
import { window } from '../../utils/browser';

const SHOW_AFTER = 320;

class TopButton extends React.Component {
  constructor (props) {
    super(props);
    this.topPage = this.topPage.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount () {
    this.section = this.node && this.node.closest('.page__section--top');
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll () {
    if (!this.section) return;
    this.section.classList.toggle('is-visible', window.scrollY > SHOW_AFTER);
  }

  topPage () {
    window.scrollTo(0, 0);
  }

  render () {
    return (
      <div className='top' ref={(node) => { this.node = node; }}>
        <button className='button--top' onClick={this.topPage} > Go To &nbsp;<span> Top </span>&nbsp; of Page
        </button>
      </div>
    );
  }
}

export default TopButton;
