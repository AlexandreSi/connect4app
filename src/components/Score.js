// @flow
import React from 'react';

const styles = {
  scoreContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }
}

type Props = {
  gamesPlayed: number,
  gamesWon: number,
};


const ScoreDisplay = (props: Props) => {
  if (props.gamesPlayed !== 0) {
    return (
      <div style={styles.scoreContainer}>
        {`Vous avez gagné ${props.gamesWon} parties sur ${props.gamesPlayed}`}
      </div>
    );
  } else return '';
};

export default ScoreDisplay;
