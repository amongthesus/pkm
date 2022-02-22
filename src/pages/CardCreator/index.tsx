import React, { useState, useEffect, useRef, Dispatch, SetStateAction, useCallback } from 'react';
import { Variation, Type, Subtype, Set, Rarity, BaseSet, Rotation, RarityIcon, MoveType, Card, ImportedCard, ImportedMoveType, Supertype } from 'interfaces';
import htmlToImage from 'html-to-image';
import download from 'downloadjs';
import styles from './CardCreator.module.scss';
import CardDisplay from 'components/CardDisplay';
import { Select, Input, Checkbox, ImageInput, EnergyPicker} from 'components/FormElements';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import getCroppedImg from 'cropImage';
import Button from 'components/FormElements/Button';
import { faPaste, faFileDownload, faClipboard, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { cardToImportedCard, getCardImage } from 'utils/card';
import { relativePathPrefix } from 'utils/relativePathPrefix';
import { useSelector, useDispatch } from 'react-redux';
import { selectCardOptions } from 'redux/ducks/cardOptions/selectors';
import { getCardOptions } from 'redux/ducks/cardOptions/actions';

interface Props {
  card?: ImportedCard,
}

const CardCreatorPage: React.FC<Props> = ({ card }) => {
  // Redux
  const dispatch = useDispatch();
  const cardOptions = useSelector(selectCardOptions);

  const importingCard = useRef<boolean>(false);
  const initialImported = useRef<boolean>(false);
  const [importingTrigger, setImportingTrigger] = useState<boolean>(false);
  // Selectors
  const [supertype, setSupertype] = useState<Supertype>();
  const [type, setType] = useState<Type>();
  const [baseSet, setBaseSet] = useState<BaseSet>();
  const [set, setSet] = useState<Set>();
  const [rotation, setRotation] = useState<Rotation>();
  const [variation, setVariation] = useState<Variation>();
  const [subtype, setSubtype] = useState<Subtype>();
  const [rarity, setRarity] = useState<Rarity>();
  const [rarityIcon, setRarityIcon] = useState<RarityIcon>();
  const [weaknessType, setWeaknessType] = useState<Type>();
  const [resistanceType, setResistanceType] = useState<Type>();
  const [raidLevel, setRaidLevel] = useState<number>(1);
  // Selector refs
  const baseSetRef = useRef<HTMLSelectElement>(null);
  const supertypeRef = useRef<HTMLSelectElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const subtypeRef = useRef<HTMLSelectElement>(null);
  const variationRef = useRef<HTMLSelectElement>(null);
  const rarityRef = useRef<HTMLSelectElement>(null);
  const setIconRef = useRef<HTMLSelectElement>(null);
  const rotationRef = useRef<HTMLSelectElement>(null);
  const rarityIconRef = useRef<HTMLSelectElement>(null);
  const weaknessTypeRef = useRef<HTMLSelectElement>(null);
  const resistanceTypeRef = useRef<HTMLSelectElement>(null);
  const raidLevelRef = useRef<HTMLSelectElement>(null);
  // Inputs
  const [name, setName] = useState<string>('');
  const [prevolveName, setPrevolveName] = useState<string>('');
  const [hitpoints, setHitpoints] = useState<number>(100);
  const [subname, setSubname] = useState<string>('');
  const [pokedexEntry, setPokedexEntry] = useState<string>('');
  const [weaknessAmount, setWeaknessAmount] = useState<number>(2);
  const [resistanceAmount, setResistanceAmount] = useState<number>(30);
  const [retreatCost, setRetreatCost] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [illustrator, setIllustrator] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [totalInSet, setTotalInSet] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [imageLayer1, setImageLayer1] = useState<string>('');
  const [imageLayer2, setImageLayer2] = useState<string>('');
  const [typeImage, setTypeImage] = useState<string>('');
  const [prevolveImage, setPrevolveImage] = useState<string>('');
  const [hasCustomSetIcon, setHasCustomSetIcon] = useState<boolean>(false);
  const [customSetIcon, setCustomSetIcon] = useState<string>('');
  // Image cropper
  const [cropArea, setCropArea] = useState<Point>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropImage, setCropImage] = useState<string>('');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({ x: 0, y: 0, height: 0, width: 0 });
  const [currentCropSetter, setCurrentCropSetter] = useState<Dispatch<SetStateAction<string>>>();
  // Ability/Moves
  const [hasAbility, setHasAbility] = useState<boolean>(false);
  const [abilityName, setAbilityName] = useState<string>('');
  const [abilityText, setAbilityText] = useState<string>('');
  const [move1Name, setMove1Name] = useState<string>('');
  const [move1Damage, setMove1Damage] = useState<string>('');
  const [move1Text, setMove1Text] = useState<string>('');
  const [move1Cost, setMove1Cost] = useState<MoveType[]>([]);
  const [hasSecondMove, setHasSecondMove] = useState<boolean>(false);
  const [move2Name, setMove2Name] = useState<string>('');
  const [move2Text, setMove2Text] = useState<string>('');
  const [move2Damage, setMove2Damage] = useState<string>('');
  const [move2Cost, setMove2Cost] = useState<MoveType[]>([]);
  const [move3Name, setMove3Name] = useState<string>('');
  const [move3Text, setMove3Text] = useState<string>('');
  const [move3Damage, setMove3Damage] = useState<string>('');

  const dataInitialised = useCallback((): boolean => !!supertype, [supertype]);

  useEffect(() => {
    dispatch(getCardOptions());
  }, []);

  useEffect(() => {
    if(!dataInitialised()) {
      setSupertype(cardOptions.supertypes[0]);
      setType(cardOptions.types[0]);
      setWeaknessType(cardOptions.types[0]);
      setSet(cardOptions.sets[0]);
      setBaseSet(cardOptions.baseSets[0]);
      setSubtype(cardOptions.subtypes[0]);
      setRotation(cardOptions.rotations[0]);
    }
  }, [cardOptions, dataInitialised]);

  /**
   * Changes the types/subtypes etc to the first available one within their parent
   * For example, when Type is 'Item', and you switch Supertype to 'Pokemon', a Pokémon can't be an Item
   * so it switches to the first available Type within 'Pokemon', which is 'Grass'
   */
  useEffect(() => {
    if(importingCard.current) {
      return;
    }
    if(supertypeRef.current) {
      const { selectedIndex, options } = supertypeRef.current;
      const value: string | undefined = options[selectedIndex]?.value;
      const newSupertype = cardOptions.supertypes.find((a: Supertype) => a.id === +value);
      if(newSupertype && newSupertype !== supertype) {
        setSupertype(newSupertype);
      }
    } else {
      setSupertype(undefined);
    }
    if(typeRef.current) {
      const { selectedIndex, options } = typeRef.current;
      const value: string | undefined = options[selectedIndex]?.value;
      const newType = cardOptions.types.find((a: Type) => a.id === +value);
      if(newType && newType !== type) {
        setType(newType);
      }
    } else {
      setType(undefined);
    }
    if(subtypeRef.current) {
      const { selectedIndex, options } = subtypeRef.current;
      const value: string | undefined = options[selectedIndex]?.value;
      const newSubtype = cardOptions.subtypes.find((a: Subtype) => a.id === +value);
      if(value === 'default' || (newSubtype && newSubtype !== subtype)) {
        setSubtype(newSubtype);
      }
    } else {
      setSubtype(undefined);
    }
    if(variationRef.current) {
      const { selectedIndex, options } = variationRef.current;
      const value: string | undefined = options[selectedIndex]?.value;
      const newVariation = cardOptions.variations.find((a: Variation) => a.id === +value);
      if(newVariation && newVariation !== variation) {
        setVariation(newVariation);
      }
    } else {
      setVariation(undefined);
    }
    if(rarityRef.current) {
      const { selectedIndex, options } = rarityRef.current;
      const value: string | undefined = options[selectedIndex]?.value;
      const newRarity = cardOptions.rarities.find((a: Rarity) => a.id === +value);
      if(value === 'default' || (newRarity && newRarity !== rarity)) {
        setRarity(newRarity);
      }
    } else {
      setRarity(undefined);
    }
  }, [cardOptions, supertype, type, subtype, variation, rarity]);

  /**
   * Turns state data into a Card object
   */
  const makeCard = (): Card => ({
    supertype,
    baseSet,
    type,
    variation,
    subtype,
    rarity,
    name: name || undefined,
    prevolveName: prevolveName || undefined,
    prevolveImage: prevolveImage || undefined,
    hitpoints: hitpoints || undefined,
    subname : subname || undefined,
    typeImage: typeImage || undefined,
    pokedexEntry: pokedexEntry || undefined,
    ability: hasAbility ? {
      name: abilityName,
      text: abilityText,
    } : undefined,
    move1: move1Name ? {
      name: move1Name,
      text: move1Text,
      damage: move1Damage,
      energyCost: move1Cost,
    } : undefined,
    move2: (!hasAbility && hasSecondMove) || supertype?.shortName === 'RaidBoss' ? {
      name: move2Name,
      text: move2Text,
      damage: move2Damage,
      energyCost: move2Cost,
    } : undefined,
    move3: move3Name ? {
      name: move3Name,
      text: move3Text,
      damage: move3Damage,
    } : undefined,
    weaknessType: supertype?.shortName === 'Pokemon' ? weaknessType : undefined,
    weaknessAmount: supertype?.shortName === 'Pokemon' ? weaknessAmount : undefined,
    resistanceType: supertype?.shortName === 'Pokemon' ? resistanceType : undefined,
    resistanceAmount: supertype?.shortName === 'Pokemon' ? resistanceAmount : undefined,
    retreatCost: supertype?.shortName === 'Pokemon' ? retreatCost : undefined,
    illustrator: illustrator || undefined,
    cardNumber: cardNumber || undefined,
    totalInSet: totalInSet || undefined,
    customSetIcon: hasCustomSetIcon && !(supertype?.shortName === 'Energy' && !type?.hasSpecialStyle) && supertype?.shortName !== 'RaidBoss' ? customSetIcon : undefined,
    set: !(supertype?.shortName === 'Energy' && !type?.hasSpecialStyle) && supertype?.shortName !== 'RaidBoss' ? set : undefined,
    rotation: !(supertype?.shortName === 'Energy' && !type?.hasSpecialStyle) && supertype?.shortName !== 'RaidBoss' ? rotation : undefined,
    rarityIcon: !(supertype?.shortName === 'Energy' && !type?.hasSpecialStyle) && supertype?.shortName !== 'RaidBoss' ? rarityIcon : undefined,
    description: description || undefined,
    backgroundImage: backgroundImage || undefined,
    imageLayer1: imageLayer1 || undefined,
    imageLayer2: imageLayer2 || undefined,
    raidLevel: supertype?.shortName === 'RaidBoss' ? raidLevel : undefined,
  });

  const downloadCard = () => {
    const card = document.getElementById('card');
    if(card) {
      htmlToImage.toPng(card)
        .then((dataUrl) => {
          download(dataUrl, `${name || 'card'}${subtype?.hasVSymbol ? ' V' : subtype?.hasVMaxSymbol ? ' VMAX' : ''}.png`);
        })
        .catch(console.error);
    }
  }

  const exportCard = () => {
    const card: Card = makeCard();
    const exportCard: ImportedCard = cardToImportedCard(card);
    navigator.clipboard.writeText(JSON.stringify(exportCard));
  }

  /**
   * Sets all card data, selectors and energy pickers to certain values based on the cardObj parameter
   */
  const importCard = (cardObj: ImportedCard) => {
    importingCard.current = true;
    // Base values
    setName(cardObj.name || '');
    setPrevolveName(cardObj.prevolveName || '');
    setPrevolveImage(relativePathPrefix(cardObj.prevolveImage || ''));
    setHitpoints(cardObj.hitpoints || 0);
    setSubname(cardObj.subname || '');
    setTypeImage(relativePathPrefix(cardObj.typeImage || ''));
    setPokedexEntry(cardObj.pokedexEntry || '');
    setWeaknessAmount(cardObj.weaknessAmount || 0);
    setResistanceAmount(cardObj.resistanceAmount || 0);
    setRetreatCost(cardObj.retreatCost || 0);
    setIllustrator(cardObj.illustrator || '');
    setCardNumber(cardObj.cardNumber || '');
    setTotalInSet(cardObj.totalInSet || '');
    setDescription(cardObj.description || '');
    setBackgroundImage(relativePathPrefix(cardObj.backgroundImage || ''));
    setImageLayer1(relativePathPrefix(cardObj.imageLayer1 || ''));
    setImageLayer2(relativePathPrefix(cardObj.imageLayer2 || ''));
    if(cardObj.customSetIcon) {
      setHasCustomSetIcon(true);
      setCustomSetIcon(cardObj.customSetIcon);
    }
    if(cardObj.ability) {
      setHasAbility(true);
      setAbilityName(cardObj.ability.name);
      setAbilityText(cardObj.ability.text);
    }
    if(cardObj.move1) {
      setMove1Name(cardObj.move1.name);
      setMove1Damage(cardObj.move1.damage);
      setMove1Text(cardObj.move1.text);
      setMove1Cost(cardObj.move1.energyCost.reduce((result: MoveType[], moveType: ImportedMoveType) => {
        const newType: Type | undefined = cardOptions.types.find((a) => a.id === moveType.typeId);
        if(newType) {
          result.push({
            amount: moveType.amount,
            type: newType,
          });
        }
        return result;
      }, []));
    }
    if(cardObj.move2) {
      setHasSecondMove(true);
      setMove2Name(cardObj.move2.name);
      setMove2Damage(cardObj.move2.damage);
      setMove2Text(cardObj.move2.text);
      setMove2Cost(cardObj.move2.energyCost.reduce((result: MoveType[], moveType: ImportedMoveType) => {
        const newType: Type | undefined = cardOptions.types.find((a) => a.id === moveType.typeId);
        if(newType) {
          result.push({
            amount: moveType.amount,
            type: newType,
          });
        }
        return result;
      }, []));
    }
    if(cardObj.move3) {
      setMove3Name(cardObj.move3.name);
      setMove3Damage(cardObj.move3.damage);
      setMove3Text(cardObj.move3.text);
    }
    // Selectors
    const newBaseSet: BaseSet | undefined = cardOptions.baseSets.find((a) => a.id === cardObj.baseSetId);
    if(newBaseSet) {
      setBaseSet(newBaseSet);
      if(baseSetRef.current && newBaseSet) {
        baseSetRef.current.selectedIndex = Array.from(baseSetRef.current.options).findIndex((t) => +t.value === newBaseSet.id);
      }
    } else {
      if(baseSetRef.current) {
        baseSetRef.current.selectedIndex = 0;
      }
      setBaseSet(undefined);
    }
    const newSupertype: Supertype | undefined = cardOptions.supertypes.find((a) => a.id === cardObj.supertypeId);
    if(newSupertype) {
      setSupertype(newSupertype);
      if(supertypeRef.current && newSupertype) {
        supertypeRef.current.selectedIndex = Array.from(supertypeRef.current.options).findIndex((t) => +t.value === newSupertype.id);
      }
    } else {
      if(supertypeRef.current) {
        supertypeRef.current.selectedIndex = 0;
      }
      setSupertype(undefined);
    }
    const newType: Type | undefined = cardOptions.types.find((a) => a.id === cardObj.typeId);
    if(newType) {
      setType(newType);
      if(typeRef.current) {
        typeRef.current.selectedIndex = Array.from(typeRef.current.options).findIndex((t) => +t.value === newType.id);
      }
    } else {
      if(typeRef.current) {
        typeRef.current.selectedIndex = 0;
      }
      setType(undefined);
    }
    if(cardObj.subtypeId) {
      const newSubtype: Subtype | undefined = cardOptions.subtypes.find((a) => a.id === cardObj.subtypeId);
      if(newSubtype) {
        setSubtype(newSubtype);
        if(subtypeRef.current) {
          subtypeRef.current.selectedIndex = Array.from(subtypeRef.current.options).findIndex((t) => +t.value === newSubtype.id);
        }
      }
    } else {
      if(subtypeRef.current) {
        subtypeRef.current.selectedIndex = 0;
      }
      setSubtype(undefined);
    }
    if(cardObj.setId) {
      const newSet: Set | undefined = cardOptions.sets.find((a) => a.id === cardObj.setId);
      if(newSet) {
        setSet(newSet);
        if(setIconRef.current) {
          setIconRef.current.selectedIndex = Array.from(setIconRef.current.options).findIndex((t) => +t.value === newSet.id);
        }
      }
    } else {
      if(setIconRef.current) {
        setIconRef.current.selectedIndex = 0;
      }
      setSet(undefined);
    }
    if(cardObj.weaknessTypeId) {
      const newWeaknessType: Type | undefined = cardOptions.types.find((a) => a.id === cardObj.weaknessTypeId);
      if(newWeaknessType) {
        setWeaknessType(newWeaknessType);
        if(weaknessTypeRef.current) {
          weaknessTypeRef.current.selectedIndex = Array.from(weaknessTypeRef.current.options).findIndex((t) => +t.value === newWeaknessType.id);
        }
      }
    } else {
      if(weaknessTypeRef.current) {
        weaknessTypeRef.current.selectedIndex = 0;
      }
      setWeaknessType(undefined);
    }
    if(cardObj.resistanceTypeId) {
      const newResistanceType: Type | undefined = cardOptions.types.find((a) => a.id === cardObj.resistanceTypeId);
      if(newResistanceType) {
        setResistanceType(newResistanceType);
        if(resistanceTypeRef.current) {
          resistanceTypeRef.current.selectedIndex = Array.from(resistanceTypeRef.current.options).findIndex((t) => +t.value === newResistanceType.id);
        }
      }
    } else {
      if(resistanceTypeRef.current) {
        resistanceTypeRef.current.selectedIndex = 0;
      }
      setResistanceType(undefined);
    }
    if(cardObj.rotationId) {
      const newRotation: Rotation | undefined = cardOptions.rotations.find((a) => a.id === cardObj.rotationId);
      if(newRotation) {
        setRotation(newRotation);
        if(rotationRef.current) {
          rotationRef.current.selectedIndex = Array.from(rotationRef.current.options).findIndex((t) => +t.value === newRotation.id);
        }
      }
    } else {
      if(rotationRef.current) {
        rotationRef.current.selectedIndex = 0;
      }
      setRotation(undefined);
    }
    if(cardObj.variationId) {
      const newVariation: Variation | undefined = cardOptions.variations.find((a) => a.id === cardObj.variationId);
      if(newVariation) {
        setVariation(newVariation);
        if(variationRef.current) {
          variationRef.current.selectedIndex = Array.from(variationRef.current.options).findIndex((t) => +t.value === newVariation.id);
        }
      }
    } else {
      if(variationRef.current) {
        variationRef.current.selectedIndex = 0;
      }
      setVariation(undefined);
    }
    if(cardObj.rarityId) {
      const newRarity: Rarity | undefined = cardOptions.rarities.find((a) => a.id === cardObj.rarityId);
      if(newRarity) {
        setRarity(newRarity);
        if(rarityRef.current) {
          rarityRef.current.selectedIndex = Array.from(rarityRef.current.options).findIndex((t) => +t.value === newRarity.id);
        }
      }
    } else {
      if(rarityRef.current) {
        rarityRef.current.selectedIndex = 0;
      }
      setRarity(undefined);
    }
    if(cardObj.rarityIconId) {
      const newRarityIcon: RarityIcon | undefined = cardOptions.rarityIcons.find((a) => a.id === cardObj.rarityIconId);
      if(newRarityIcon) {
        setRarityIcon(newRarityIcon);
        if(rarityIconRef.current) {
          rarityIconRef.current.selectedIndex = Array.from(rarityIconRef.current.options).findIndex((t) => +t.value === newRarityIcon.id);
        }
      }
    } else {
      if(rarityIconRef.current) {
        rarityIconRef.current.selectedIndex = 0;
      }
      setRarityIcon(undefined);
    }
    if(cardObj.raidLevel) {
      setRaidLevel(cardObj.raidLevel);
      if(raidLevelRef.current) {
        raidLevelRef.current.selectedIndex = Array.from(raidLevelRef.current.options).findIndex((t) => +t.value === cardObj.raidLevel);
      }
    } else {
      if(raidLevelRef.current) {
        raidLevelRef.current.selectedIndex = 0;
      }
      setRaidLevel(1);
    }
    setImportingTrigger(!importingTrigger);
  }

  /**
   * Callback for the function above
   */
  useEffect(() => {
    importingCard.current = false;
  }, [importingTrigger]);

  useEffect(() => {
    // Initially import the prop-card once the selectors have loaded
    if(!initialImported.current && card && subtypeRef.current) {
      importCard(card);
      initialImported.current = true;
    }
  }, [card, importCard]);

  const resetCropper = (newImage: string, imageSetter: () => void) => {
    setCropImage(newImage);
    setCurrentCropSetter(imageSetter);
    setCropArea({ x: 0, y: 0});
    setCroppedAreaPixels({ ...croppedAreaPixels, x: 0, y: 0});
    setCropZoom(1);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.form}>
        <div className={styles.seperator}>
          <Button icon={faPaste} onClick={e => {
            navigator.clipboard.readText()
              .then((value: string) => {
                importCard(JSON.parse(value) as ImportedCard);
              })
              .catch(console.error);
          }}>
            {'Import from clipboard'}
          </Button>
        </div>
        <div className={styles.seperator}>
          <Select name='Base Set' shortName='baseSet' selectRef={baseSetRef} onChange={e => setBaseSet(cardOptions.baseSets.find((a: BaseSet) => a.id === +e.currentTarget.value))}>
            {cardOptions.baseSets.map((value: BaseSet, i: number) =>
              <option value={value.id} key={i}>{value.name}</option>
            )}
          </Select>
          <Select name='Supertype' shortName='supertype' selectRef={supertypeRef} onChange={e => setSupertype(cardOptions.supertypes.find((a: Supertype) => a.id === +e.currentTarget.value))}>
            {cardOptions.supertypes.map((value: Supertype, i: number) =>
              <option value={value.id} key={i}>{value.name}</option>
            )}
          </Select>
          <Select name='Type' shortName='type' selectRef={typeRef} onChange={e => setType(cardOptions.types.find((a: Type) => a.id === +e.currentTarget.value))}>
            {cardOptions.types.map((value: Type, i: number) => {
              if(!value.supertypes.includes(supertype?.id || 0)) {
                return false;
              } else {
                return <option value={value.id} key={i}>{value.name}</option>;
              }
            })}
          </Select>
          {type?.hasSubtypes &&
            <Select name='Subtype' shortName='subtype' selectRef={subtypeRef} onChange={e => setSubtype(cardOptions.subtypes.find((a: Subtype) => a.id === +e.currentTarget.value))}>
              {type?.subtypeOptional && <option value={'default'}>{'Default'}</option>}
              {cardOptions.subtypes.map((value: Subtype, i: number) => {
                if(!value.types.includes(type?.id || 0) || !value.supertypes.includes(supertype?.id || 0)) {
                  return false;
                } else {
                  return <option value={value.id} key={i}>{value.name}</option>;
                }
              })}
            </Select>
          }
          {subtype?.hasVariations &&
            <Select name='Variation' shortName='variation' selectRef={variationRef} onChange={e => setVariation(cardOptions.variations.find((a: Variation) => a.id === +e.currentTarget.value))}>
              {cardOptions.variations.map((value: Variation, i: number) => {
                if(!value.subtypes.includes(subtype?.id || 0)) {
                  return false;
                } else {
                  return <option value={value.id} key={i}>{value.name}</option>;
                }
              })}
            </Select>
          }
          {((supertype?.shortName === 'Pokemon' && (type?.rarities[0] || subtype?.rarities[0] || variation?.rarities[0]) )|| (supertype?.shortName === 'Trainer' && type?.rarities[0])) &&
            <Select name='Rarity' shortName='rarity' selectRef={rarityRef} onChange={e => setRarity(cardOptions.rarities.find((a: Rarity) => a.id === +e.currentTarget.value))}>
              <option value={'default'}>{'Default'}</option>
              {cardOptions.rarities.map((value: Rarity, i: number) => {
                const includesType: boolean = type?.rarities.includes(value.id) || false;
                const includesSubtype: boolean = subtype?.rarities.includes(value.id) || false;
                const includesVariation: boolean = variation?.rarities.includes(value.id) || false;
                if((includesType && (includesSubtype || !subtype) && (includesVariation || !variation))
                  || (includesSubtype && (includesVariation || !variation))
                  || includesVariation) {
                  return <option value={value.id} key={i}>{value.name}</option>;
                } else {
                  return false;
                }
              })}
            </Select>
          }
          {(!(supertype?.shortName === 'Energy' && type?.shortName !== 'Special') && supertype?.shortName !== 'RaidBoss') && <>
            <Select name='Rotation' shortName='rotation' selectRef={rotationRef} onChange={e => setRotation(cardOptions.rotations.find((a: Rotation) => a.id === +e.currentTarget.value))}>
              {cardOptions.rotations.map((value: Rotation, i: number) =>
                <option value={value.id} key={i}>{value.name}</option>
              )}
            </Select>
            <Select name='Rarity Icon' shortName='rarityIcon' selectRef={rarityIconRef} onChange={e => setRarityIcon(cardOptions.rarityIcons.find((a: RarityIcon) => a.id === +e.currentTarget.value))}>
              <option value={'none'}>{'None'}</option>
              {cardOptions.rarityIcons.map((value: RarityIcon, i: number) =>
                <option value={value.id} key={i}>{value.name}</option>
              )}
            </Select>
            <Checkbox name='Custom Set Icon' shortName='customSetIcon' checked={hasCustomSetIcon} setter={setHasCustomSetIcon} />
            {hasCustomSetIcon ?
              <ImageInput shortName='customSetIcon' setter={setCustomSetIcon} />
              :
              <Select name='Set Icon' shortName='set' selectRef={setIconRef} onChange={e => setSet(cardOptions.sets.find((a: Set) => a.id === +e.currentTarget.value))}>
                {cardOptions.sets.map((value: Set, i: number) =>
                  <option value={value.id} key={i}>{value.name}</option>
                )}
              </Select>
            }
          </>}
          {supertype?.shortName === 'RaidBoss' &&
            <Select name='Raid Level' shortName='raidLevel' selectRef={raidLevelRef} onChange={e => setRaidLevel(+e.currentTarget.value)}>
              <option value={1}>{1}</option>
              <option value={2}>{2}</option>
              <option value={3}>{3}</option>
            </Select>
          }
        </div>
        {!(supertype?.shortName === 'Energy' && type?.shortName !== 'Special') && <>
          <div className={styles.seperator}>
            <Input type='text' name='Name' shortName='name' value={name} setter={setName} />
            {(supertype?.shortName === 'Pokemon' || supertype?.shortName === 'RaidBoss') &&
              <Input type='number' name='Hitpoints' shortName='hitpoints' value={hitpoints} setter={setHitpoints} min={0} />
            }
            {supertype?.shortName !== 'RaidBoss' && <>
              {subtype?.hasPrevolve && <>
                <Input type='text' name='Prevolve Name' shortName='prevolveName' value={prevolveName} setter={setPrevolveName} />
                <ImageInput name='Prevolve Image' shortName='prevolveImage' setter={setPrevolveImage} />
              </>}
              {subtype?.hasPokedexEntry &&
                <Input type='text' horizontal name='Pokédex Entry' shortName='pokedexEntry' value={pokedexEntry} setter={setPokedexEntry} />
              }
              {type?.hasSubname &&
                <Input type='text' name='Subname' shortName='subname' value={subname} setter={setSubname} />
              }
            </>}
          </div>
          {(supertype?.shortName === 'Pokemon' || supertype?.shortName === 'RaidBoss') && <>
            {supertype.shortName !== 'RaidBoss' &&
              <div className={styles.seperator}>
                <Checkbox name='Has Ability' shortName='hasAbility' checked={hasAbility} setter={setHasAbility} />
                {hasAbility && <>
                  <Input type='text' name='Ability Name' shortName='abilityName' value={abilityName} setter={setAbilityName} />
                  <Input type='textarea' name='Ability Text' shortName='abilityText' value={abilityText} setter={setAbilityText} />
                </>}
              </div>
            }
            <div className={styles.seperator}>
              <Input type='text' name='Move Name' shortName='move1Name' value={move1Name} setter={setMove1Name} />
              <Input type='text' name='Move Damage' shortName='move1Damage' value={move1Damage} setter={setMove1Damage} />
              <Input type='textarea' horizontal name='Move Text' shortName='move1Text' value={move1Text} setter={setMove1Text} />
              {supertype.shortName !== 'RaidBoss' &&
                <EnergyPicker label={'Move Cost'} types={cardOptions.types} moveCost={move1Cost} setMoveCost={setMove1Cost} />
              }
            </div>
            {(!hasAbility || supertype.shortName === 'RaidBoss') &&
              <div className={styles.seperator}>
                {supertype.shortName !== 'RaidBoss' &&
                  <Checkbox name='Has Second Move' shortName='hasSecondMove' checked={hasSecondMove} setter={setHasSecondMove} />
                }
                {(hasSecondMove || supertype.shortName === 'RaidBoss') && <>
                  <Input type='text' name='Move Name' shortName='move2Name' value={move2Name} setter={setMove2Name} />
                  <Input type='text' name='Move Damage' shortName='move2Damage' value={move2Damage} setter={setMove2Damage} />
                  <Input type='textarea' name='Move Text' shortName='move2Text' value={move2Text} setter={setMove2Text} />
                  {supertype.shortName !== 'RaidBoss' &&
                    <EnergyPicker label={'Move Cost'} types={cardOptions.types} moveCost={move2Cost} setMoveCost={setMove2Cost} />
                }
                </>}
              </div>
            }
            {supertype.shortName === 'RaidBoss' &&
              <div className={styles.seperator}>
                <Input type='text' name='Move Name' shortName='move2Name' value={move3Name} setter={setMove3Name} />
                <Input type='text' name='Move Damage' shortName='move2Damage' value={move3Damage} setter={setMove3Damage} />
                <Input type='textarea' name='Move Text' shortName='move2Text' value={move3Text} setter={setMove3Text} />
              </div>
            }
          </>}
          {supertype?.shortName === 'Pokemon' && <>
            <div className={styles.seperator}>
              <Select name='Weakness Type' shortName='weaknessType' selectRef={weaknessTypeRef} onChange={e => setWeaknessType(cardOptions.types.find((a: Type) => a.id === +e.currentTarget.value))}>
                {cardOptions.types.map((value: Type, i: number) => {
                  if(!value.isEnergy) {
                    return false;
                  } else {
                    return <option value={value.id} key={i}>{value.name}</option>;
                  }
                })}
              </Select>
              <Input type='number' name='Weakness Amount' shortName='weaknessAmount' value={weaknessAmount} setter={setWeaknessAmount} max={999} min={0} />
              <Select name='Resistance Type' shortName='resistanceType' selectRef={resistanceTypeRef} onChange={e => setResistanceType(cardOptions.types.find((a: Type) => a.id === +e.currentTarget.value))}>
                <option value={'none'}>{'None'}</option>
                {cardOptions.types.map((value: Type, i: number) => {
                  if(!value.isEnergy) {
                    return false;
                  } else {
                    return <option value={value.id} key={i}>{value.name}</option>;
                  }
                })}
              </Select>
              {resistanceType &&
                <Input type='number' name='Resistance Amount' shortName='resistanceAmount' value={resistanceAmount} setter={setResistanceAmount} max={999} min={0} />
              }
              <Input type='number' name='Retreat Cost' shortName='retreatCost' value={retreatCost} setter={(newValue: number) => setRetreatCost(Math.round(newValue))} max={5} min={0} />
            </div>
          </>}
          {(!subtype?.noDescription && supertype?.shortName !== 'RaidBoss') &&
            <div className={styles.seperator}>
              <Input type='textarea' name='Description' shortName='description' value={description} setter={setDescription} />
            </div>
          }
          <div className={styles.seperator}>
            {supertype?.shortName !== 'Energy' && supertype?.shortName !== 'RaidBoss' &&
              <Input type='text' name='Illustrator' shortName='illustrator' value={illustrator} setter={setIllustrator} />
            }
            <Input type='text' name='Card Number' shortName='cardNumber' value={cardNumber} setter={setCardNumber} />
            {supertype?.shortName !== 'RaidBoss' &&
              <Input type='text' name='Total In Set' shortName='totalInSet' value={totalInSet} setter={setTotalInSet} />
            }
          </div>
        </>}
        <div className={styles.seperator}>
          <span className={styles.info}>{'Card dimensions are 747w × 1038h'}</span>
          {currentCropSetter &&
            <>
              <div className={styles.cropperWrapper}>
                <Cropper
                  image={cropImage}
                  crop={cropArea}
                  zoom={cropZoom}
                  cropSize={{ width: 320, height: 444.66 }} // Based on aspect ratio
                  maxZoom={100}
                  minZoom={.1}
                  restrictPosition={false}
                  zoomSpeed={.1}
                  aspect={747 / 1038}
                  onCropChange={(location: Point) => setCropArea(location)}
                  onCropComplete={async (croppedArea: Area, cap: Area) => setCroppedAreaPixels(cap)}
                  onZoomChange={(newZoom: number) => setCropZoom(newZoom)}
                />
                <img alt='' src={getCardImage({baseSet: baseSet?.shortName, type: type?.shortName, rarity: rarity?.shortName, subtype: subtype?.shortName, supertype: supertype?.shortName, variation: variation?.shortName})} className={styles.cropperImage} />
              </div>
              <Button icon={faCheckSquare} className={styles.buttonCrop} onClick={async () => {
                const croppedImage = await getCroppedImg(cropImage, croppedAreaPixels);
                currentCropSetter && currentCropSetter(croppedImage);
              }}>
                {'Apply crop'}
              </Button>
            </>
          }
          <ImageInput name='Background Image' shortName='backgroundImage' info='Placed behind everything'
            setter={setBackgroundImage}
            croppable cropperSetter={resetCropper}
          />
          <ImageInput name='Card Image' shortName='imageLayer1' info='Placed in front of background'
            setter={setImageLayer1}
            croppable cropperSetter={resetCropper}
          />
          <ImageInput name='Top Image' shortName='imageLayer2' info='Placed on top of the card image'
            setter={setImageLayer2}
            croppable cropperSetter={resetCropper}
          />
          {supertype?.shortName === 'Energy' &&
            <ImageInput name='Type Image' shortName='typeImage' info="The energy's top right icon" setter={setTypeImage} />
          }
        </div>
        <div className={styles.seperator}>
          <Button icon={faFileDownload} className={styles.buttonDownload} onClick={downloadCard}>{'Download as image'}</Button>
          <Button icon={faClipboard} onClick={exportCard}>{'Export to clipboard'}</Button>
        </div>
      </div>
      <div className={styles.cardWrapper}>
        <CardDisplay card={makeCard()} />
      </div>
    </div>
  )
}

export default CardCreatorPage;
