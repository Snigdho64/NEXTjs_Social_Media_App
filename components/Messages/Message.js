import React, { useState } from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import calculateTime from '../../utils/calculateTime';
export default function Message({
  user,
  message,
  bannerProfilePic,
  divRef,
  deleteMsg,
}) {
  const [showIcon, setShowIcon] = useState(false);
  const ownMessage = message.sender === user._id;
  return (
    <div className="bubbleWrapper" ref={divRef}>
      <div
        className={ownMessage ? 'inclieContainer own' : 'inclieContainer'}
        onClick={() => ownMessage && setShowIcon((p) => !p)}
      >
        <img
          className="inlineIcon"
          src={ownMessage ? user.profilePicUrl : bannerProfilePic}
        />
        <div className={ownMessage ? 'ownBubble own' : 'otherBubble other'}>
          {message.msg}
        </div>
        {showIcon && (
          <Popup
            trigger={
              <Icon
                name="trash"
                color="red"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  deleteMsg(message._id);
                }}
              />
            }
            content="This will only delete the message from your inbox"
            position="top right"
          />
        )}
      </div>
      <span className={ownMessage ? 'own' : 'other'}>
        {calculateTime(message.date)}
      </span>
    </div>
  );
}
