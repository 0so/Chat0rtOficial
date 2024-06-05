import React from 'react';
import ReactPlayer from 'react-player';

const Video = () => {
  return (
    <div>
      <h1>Video Player</h1>
      <ReactPlayer 
        url='public\2024-06-05 22-34-12.mkv' 
        controls={true} 
        width='100%' 
        height='100%' 
      />
    </div>
  );
};

export default Video;