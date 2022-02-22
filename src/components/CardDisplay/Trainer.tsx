import React from 'react';
import { Rarity, Type } from 'interfaces';
import styles from './CardDisplay.module.scss';
import { formatText } from './index';
import classnames from 'classnames';

interface Props {
  name?: string,
  description?: string,
  type?: Type,
  subname?: string,
  rarity?: Rarity
}

const TrainerCard: React.FC<Props> = ({ name, description, type, subname, rarity }) => <>
  <span className={styles.name}>{formatText(name)}</span>
  <div className={classnames(styles.descriptionWrapper, {
    [styles.descriptionWrapperTrainerOutline]: !!rarity?.hasVStyle,
  })}>
    <p className={styles.description}>{formatText(description)}</p>
  </div>
  {type?.hasSubname && <span className={styles.subname}>{formatText(subname)}</span>}
</>

export default TrainerCard;
