export interface ImagePathOptions {
  supertype?: string,
  baseSet?: string,
  type?: string,
  subtype?: string,
  variation?: string,
  rarity?: string,
}

interface GenericInterface {
  id: number,
  shortName: string,
  name: string,
}

export interface Supertype extends GenericInterface {};

export interface RarityIcon extends GenericInterface {};

export interface Rarity extends GenericInterface {
  types: number[],
  subtypes: number[],
  variations: number[],
  hasNameOutline?: boolean,
  hasBlackTopText?: boolean,
  hasVStyle?: boolean,
  hasStarSymbol?: boolean,
}

export interface Variation extends GenericInterface {
  subtypes: number[],
  rarities: number[],
}

export interface Subtype extends GenericInterface {
  supertypes: number[],
  types: number[],
  hasVariations: boolean,
  hasPrevolve?: boolean,
  noDescription?: boolean,
  hasPokedexEntry?: boolean,
  hasWhiteTopText?: boolean,
  hasVStyle?: boolean,
  hasVSymbol?: boolean,
  hasVMaxSymbol?: boolean,
  hasNameOutline?: boolean,
  rarities: number[],
}

export interface Set extends GenericInterface {
  number: number,
}

export interface BaseSet extends GenericInterface {
  subSets: Set[],
}

export interface Rotation extends GenericInterface {
  subSets: Set[],
}

export interface Type extends GenericInterface {
  supertypes: number[],
  hasSubtypes?: boolean,
  subtypeOptional?: boolean,
  hasSubname?: boolean,
  rarities: number[],
  hasWhiteText?: boolean,
  hasSpecialStyle?: boolean,
  isEnergy?: boolean,
}

export interface CardOptions {
  supertypes: Supertype[],
  baseSets: BaseSet[],
  rarities: Rarity[],
  variations: Variation[],
  subtypes: Subtype[],
  sets: Set[],
  types: Type[],
  rotations: Rotation[],
  rarityIcons: RarityIcon[],
}

export interface BaseMoveType {
  amount: number,
}

export interface MoveType extends BaseMoveType {
  type: Type,
}

export interface ImportedMoveType extends BaseMoveType {
  typeId: number,
}

export interface BaseMove {
  name: string,
  damage: string,
  text: string,
}

export interface Move extends BaseMove {
  energyCost: MoveType[],
}

export interface ImportedMove extends BaseMove {
  energyCost: ImportedMoveType[],
}

export interface User {
  id: number,
  displayName: string,
  email: string,
  photo: string,
}

interface BaseCard {
  name?: string,
  subname?: string,
  backgroundImage?: string,
  imageLayer1?: string,
  imageLayer2?: string,
  typeImage?: string,
  customSetIcon?: string,
  cardNumber?: string,
  totalInSet?: string,
  hitpoints?: number,
  illustrator?: string,
  weaknessAmount?: number,
  resistanceAmount?: number,
  retreatCost?: number,
  ability?: {
    name: string,
    text: string,
  },
  prevolveName?: string,
  prevolveImage?: string,
  pokedexEntry?: string,
  description?: string,
  raidLevel?: number,
}

export interface Card extends BaseCard {
  supertype?: Supertype,
  baseSet?: BaseSet,
  set?: Set,
  type?: Type,
  weaknessType?: Type,
  resistanceType?: Type,
  subtype?: Subtype,
  rarity?: Rarity,
  variation?: Variation,
  rotation?: Rotation,
  rarityIcon?: RarityIcon,
  move1?: Move,
  move2?: Move,
  move3?: BaseMove,
}

export interface ImportedCard extends BaseCard {
  supertypeId?: number,
  baseSetId?: number,
  setId?: number,
  typeId?: number,
  weaknessTypeId?: number,
  resistanceTypeId?: number,
  subtypeId?: number,
  rarityId?: number,
  variationId?: number,
  rotationId?: number,
  rarityIconId?: number,
  move1?: ImportedMove,
  move2?: ImportedMove,
  move3?: BaseMove,
}
