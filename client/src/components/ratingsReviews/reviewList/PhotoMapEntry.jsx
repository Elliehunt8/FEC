import React from 'react';
import styled from 'styled-components';

const imgStyle = {
  height: '60px',
  width: '60px',
  borderRadius: '40px',
  objectFit: 'cover',
  marginLeft: '4px',
  marginRight: '4px',
  marginTop: '4px',
  cursor: 'pointer',
};

const modalStyle = {
  display: 'flex',
  backdropFilter: 'blur(8px) contrast(70%)',
  backgroundColor: 'rgb(0,0,0)' /* Fallback color */,
  backgroundColor: 'rgba(0,0,0,0.4)',
  zIndex: '150',
  width: '100%' /* Full width */,
  height: '100%' /* Full height */,
  position: 'fixed' /* Fix position on the top-left corner */,
  top: '0',
  left: '0',
  justifyContent: 'center',
  overflow: 'hidden' /* Enable scroll if needed */,
  margin: 'auto',
};

const expandedImg = {
  borderRadius: '10px',
  maxHeight: '600px',
  maxWidth: '800px',
  margin: 'auto',
  overflow: 'hidden',
};

class PhotoMapEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
    };
  }

  render() {
    const { url } = this.props.photo;
    const { expand } = this.state;
    return (
      <div>
        {expand === true && (
          <div
            style={modalStyle}
            aria-hidden="true"
            onClick={() => {
              this.setState({ expand: false });
            }}
          >
            <img src={url} alt="" style={expandedImg} />
          </div>
        )}
        <img
          src={url}
          alt=""
          aria-hidden="true"
          style={imgStyle}
          onClick={() => {
            this.setState({ expand: true });
          }}
        />
      </div>
    );
  }
}

export default PhotoMapEntry;
