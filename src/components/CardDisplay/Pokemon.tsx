import React, { useEffect } from 'react';
import { Card, Move, MoveType } from 'interfaces';
import styles from './CardDisplay.module.scss';
import { formatText } from './index';
import { relativePathPrefix } from 'utils/relativePathPrefix';
import classnames from 'classnames';

interface Props {
  card: Card,
}

const PokemonCard: React.FC<Props> = ({ card }) => {
  const getMoveTotalCost = (move: Move) => move.energyCost.reduce((acc: number, currentValue: MoveType) => acc += currentValue.amount, 0);

  useEffect(() => {
    if(card.move1 && card.move2) {
      let highestCost = Math.max(getMoveTotalCost(card.move1), getMoveTotalCost(card.move2));

      const moveNames: HTMLElement[] = document.querySelectorAll('.moveName') as unknown as HTMLElement[];
      const initialLeft = +styles.moveNameLeft.substr(0, styles.moveNameLeft.length - 1);
      moveNames.forEach((moveName) => {
        moveName.style.left = `${Math.max(initialLeft, initialLeft + ((highestCost - 4) * 7))}%`;
      });
    }
  }, [card.move1, card.move2]);

  const formatMoveCost = (move: Move) => {
    let totalAmount: number = 0;
    const moveImages = move.energyCost.map((moveType) => {
      const returnValue: JSX.Element[] = [];
      for(let i = 0; i < moveType.amount; i++) {
        totalAmount++;
        returnValue.push(<img src={relativePathPrefix(`/assets/icons_symbols/types/${moveType.type.shortName}_border.png`)} className={styles.moveEnergy} alt='' key={i} />);
      }
      return returnValue;
    });

    if(totalAmount === 0) {
      return <img src={relativePathPrefix('/assets/icons_symbols/types/Empty_border.png')} className={styles.moveEnergy} alt='' />;
    } else {
      return moveImages;
    }
  }

  const formatMove = (move: Move, firstMove?: boolean): JSX.Element =>
    <div className={classnames({
      [styles.moveMultiple]: firstMove && card.move2,
      [styles.move]: firstMove && !card.move2,
      [styles.moveV]: card.subtype?.hasVStyle || card.rarity?.hasVStyle,
    })}>
      {move.name &&
        <div className={styles.moveNameWrapper}>
          <div className={styles.moveCost}>
            {formatMoveCost(move)}
          </div>
          <span className={classnames(styles.moveName, 'moveName')}>{move.name}</span>
          <span className={styles.moveDamage}>{move.damage}</span>
        </div>
      }
      <p className={classnames(styles.moveText, {
        [styles.moveTextV]: card.subtype?.hasVStyle,
      })}>{formatText(move.text)}</p>
    </div>

  return <>
    <span className={classnames(styles.name, styles.namePokemon, {
      [styles.nameOutline]: card.rarity?.hasNameOutline || card.subtype?.hasNameOutline,
    })}>
      {formatText(card.name)}
      {card.subtype?.hasVSymbol && <img src={relativePathPrefix('/assets/icons_symbols/other/v_icon.png')} className={styles.nameIcon} alt='' />}
      {card.subtype?.hasVMaxSymbol && <img src={relativePathPrefix('/assets/icons_symbols/other/vmax_icon.png')} className={styles.nameIcon} alt='' />}
      {card.rarity?.hasStarSymbol && <img src={relativePathPrefix('/assets/icons_symbols/other/star_icon.png')} className={styles.nameIconStar} alt='' />}
    </span>
    <div className={classnames(styles.hitpointsWrapper, {
      [styles.hitpointsWrapperV]: card.subtype?.hasVStyle,
      [styles.hitpointsWrapperBlackOutline]: card.rarity?.hasVStyle,
    })}>
      <span className={styles.hitpointsHP}>HP</span>
      <span className={styles.hitpoints}>{card.hitpoints && card.hitpoints <= 999 ? card.hitpoints : 999}</span>
    </div>
    {(card.subtype?.hasPrevolve && card.prevolveName) &&
      <span className={styles.prevolveName}>{'Evolves from '}{formatText(card.prevolveName)}</span>
    }
    {(card.subtype?.hasPokedexEntry && !card.rarity?.hasVStyle && card.pokedexEntry) &&
      <span className={styles.pokedexEntry}>{card.pokedexEntry}</span>
    }
    <div className={classnames(styles.movesWrapper, {
      [styles.movesWrapperV]: card.subtype?.hasVStyle || card.rarity?.hasVStyle,
    })}>
      {card.ability &&
        <div className={styles.ability}>
          <div className={styles.abilityNameWrapper}>
            {card.subtype?.hasVStyle ?
              <img className={classnames(styles.abilityIcon, styles.abilityIconV)} src={relativePathPrefix('/assets/icons_symbols/other/ability_v.png')} alt='' />
              :
              <img className={styles.abilityIcon} src={relativePathPrefix('/assets/icons_symbols/other/ability.png')} alt='' />
            }
            <span className={classnames(styles.moveName, 'moveName')}>{card.ability.name}</span>
          </div>
          <p className={styles.abilityText}>{formatText(card.ability.text)}</p>
        </div>
      }
      {card.move1 && formatMove(card.move1, true)}
      {card.move2 && formatMove(card.move2)}
    </div>
    <div className={classnames(styles.typeBar, {
      [styles.whiteText]: !card.rarity?.hasBlackTopText && card.subtype?.hasWhiteTopText,
    })}>
      {card.weaknessType &&
        <span className={styles.weakness}>
          <img className={styles.weaknessIcon} src={relativePathPrefix(`/assets/icons_symbols/types/${card.weaknessType.shortName}.png`)} alt='' />
          <span>×{card.weaknessAmount && card.weaknessAmount < 100 ? card.weaknessAmount : 99}</span>
        </span>
      }
      {card.resistanceType &&
        <span className={styles.resistance}>
          <img className={styles.resistanceIcon} src={relativePathPrefix(`/assets/icons_symbols/types/${card.resistanceType.shortName}.png`)} alt='' />
          <span>-{card.resistanceAmount && card.resistanceAmount < 100 ? card.resistanceAmount : 99}</span>
        </span>
      }
      <div className={styles.retreatCost}>
        {card.retreatCost ? Array.from(Array(card.retreatCost >= 0 ? card.retreatCost : 0), (e, i) =>
          i < 5 && <img key={i} className={styles.retreatCostIcon} src={relativePathPrefix('/assets/icons_symbols/types/Colorless.png')} alt='' />
        ) : null}
      </div>
    </div>
    {!card.subtype?.noDescription &&
      <div className={classnames(styles.descriptionWrapper, styles.descriptionWrapperPokemon, {
        [styles.descriptionWrapperPokemonOutline]: card.rarity?.hasVStyle,
      })}>
        <p className={styles.description}>{formatText(card.description)}</p>
      </div>
    }
    {(card.subtype?.hasPrevolve && card.prevolveImage) &&
      <div className={styles.prevolveImageWrapper}>
        <img src={card.prevolveImage} className={styles.prevolveImage} alt='' />
      </div>
    }
  </>
}

export default PokemonCard;
