// @flow
import React from 'react';

const styles = {
  selectContainer: {
    width: '250px',
    alignSelf: 'center',
    margin: '20px',
  }
}

type Props = {
  botType: string,
  onChangeChoice: () => Promise<void>,
};

const BotChoice = (props: Props) => {
  return (
    <div style={styles.selectContainer}>
      <select name="botChoice" onChange={props.onChangeChoice} value={props.botType}>
        <option value="NN">Réseau de neurones dense</option>
        <option value="CNN">Réseau de neurones convolutionnel</option>
      </select>
    </div>
  )
};

export default BotChoice;
