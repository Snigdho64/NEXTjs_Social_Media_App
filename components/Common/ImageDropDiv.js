import React from 'react';
import { useRouter } from 'next/dist/client/router';
import { Form, Header, Icon, Image, Segment } from 'semantic-ui-react';

export default function ImageDropDiv({
  highlighted,
  setHighlighted,
  inputRef,
  onChange,
  mediaPreview,
  setMediaPreview,
  setMedia,
  profilePicUrl,
}) {
  const router = useRouter();
  const isSignupRoute = router.pathname === '/signup';
  return (
    <>
      <Form.Field>
        <Segment placeholder basic secondary>
          <input
            style={{ display: 'none' }}
            type="file"
            accept="image/*"
            onChange={onChange}
            name="media"
            ref={inputRef}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setHighlighted(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setHighlighted(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setHighlighted(true);
              console.log(e);
              const droppedFile = Array.from(e.dataTransfer.files);
              setMedia(droppedFile[0]);
              setMediaPreview(URL.createObjectURL(droppedFile[0]));
            }}
          >
            {mediaPreview === null ? (
              <>
                <Segment
                  {...(highlighted && { color: 'green' })}
                  placeholder
                  basic
                >
                  {isSignupRoute ? (
                    <Header icon>
                      <Icon
                        name="file image outline"
                        style={{ cursor: 'pointer' }}
                        onClick={() => inputRef.current.click()}
                      />
                      Drag n Drop or Click To Upload Image
                    </Header>
                  ) : (
                    <span style={{ textAlign: 'center' }}>
                      <Image
                        src={profilePicUrl}
                        alt="Profile Pic"
                        style={{ cursor: 'pointer' }}
                        onClick={() => inputRef.current.click()}
                        size="huge"
                        centered
                      />
                    </span>
                  )}
                </Segment>
              </>
            ) : (
              <>
                <Segment color="green" placeholder basic>
                  <Image
                    src={mediaPreview}
                    size="medium"
                    centered
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      inputRef.current.click();
                    }}
                  />
                </Segment>
              </>
            )}
          </div>
        </Segment>
      </Form.Field>
    </>
  );
}
